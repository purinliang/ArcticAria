import { createPost, getPublicPosts, getPublicPost, getAuthorPosts, updatePost, deletePost } from './posts';
import { createComment, getCommentsForPost, updateComment, deleteComment } from './comments';
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
			if (path.startsWith('/posts/') && method === 'GET' && !path.endsWith('/comments')) {
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

			// --- Comment API Endpoints ---
			if (path.startsWith('/posts/') && path.endsWith('/comments') && method === 'GET') {
				const postId = path.split('/')[2];
				return withCORS(await getCommentsForPost(request, env, reqLogger, postId));
			}
			if (method === 'POST' && path === '/comments') {
				return withCORS(await createComment(request, env, reqLogger, getAuthenticatedUser));
			}
			if (method === 'PUT' && path.startsWith('/comments/')) {
				const commentId = path.split('/')[2];
				return withCORS(await updateComment(request, env, reqLogger, commentId, getAuthenticatedUser));
			}
			if (method === 'DELETE' && path.startsWith('/comments/')) {
				const commentId = path.split('/')[2];
				return withCORS(await deleteComment(request, env, reqLogger, commentId, getAuthenticatedUser));
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

export async function getAuthenticatedUser(request, env, logger) {
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
