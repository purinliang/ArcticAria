import { getAuthenticatedUser } from './utils.js';

const MAX_WEIGHT = 100;
const MIN_WEIGHT = -100;

/**
 * Processes user feedback on a recommendation.
 * This function calculates the change in weight and updates both the user-specific feedback
 * and the recommendation's overall weight atomically.
 */
export async function handleFeedback(request, env, logger) {
    const user = await getAuthenticatedUser(request, env, logger);
    if (!user) {
        logger.warn('Unauthorized attempt to submit feedback');
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const { recommendationId, interactionType, comment } = await request.json();

        const validInteractionTypes = ['favorite', 'like', 'indifferent', 'dislike', 'report'];
        if (!recommendationId || !interactionType || !validInteractionTypes.includes(interactionType)) {
            logger.warn({ body: await request.text() }, 'Missing recommendationId or invalid interactionType in handleFeedback');
            return new Response('Missing recommendationId or invalid interactionType', { status: 400 });
        }

        // Fetch the previous feedback to correctly adjust the overall weight and calculate new values.
        const existingFeedback = await env.DB.prepare(
            `SELECT interaction_weight, reminder_countdown_hours FROM recommendation_feedbacks WHERE user_id = ? AND recommendation_id = ?`
        ).bind(user.userId, recommendationId).first();

        const oldWeight = existingFeedback ? existingFeedback.interaction_weight : 0.0;
        let newWeight = oldWeight;
        let newCountdownHours;

        // New, more detailed weighting and countdown logic
        switch (interactionType) {
            case 'favorite':
                // A favorite action adds +5, but ensures the score is at least 10.
                // This interpretation resolves the ambiguity of "if +5 is less than 10, supplement to 5".
                // It ensures 'favorite' is always a strong positive action.
                newWeight = Math.max(10, oldWeight + 5);
                newCountdownHours = 24 * 60; // Reset countdown to 60 days
                break;
            case 'like':
                newWeight = oldWeight + 1;
                newCountdownHours = 24 * 60; // Reset countdown to 60 days
                break;
            case 'indifferent':
                newWeight = oldWeight - 0.25;
                newCountdownHours = existingFeedback ? existingFeedback.reminder_countdown_hours * 2 : 48;
                newCountdownHours = Math.min(newCountdownHours, 180 * 24); // Cap at 180 days
                break;
            case 'dislike':
                newWeight = -100.0;
                newCountdownHours = 24 * 365 * 10; // Effectively infinite
                break;
            case 'report':
                newWeight = -100.0; // Per request, same as dislike but could trigger other actions
                newCountdownHours = 24 * 365 * 10;
                // In a real system, this would also trigger a moderation queue entry
                break;
        }

        // Clamp the new weight between the min and max values
        newWeight = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, newWeight));

        const weightDelta = newWeight - oldWeight;

        logger.debug(
            { userId: user.userId, recommendationId, oldWeight, newWeight, delta: weightDelta, newCountdownHours },
            'Calculating weight delta for feedback'
        );

        const feedbackId = crypto.randomUUID();
        const nowISO = new Date().toISOString();

        // Use a transaction to update both tables atomically
        await env.DB.batch([
            // 1. UPSERT feedback for this user and recommendation
            env.DB.prepare(
                `
                INSERT INTO recommendation_feedbacks (id, user_id, recommendation_id, comment, interaction_weight, reminder_countdown_hours, last_interaction_type, last_recalculated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(user_id, recommendation_id) DO UPDATE SET
                    comment = excluded.comment,
                    interaction_weight = excluded.interaction_weight,
                    reminder_countdown_hours = excluded.reminder_countdown_hours,
                    last_interaction_type = excluded.last_interaction_type,
                    last_recalculated_at = excluded.last_recalculated_at,
                    updated_at = CURRENT_TIMESTAMP
            `
            ).bind(feedbackId, user.userId, recommendationId, comment || null, newWeight, newCountdownHours, interactionType, nowISO),

            // 2. Update the overall weight on the recommendation itself using the calculated delta
            env.DB.prepare(`UPDATE recommendations SET overall_weight = overall_weight + ? WHERE id = ?`).bind(weightDelta, recommendationId),
        ]);

        logger.info({ userId: user.userId, recommendationId, interactionType }, 'Feedback processed successfully');
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        logger.error({ errMessage: err?.message, errStack: err?.stack }, 'Error in handleFeedback');
        return new Response('Internal Server Error', { status: 500 });
    }
}