import { getAuthenticatedUser } from './index';
import pino from 'pino';

// Using a child logger for the posts module
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
 * Creates a new blog post for the authenticated user.
 */
export async function createPost(request, env, reqLogger) {
	const user = await getAuthenticatedUser(request, env, reqLogger);
	if (!user) {
		reqLogger.warn('Unauthorized attempt to create post');
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const { title, content } = await request.json();

		if (!title || !content) {
			reqLogger.warn('Missing title or content for post');
			return new Response('Missing required fields', { status: 400 });
		}

		const postId = crypto.randomUUID();

		// The database columns use `snake_case` (`user_id`).
		await env.DB.prepare(
			`
            INSERT INTO posts (id, user_id, title, content, created_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,
		)
			.bind(postId, user.userId, title, content)
			.run();

		reqLogger.info({ userId: user.userId, postId }, 'Post created successfully');
		return new Response(JSON.stringify({ success: true, id: postId }), {
			status: 201,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err) {
		reqLogger.error({ errMessage: err?.message, errStack: err?.stack }, 'Unhandled error in createPost');
		return new Response('Internal Server Error', { status: 500 });
	}
}

/**
 * Retrieves all public blog posts, including author information.
 */
export async function getPublicPosts(request, env, reqLogger) {
	try {
		const { results } = await env.DB.prepare(
			`
            SELECT p.id, p.title, p.content, p.user_id, p.created_at, p.updated_at, u.username
            FROM posts AS p
            LEFT JOIN users AS u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        `,
		).all();

		// Map database results to camelCase
		const posts = results.map(mapPostToCamelCase);

		reqLogger.info('Public posts retrieved successfully');
		return new Response(JSON.stringify(posts), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err) {
		reqLogger.error({ errMessage: err?.message, errStack: err?.stack }, 'Unhandled error in getPublicPosts');
		return new Response('Internal Server Error', { status: 500 });
	}
}

/**
 * Retrieves a single public blog post by its ID, including author information.
 */
export async function getPublicPost(request, env, reqLogger, postId) {
	try {
		const { results } = await env.DB.prepare(
			`
            SELECT p.*, u.username
            FROM posts AS p
            LEFT JOIN users AS u ON p.user_id = u.id
            WHERE p.id = ?
        `,
		)
			.bind(postId)
			.all();

		if (results.length === 0) {
			reqLogger.warn({ postId }, 'Post not found');
			return new Response('Not Found', { status: 404 });
		}

		// Map database result to camelCase
		const post = mapPostToCamelCase(results[0]);

		reqLogger.info({ postId }, 'Single public post retrieved successfully');
		return new Response(JSON.stringify(post), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err) {
		reqLogger.error({ errMessage: err?.message, errStack: err?.stack }, 'Unhandled error in getPublicPost');
		return new Response('Internal Server Error', { status: 500 });
	}
}

/**
 * Retrieves all blog posts by a specific author. No user authentication is required.
 */
export async function getAuthorPosts(request, env, reqLogger, authorId) {
	try {
		const { results } = await env.DB.prepare(
			`
            SELECT p.id, p.title, p.created_at, p.updated_at, u.username
            FROM posts AS p
            LEFT JOIN users AS u ON p.user_id = u.id
            WHERE p.user_id = ?
            ORDER BY p.created_at DESC
        `,
		)
			.bind(authorId)
			.all();

		// Map database results to camelCase
		const posts = results.map(mapPostToCamelCase);

		reqLogger.info({ authorId, postCount: posts.length }, 'Author posts retrieved successfully');
		return new Response(JSON.stringify(posts), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err) {
		reqLogger.error({ errMessage: err?.message, errStack: err?.stack }, 'Unhandled error in getAuthorPosts');
		return new Response('Internal Server Error', { status: 500 });
	}
}

/**
 * Updates an existing blog post for the authenticated user, and verifies they are the author.
 */
export async function updatePost(request, env, reqLogger, postId) {
	const user = await getAuthenticatedUser(request, env, reqLogger);
	if (!user) {
		reqLogger.warn('Unauthorized attempt to update post');
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const updates = await request.json();
		const allowed = ['title', 'content'];
		const fields = [];
		const values = [];

		for (const key of allowed) {
			if (key in updates) {
				fields.push(`${key} = ?`);
				values.push(updates[key]);
			}
		}

		if (fields.length === 0) {
			return new Response('No valid fields to update', { status: 400 });
		}

		// check whether the user is the author of the post
		const { results } = await env.DB.prepare('SELECT user_id FROM posts WHERE id = ?').bind(postId).all();
		if (results.length === 0 || results[0].user_id !== user.userId) {
			reqLogger.warn({ userId: user.userId, postId }, 'Attempt to update post owned by another user');
			return new Response('Forbidden', { status: 403 });
		}

		values.push(postId, user.userId);
		const query = `UPDATE posts SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`;

		await env.DB.prepare(query)
			.bind(...values)
			.run();

		reqLogger.info({ userId: user.userId, postId }, 'Post updated successfully');
		return new Response(JSON.stringify({ success: true }));
	} catch (err) {
		reqLogger.error({ errMessage: err?.message, errStack: err?.stack }, 'Unhandled error in updatePost');
		return new Response('Internal Server Error', { status: 500 });
	}
}

/**
 * Deletes a blog post for the authenticated user, and verifies they are the author.
 */
export async function deletePost(request, env, reqLogger, postId) {
	const user = await getAuthenticatedUser(request, env, reqLogger);
	if (!user) {
		reqLogger.warn('Unauthorized attempt to delete post');
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		// check whether the user is the author of the post
		const { results } = await env.DB.prepare('SELECT user_id FROM posts WHERE id = ?').bind(postId).all();
		if (results.length === 0 || results[0].user_id !== user.userId) {
			reqLogger.warn({ userId: user.userId, postId }, 'Attempt to delete post owned by another user');
			return new Response('Forbidden', { status: 403 });
		}

		await env.DB.prepare('DELETE FROM posts WHERE id = ? AND user_id = ?').bind(postId, user.userId).run();

		reqLogger.info({ userId: user.userId, postId }, 'Post deleted');
		return new Response(JSON.stringify({ success: true }));
	} catch (err) {
		reqLogger.error({ errMessage: err?.message, errStack: err?.stack }, 'Unhandled error in deletePost');
		return new Response('Internal Server Error', { status: 500 });
	}
}

/**
 * Helper function to map database post object to camelCase
 * @param {object} post
 * @returns {object}
 */
const mapPostToCamelCase = (post) => {
	return {
		id: post.id,
		title: post.title,
		content: post.content,
		userId: post.user_id,
		username: post.username,
		createdAt: post.created_at,
		updatedAt: post.updated_at,
	};
};
