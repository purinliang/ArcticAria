import pino from 'pino';

// The getAuthenticatedUser function is now imported from the main index file.
// The main router file will handle the import correctly.

// Create a child logger for the comments module
const logger = pino({
    level: 'debug',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
        },
    },
});

/**
 * Creates a new comment for a specific post.
 */
export async function createComment(request, env, reqLogger, getAuthenticatedUser) {
    const user = await getAuthenticatedUser(request, env, reqLogger);
    if (!user) {
        reqLogger.warn('Unauthorized attempt to create comment');
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const { postId, parentCommentId, content } = await request.json();

        if (!postId || !content) {
            reqLogger.warn('Missing required fields for comment');
            return new Response('Missing required fields', { status: 400 });
        }

        const commentId = crypto.randomUUID();

        // The database columns use `snake_case`.
        await env.DB.prepare(
            `
            INSERT INTO comments (id, post_id, user_id, parent_comment_id, content, created_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,
        )
            .bind(commentId, postId, user.userId, parentCommentId || null, content)
            .run();

        reqLogger.info({ userId: user.userId, postId, commentId }, 'Comment created successfully');
        return new Response(JSON.stringify({ success: true, id: commentId }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        reqLogger.error({ errMessage: err?.message, errStack: err?.stack }, 'Unhandled error in createComment');
        return new Response('Internal Server Error', { status: 500 });
    }
}

/**
 * Retrieves all comments for a given post.
 */
export async function getCommentsForPost(request, env, reqLogger, postId) {
    try {
        const { results } = await env.DB.prepare(
            `
            SELECT c.id, c.post_id, c.user_id, c.parent_comment_id, c.content, c.created_at, c.updated_at, u.username
            FROM comments AS c
            LEFT JOIN users AS u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC
        `,
        )
            .bind(postId)
            .all();

        // Map database results to camelCase
        const comments = results.map(mapCommentToCamelCase);

        reqLogger.info({ postId, commentCount: comments.length }, 'Comments retrieved successfully');
        return new Response(JSON.stringify(comments), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        reqLogger.error({ errMessage: err?.message, errStack: err?.stack }, 'Unhandled error in getCommentsForPost');
        return new Response('Internal Server Error', { status: 500 });
    }
}

/**
 * Updates an existing comment for the authenticated user.
 */
export async function updateComment(request, env, reqLogger, commentId, getAuthenticatedUser) {
    const user = await getAuthenticatedUser(request, env, reqLogger);
    if (!user) {
        reqLogger.warn('Unauthorized attempt to update comment');
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const { content } = await request.json();

        if (!content) {
            return new Response('No valid fields to update', { status: 400 });
        }

        // Check whether the user is the author of the comment
        const { results } = await env.DB.prepare('SELECT user_id FROM comments WHERE id = ?').bind(commentId).all();
        if (results.length === 0 || results[0].user_id !== user.userId) {
            reqLogger.warn({ userId: user.userId, commentId }, 'Attempt to update comment owned by another user');
            return new Response('Forbidden', { status: 403 });
        }

        await env.DB.prepare('UPDATE comments SET content = ?, updated_at = ? WHERE id = ? AND user_id = ?')
            .bind(content, new Date().toISOString(), commentId, user.userId)
            .run();

        reqLogger.info({ userId: user.userId, commentId }, 'Comment updated successfully');
        return new Response(JSON.stringify({ success: true }));
    } catch (err) {
        reqLogger.error({ errMessage: err?.message, errStack: err?.stack }, 'Unhandled error in updateComment');
        return new Response('Internal Server Error', { status: 500 });
    }
}

/**
 * Deletes a comment for the authenticated user.
 */
export async function deleteComment(request, env, reqLogger, commentId, getAuthenticatedUser) {
    const user = await getAuthenticatedUser(request, env, reqLogger);
    if (!user) {
        reqLogger.warn('Unauthorized attempt to delete comment');
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        // Check whether the user is the author of the comment
        const { results } = await env.DB.prepare('SELECT user_id FROM comments WHERE id = ?').bind(commentId).all();
        if (results.length === 0 || results[0].user_id !== user.userId) {
            reqLogger.warn({ userId: user.userId, commentId }, 'Attempt to delete comment owned by another user');
            return new Response('Forbidden', { status: 403 });
        }

        await env.DB.prepare('DELETE FROM comments WHERE id = ? AND user_id = ?').bind(commentId, user.userId).run();

        reqLogger.info({ userId: user.userId, commentId }, 'Comment deleted');
        return new Response(JSON.stringify({ success: true }));
    } catch (err) {
        reqLogger.error({ errMessage: err?.message, errStack: err?.stack }, 'Unhandled error in deleteComment');
        return new Response('Internal Server Error', { status: 500 });
    }
}

/**
 * Helper function to map database comment object to camelCase
 * @param {object} comment
 * @returns {object}
 */
const mapCommentToCamelCase = (comment) => {
    return {
        id: comment.id,
        postId: comment.post_id,
        userId: comment.user_id,
        parentCommentId: comment.parent_comment_id,
        content: comment.content,
        username: comment.username,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
    };
};
