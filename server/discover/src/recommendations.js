import { getAuthenticatedUser } from './utils.js';
import { z } from 'zod';

/**
 * Creates a new public recommendation item.
 * For now, any authenticated user can create one. This could be restricted later.
 */
export async function createRecommendation(request, env, logger) {
    const user = await getAuthenticatedUser(request, env, logger);
    if (!user) {
        logger.warn('Unauthorized attempt to create recommendation');
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const schema = z.object({
            title: z.string().min(1, 'Title is required'),
            description: z.string().optional(),
            category: z.string().min(1, 'Category is required'),
            imageUrls: z.array(z.string().url()).max(50).optional(),
            isPublic: z.boolean().default(true),
        });

        const body = await request.json();
        const validation = schema.safeParse(body);

        if (!validation.success) {
            logger.warn({ errors: validation.error.flatten() }, 'Invalid data for createRecommendation');
            return new Response(JSON.stringify({ errors: validation.error.flatten() }), { status: 400 });
        }

        const { title, description, category, imageUrls, isPublic } = validation.data;

        const recommendationId = crypto.randomUUID();
        const imageUrlsJson = imageUrls ? JSON.stringify(imageUrls) : null;

        await env.DB.prepare(
            `
            INSERT INTO recommendations (id, user_id, title, description, category, image_urls, is_public)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `
        )
            .bind(recommendationId, user.userId, title, description || null, category, imageUrlsJson, isPublic ? 1 : 0)
            .run();

        logger.info({ recommendationId, userId: user.userId }, 'Recommendation created successfully');
        return new Response(JSON.stringify({ success: true, id: recommendationId }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) { // Catches both JSON parsing errors and DB errors
        logger.error({ errMessage: err?.message, errStack: err?.stack }, 'Error in createRecommendation');
        return new Response('Internal Server Error', { status: 500 });
    }
}

/**
 * Updates an existing recommendation.
 */
export async function updateRecommendation(request, env, logger, recommendationId) {
    const user = await getAuthenticatedUser(request, env, logger);
    if (!user) {
        logger.warn('Unauthorized attempt to update recommendation');
        return new Response('Unauthorized', { status: 401 });
    }

    const existingRec = await env.DB.prepare('SELECT user_id FROM recommendations WHERE id = ?').bind(recommendationId).first();

    if (!existingRec) {
        return new Response('Recommendation not found', { status: 404 });
    }

    if (existingRec.user_id !== user.userId) {
        logger.warn({ userId: user.userId, recommendationId }, 'Forbidden attempt to update recommendation');
        return new Response('Forbidden', { status: 403 });
    }

    try {
        const schema = z.object({
            title: z.string().min(1).optional(),
            description: z.string().optional(),
            category: z.string().min(1).optional(),
            imageUrls: z.array(z.string().url()).max(50).optional(),
            isPublic: z.boolean().optional(),
        });

        const body = await request.json();
        const validation = schema.safeParse(body);

        if (!validation.success) {
            logger.warn({ errors: validation.error.flatten() }, 'Invalid data for updateRecommendation');
            return new Response(JSON.stringify({ errors: validation.error.flatten() }), { status: 400 });
        }

        const fieldsToUpdate = validation.data;
        if (Object.keys(fieldsToUpdate).length === 0) {
            return new Response('No fields to update', { status: 400 });
        }

        // Special handling for imageUrls to convert to JSON string
        if (fieldsToUpdate.imageUrls) {
            fieldsToUpdate.image_urls = JSON.stringify(fieldsToUpdate.imageUrls);
            delete fieldsToUpdate.imageUrls;
        }

        const setClauses = Object.keys(fieldsToUpdate).map(key => `${key} = ?`);
        const values = Object.values(fieldsToUpdate);

        await env.DB.prepare(`UPDATE recommendations SET ${setClauses.join(', ')} WHERE id = ?`).bind(...values, recommendationId).run();

        logger.info({ recommendationId, userId: user.userId }, 'Recommendation updated successfully');
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        logger.error({ errMessage: err?.message, errStack: err?.stack }, 'Error in updateRecommendation');
        return new Response('Internal Server Error', { status: 500 });
    }
}

/**
 * Deletes a recommendation and its associated feedbacks.
 */
export async function deleteRecommendation(request, env, logger, recommendationId) {
    const user = await getAuthenticatedUser(request, env, logger);
    if (!user) {
        logger.warn('Unauthorized attempt to delete recommendation');
        return new Response('Unauthorized', { status: 401 });
    }

    const existingRec = await env.DB.prepare('SELECT user_id FROM recommendations WHERE id = ?').bind(recommendationId).first();

    if (!existingRec) {
        return new Response('Recommendation not found', { status: 404 });
    }

    if (existingRec.user_id !== user.userId) {
        logger.warn({ userId: user.userId, recommendationId }, 'Forbidden attempt to delete recommendation');
        return new Response('Forbidden', { status: 403 });
    }

    try {
        await env.DB.batch([
            env.DB.prepare('DELETE FROM recommendation_feedbacks WHERE recommendation_id = ?').bind(recommendationId),
            env.DB.prepare('DELETE FROM recommendations WHERE id = ?').bind(recommendationId),
        ]);

        logger.info({ recommendationId, userId: user.userId }, 'Recommendation deleted successfully');
        return new Response(null, { status: 204 });
    } catch (err) {
        logger.error({ errMessage: err?.message, errStack: err?.stack }, 'Error in deleteRecommendation');
        return new Response('Internal Server Error', { status: 500 });
    }
}

/**
 * Gets all recommendations created by the authenticated user.
 */
export async function getMyRecommendations(request, env, logger) {
    const user = await getAuthenticatedUser(request, env, logger);
    if (!user) {
        logger.warn('Unauthorized attempt to get my recommendations');
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const { results } = await env.DB.prepare('SELECT * FROM recommendations WHERE user_id = ? ORDER BY created_at DESC').bind(user.userId).all();
        logger.info({ userId: user.userId, count: results.length }, 'Fetched my recommendations');
        return new Response(JSON.stringify(results), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        logger.error({ errMessage: err?.message, errStack: err?.stack }, 'Error in getMyRecommendations');
        return new Response('Internal Server Error', { status: 500 });
    }
}