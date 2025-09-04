import { getAuthenticatedUser } from './utils.js';

/**
 * Recalculates the reminder countdown for all of a user's feedback entries.
 * This should be called when the user visits the Discover page.
 */
export async function recalculateFeedCountdown(request, env, logger) {
    const user = await getAuthenticatedUser(request, env, logger);
    if (!user) {
        logger.warn('Unauthorized attempt to recalculate feed');
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        // Get all feedback entries for the user to find the time elapsed since last calculation
        const allUserFeedback = await env.DB.prepare(`SELECT * FROM recommendation_feedbacks WHERE user_id = ?`).bind(user.userId).all();

        if (!allUserFeedback.results || allUserFeedback.results.length === 0) {
            logger.info({ userId: user.userId }, 'No feedback to recalculate.');
            return new Response(JSON.stringify({ success: true, updated: 0 }), { status: 200 });
        }

        const now = new Date();
        const statements = allUserFeedback.results.map((feedback) => {
            const lastRecalculated = new Date(feedback.last_recalculated_at);
            const hoursElapsed = (now - lastRecalculated) / (1000 * 60 * 60);

            // --- Countdown Decay ---
            // Time "passes" faster for items based on their weight.
            // weight 0 = 1x speed, 10 = 2x, 20 = 4x, etc.
            const decayRateMultiplier = Math.pow(2, feedback.interaction_weight / 10);
            const hoursToReduce = hoursElapsed * decayRateMultiplier;
            const newCountdown = Math.max(0, feedback.reminder_countdown_hours - hoursToReduce);

            // --- Preference Decay (with random perturbation) ---
            // Slowly move weight towards 0 for non-extreme interactions to keep the feed fresh.
            let newWeight = feedback.interaction_weight;
            const nonDecayingTypes = ['favorite', 'dislike', 'report'];
            if (!nonDecayingTypes.includes(feedback.last_interaction_type)) {
                // Base daily decay rate with a random factor
                const dailyDecayRate = 0.1 * (0.25 + Math.random()); // Decay between 0.025 and 0.125 per day
                const decayAmount = Math.sign(newWeight) * dailyDecayRate * (hoursElapsed / 24);
                const tempWeight = newWeight - decayAmount;
                // Prevent weight from crossing zero due to decay
                if (Math.sign(tempWeight) !== Math.sign(newWeight)) {
                    newWeight = 0;
                } else {
                    newWeight = tempWeight;
                }
            }

            return env.DB.prepare(
                `UPDATE recommendation_feedbacks SET reminder_countdown_hours = ?, interaction_weight = ?, last_recalculated_at = ? WHERE id = ?`
            ).bind(newCountdown, newWeight, now.toISOString(), feedback.id);
        });

        await env.DB.batch(statements);
        logger.info({ userId: user.userId, count: statements.length }, 'Successfully recalculated feed countdowns.');
        return new Response(JSON.stringify({ success: true, updated: statements.length }), { status: 200 });
    } catch (err) {
        logger.error({ errMessage: err?.message, errStack: err?.stack }, 'Error in recalculateFeedCountdown');
        return new Response('Internal Server Error', { status: 500 });
    }
}
