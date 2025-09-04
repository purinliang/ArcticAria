import { getAuthenticatedUser } from './utils.js';

/**
 * Gets a personalized feed of recommendations for the user.
 * It fetches items from a specific category that the user has not disliked
 * and are due for a reminder.
*/
export async function getPersonalizedFeed(request, env, logger) {
    const user = await getAuthenticatedUser(request, env, logger);
    if (!user) {
        logger.warn('Unauthorized attempt to get feed');
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const url = new URL(request.url);
        const category = url.searchParams.get('category');
        const limit = parseInt(url.searchParams.get('limit') || '10', 10);

        if (!category) {
            logger.warn('getPersonalizedFeed called without category');
            return new Response('Category parameter is required', { status: 400 });
        }

        logger.debug({ userId: user.userId, category, limit }, 'Fetching personalized feed');

        // This query is the core of the recommendation logic.
        // It joins recommendations with the user's feedback and filters based on interaction history.
        const { results } = await env.DB.prepare(
            `
            SELECT r.*
           FROM recommendations r
           LEFT JOIN recommendation_feedbacks rf ON r.id = rf.recommendation_id AND rf.user_id = ?1
           WHERE r.category = ?
             AND r.is_public = 1
              -- Exclude items the user has disliked or already liked
             AND (rf.last_interaction_type IS NULL OR rf.last_interaction_type NOT IN ('favorite', 'dislike', 'report'))
            ORDER BY rf.reminder_countdown_hours ASC, r.overall_weight DESC
           LIMIT ?
       `
        )
            .bind(user.userId, category, limit)
            .all();

        logger.info({ userId: user.userId, category, count: results.length }, 'Personalized feed retrieved');
        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        logger.error({ errMessage: err?.message, errStack: err?.stack }, 'Error in getPersonalizedFeed');
        return new Response('Internal Server Error', { status: 500 });
    }
}

// A function to get the user's "favorites" (liked items) could be added here.
// It would be a simpler query on the recommendation_feedbacks table.