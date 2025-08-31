import pino from 'pino';

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

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
	async fetch(request, env, ctx) {
		const requestId = Math.random().toString(36).substring(2, 8);
		const reqLogger = logger.child({ requestId });

		try {
			const url = new URL(request.url);
			const path = url.pathname;
			const method = request.method;

			if (path === '/') {
				return new Response('Worker: Blog', { status: 200, headers: corsHeaders });
			}

			if (method === 'OPTIONS') {
				reqLogger.debug('Handling CORS preflight');
				return new Response(null, { status: 204, headers: corsHeaders });
			}

			// --- Blog Post API Endpoints ---

			if (path === '/posts' && method === 'GET') {
				return withCORS(await getPublicPosts(request, env, reqLogger));
			}

			if (path.startsWith('/posts/') && method === 'GET') {
				const id = path.split('/')[2];
				return withCORS(await getPublicPost(request, env, reqLogger, id));
			}

			if (path.startsWith('/author/') && method === 'GET') {
				const authorId = path.split('/')[2];
				return withCORS(await getAuthorPosts(request, env, reqLogger, authorId));
			}

			if (method === 'POST' && path === '/posts') {
				return withCORS(await createPost(request, env, reqLogger));
			}

			if (method === 'PUT' && path.startsWith('/posts/')) {
				const id = path.split('/')[2];
				return withCORS(await updatePost(request, env, reqLogger, id));
			}

			if (method === 'DELETE' && path.startsWith('/posts/')) {
				const id = path.split('/')[2];
				return withCORS(await deletePost(request, env, reqLogger, id));
			}

			reqLogger.warn({ path }, 'Route not found');
			return new Response('Not Found', { status: 404, headers: corsHeaders });
		} catch (err) {
			reqLogger.error(
				{
					errMessage: err?.message,
					errStack: err?.stack,
				},
				'Unhandled error in fetch handler',
			);
			return new Response('Internal Server Error', {
				status: 500,
				headers: corsHeaders,
			});
		}
	},
};

function withCORS(response) {
	const newHeaders = new Headers(response.headers);
	for (const [key, value] of Object.entries(corsHeaders)) {
		newHeaders.set(key, value);
	}
	return new Response(response.body, {
		status: response.status,
		headers: newHeaders,
	});
}

/**
 * Creates a new blog post for the authenticated user.
 */
