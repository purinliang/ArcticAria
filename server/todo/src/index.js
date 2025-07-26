import pino from 'pino';

const logger = pino({
	level: 'debug',
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
			translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
			ignore: 'pid,hostname'
		}
	}
});

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

			if (method === 'OPTIONS') {
				reqLogger.debug('Handling CORS preflight');
				return new Response(null, { status: 204, headers: corsHeaders });
			}

			if (path === '/todo' && method === 'POST') {
				return withCORS(await createTodo(request, env, reqLogger));
			}

			if (path === '/todo' && method === 'GET') {
				return withCORS(await getTodos(request, env, reqLogger));
			}

			reqLogger.warn({ path }, 'Route not found');
			return new Response('Not Found', { status: 404, headers: corsHeaders });
		} catch (err) {
			reqLogger.error({
				errMessage: err?.message,
				errStack: err?.stack
			}, 'Unhandled error in fetch handler');
			return new Response('Internal Server Error', {
				status: 500,
				headers: corsHeaders
			});
		}
	}
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
 * Creates a new todo item for the authenticated user.
 */
async function createTodo(request, env, logger) {
	const user = await getAuthenticatedUser(request, env, logger);
	if (!user) {
		logger.warn('Unauthorized attempt to create todo');
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const { title, content } = await request.json();
		if (!title) {
			logger.warn('Missing title field in todo creation request');
			return new Response('Missing title', { status: 400 });
		}

		const todoId = crypto.randomUUID();

		await env.DB.prepare(`
			INSERT INTO todos (id, user_id, title, content)
			VALUES (?, ?, ?, ?)
		`).bind(todoId, user.userId, title, content || null).run();

		logger.info({ userId: user.userId, todoId }, 'Todo created successfully');

		return new Response(JSON.stringify({ success: true, id: todoId }), {
			status: 201,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		logger.error({
			errMessage: err?.message,
			errStack: err?.stack
		}, 'Unhandled error in create todo');
		return new Response('Internal Server Error', { status: 500 });
	}
}

/**
 * Retrieves todos for the authenticated user.
 */
async function getTodos(request, env, logger) {
	const user = await getAuthenticatedUser(request, env, logger);
	if (!user) {
		logger.warn('Unauthorized attempt to retrieve todos');
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const result = await env.DB.prepare(`
			SELECT id, title, content, completed, created_at
			FROM todos
			WHERE user_id = ?
			ORDER BY created_at DESC
		`).bind(user.userId).all();

		logger.info({ userId: user.userId, count: result.results.length }, 'Todos fetched successfully');

		return new Response(JSON.stringify(result.results), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		logger.error({
			errMessage: err?.message,
			errStack: err?.stack
		}, 'Unhandled error in retrieve todos');
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


		const res = await env.AUTH.fetch(new Request('https://auth/verify', {
			headers: { Authorization: authHeader }
		}));


		logger.info({ status: res.status }, 'Received response from auth server');

		if (res.status !== 200) {
			const text = await res.text();
			logger.warn({ status: res.status, body: text }, 'Auth server denied token');
			return null;
		}
		const payload = await res.json();
		logger.debug({ userId: payload.userId }, 'User authenticated via auth server');
		return payload;
	} catch (err) {
		logger.error({
			errMessage: err?.message,
			errStack: err?.stack
		}, 'Unhandled error in verifying token via auth worker');
		return null;
	}
}

