import { getAuthenticatedUser } from './utils.js';

/**
 * Gets a user's list of favorite recommendations.
 * Favorites are defined as items with a high interaction_weight.
 */
export async function getFavorites(request, env, logger) {
    const user = await getAuthenticatedUser(request, env, logger);
    if (!user) {
        logger.warn('Unauthorized attempt to get favorites');
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const url = new URL(request.url);
        const category = url.searchParams.get('category');

        let query = `
            SELECT r.*, rf.interaction_weight
            FROM recommendations r
            JOIN recommendation_feedbacks rf ON r.id = rf.recommendation_id
            WHERE rf.user_id = ?1 AND rf.last_interaction_type = 'favorite'
            AND datetime('now') <= datetime(rf.updated_at,
                CASE
                    WHEN rf.interaction_weight >= 50 THEN '+30 days'
                    WHEN rf.interaction_weight >= 45 THEN '+20 days'
                    WHEN rf.interaction_weight >= 40 THEN '+15 days'
                    WHEN rf.interaction_weight >= 35 THEN '+10 days'
                    WHEN rf.interaction_weight >= 30 THEN '+7 days'
                    WHEN rf.interaction_weight >= 25 THEN '+5 days'
                    WHEN rf.interaction_weight >= 20 THEN '+3 days'
                    WHEN rf.interaction_weight >= 15 THEN '+2 days'
                    WHEN rf.interaction_weight >= 10 THEN '+1 days'
                    ELSE '-1 day' -- Expired if somehow it's a favorite but < 10
                END
            )
        `;
        const params = [user.userId];

        if (category) {
            query += ' AND r.category = ?2';
            params.push(category);
        }

        query += ' ORDER BY rf.interaction_weight DESC, r.title ASC';

        const { results } = await env.DB.prepare(query).bind(...params).all();

        logger.info({ userId: user.userId, count: results.length }, 'Fetched user favorites');
        return new Response(JSON.stringify(results), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        logger.error({ errMessage: err?.message, errStack: err?.stack }, 'Error in getFavorites');
        return new Response('Internal Server Error', { status: 500 });
    }
}