async function createPost(request, env, logger) {
	const user = await getAuthenticatedUser(request, env, logger);
	if (!user) {
		logger.warn('Unauthorized attempt to create post');
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const { title, content } = await request.json();

		if (!title || !content) {
			logger.warn('Missing title or content for post');
			return new Response('Missing required fields', { status: 400 });
		}

		const postId = crypto.randomUUID();

		// The database columns use `snake_case` (`user_id`).
		await env.DB.prepare(
			`
            INSERT INTO posts (id, user_id, title, content)
            VALUES (?, ?, ?, ?)
        `,
		)
			.bind(postId, user.userId, title, content)
			.run();

		logger.info({ userId: user.userId, postId }, 'Post created successfully');
		return new Response(JSON.stringify({ success: true, id: postId }), {
			status: 201,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err) {
		logger.error({ errMessage: err?.message, errStack: err?.stack }, 'Unhandled error in createPost');
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

/**
 * Retrieves all public blog posts, including author information.
 */
async function getPublicPosts(request, env, logger) {
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

		logger.info('Public posts retrieved successfully');
		return new Response(JSON.stringify(posts), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err) {
		logger.error({ errMessage: err?.message, errStack: err?.stack }, 'Unhandled error in getPublicPosts');
		return new Response('Internal Server Error', { status: 500 });
	}
}

/**
 * Retrieves a single public blog post by its ID, including author information.
 */
async function getPublicPost(request, env, logger, postId) {
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
			logger.warn({ postId }, 'Post not found');
			return new Response('Not Found', { status: 404 });
		}

		// Map database result to camelCase
		const post = mapPostToCamelCase(results[0]);

		logger.info({ postId }, 'Single public post retrieved successfully');
		return new Response(JSON.stringify(post), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err) {
		logger.error({ errMessage: err?.message, errStack: err?.stack }, 'Unhandled error in getPublicPost');
		return new Response('Internal Server Error', { status: 500 });
	}
}

/**
 * Retrieves all blog posts by a specific author. No user authentication is required.
 */
async function getAuthorPosts(request, env, logger, authorId) {
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

		logger.info({ authorId, postCount: posts.length }, 'Author posts retrieved successfully');
		return new Response(JSON.stringify(posts), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err) {
		logger.error({ errMessage: err?.message, errStack: err?.stack }, 'Unhandled error in getAuthorPosts');
		return new Response('Internal Server Error', { status: 500 });
	}
}

/**
 * Updates an existing blog post for the authenticated user, and verifies they are the author.
 */
async function updatePost(request, env, logger, postId) {
	const user = await getAuthenticatedUser(request, env, logger);
	if (!user) {
		logger.warn('Unauthorized attempt to update post');
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
			logger.warn({ userId: user.userId, postId }, 'Attempt to update post owned by another user');
			return new Response('Forbidden', { status: 403 });
		}

		values.push(postId, user.userId);
		const query = `UPDATE posts SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`;

		await env.DB.prepare(query)
			.bind(...values)
			.run();

		logger.info({ userId: user.userId, postId }, 'Post updated successfully');
		return new Response(JSON.stringify({ success: true }));
	} catch (err) {
		logger.error({ errMessage: err?.message, errStack: err?.stack }, 'Unhandled error in updatePost');
		return new Response('Internal Server Error', { status: 500 });
	}
}

/**
 * Deletes a blog post for the authenticated user, and verifies they are the author.
 */
async function deletePost(request, env, logger, postId) {
	const user = await getAuthenticatedUser(request, env, logger);
	if (!user) {
		logger.warn('Unauthorized attempt to delete post');
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		// check whether the user is the author of the post
		const { results } = await env.DB.prepare('SELECT user_id FROM posts WHERE id = ?').bind(postId).all();
		if (results.length === 0 || results[0].user_id !== user.userId) {
			logger.warn({ userId: user.userId, postId }, 'Attempt to delete post owned by another user');
			return new Response('Forbidden', { status: 403 });
		}

		await env.DB.prepare('DELETE FROM posts WHERE id = ? AND user_id = ?').bind(postId, user.userId).run();

		logger.info({ userId: user.userId, postId }, 'Post deleted');
		return new Response(JSON.stringify({ success: true }));
	} catch (err) {
		logger.error({ errMessage: err?.message, errStack: err?.stack }, 'Unhandled error in deletePost');
		return new Response('Internal Server Error', { status: 500 });
	}
}

/**
 * Verifies JWT by delegating to the external auth worker service.
 */
async function getAuthenticatedUser(request, env, logger) {
	const authHeader = request.headers.get('Authorization');
	if (!authHeader) {
		logger.warn('Missing Authorization header');
		return null;
	}

	try {
		logger.info({ authHeader }, 'Sending token to auth server');
		logger.warn({ hasAuth: !!env.AUTH, fetchType: typeof env.AUTH?.fetch }, 'AUTH binding check');

		const res = await env.AUTH.fetch(
			new Request('https://auth/verify', {
				headers: { Authorization: authHeader },
			}),
		);

		logger.info({ status: res.status }, 'Received response from auth server');

		if (res.status !== 200) {
			const text = await res.text();
			logger.warn({ status: res.status, body: text }, 'Auth server denied token');
			return null;
		}
		const payload = await res.json();
		// The payload from the auth worker now contains the username.
		logger.debug({ userId: payload.userId, username: payload.username }, 'User authenticated via auth server');
		return payload;
	} catch (err) {
		logger.error(
			{
				errMessage: err?.message,
				errStack: err?.stack,
			},
			'Unhandled error in verifying token via auth worker',
		);
		return null;
	}
}
