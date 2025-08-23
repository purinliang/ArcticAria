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
				return new Response('Worker: Todo', { status: 200, headers: corsHeaders });
			}

			if (method === 'OPTIONS') {
				reqLogger.debug('Handling CORS preflight');
				return new Response(null, { status: 204, headers: corsHeaders });
			}

			if (path === '/todo' && method === 'GET') {
				return withCORS(await getTodos(request, env, reqLogger));
			}

			if (path === '/todo' && method === 'POST') {
				return withCORS(await createTodo(request, env, reqLogger));
			}

			if (path.startsWith('/todo/') && method === 'PUT') {
				const id = path.split('/')[2];
				return withCORS(await updateTodo(request, env, reqLogger, id));
			}

			if (path.startsWith('/todo/') && method === 'DELETE') {
				const id = path.split('/')[2];
				return withCORS(await deleteTodo(request, env, reqLogger, id));
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
		const { title, content, category, next_due_date, recurrence_rule, reminder_days_before } = await request.json();

		if (!title || !next_due_date) {
			logger.warn('Missing title or next_due_date');
			return new Response('Missing required fields', { status: 400 });
		}

		const todoId = crypto.randomUUID();

		await env.DB.prepare(`
			INSERT INTO todos (id, user_id, title, content, category, recurrence_rule, next_due_date, reminder_days_before)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		`).bind(
			todoId,
			user.userId,
			title,
			content || null,
			category || null,
			recurrence_rule || null,
			next_due_date,
			reminder_days_before || 0
		).run();

		logger.info({ userId: user.userId, todoId }, 'Todo created successfully');
		return new Response(JSON.stringify({ success: true, id: todoId }), {
			status: 201,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		logger.error({ errMessage: err?.message, errStack: err?.stack }, 'Unhandled error in create todo');
		return new Response('Internal Server Error', { status: 500 });
	}
}

function computeNextDue(baseDate, rule) {
	const date = new Date(baseDate);
	if (rule.endsWith('d')) {
		date.setDate(date.getDate() + parseInt(rule));
	} else if (rule.endsWith('m')) {
		date.setMonth(date.getMonth() + parseInt(rule));
	}
	return date;
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
		const { results } = await env.DB.prepare(`
			SELECT *
			FROM todos
			WHERE user_id = ?
		`).bind(user.userId).all();

		const now = new Date();
		const grouped = {
			reminding: [],
			upcoming: [],
			overdued: [],
			completed: []
		};

		for (const todo of results) {
			if (todo.completed) {
				grouped.completed.push(todo);
				continue;
			}

			const dueDate = new Date(todo.next_due_date);
			const remindDate = new Date(dueDate);
			remindDate.setDate(dueDate.getDate() - (todo.reminder_days_before || 0));

			if (now <= dueDate) {
				if (now >= remindDate) {
					grouped.reminding.push(todo);
					continue;
				} else {
					grouped.upcoming.push(todo);
					continue;
				}
			} else {
				grouped.overdued.push(todo);
				continue;
			}
		}

		return new Response(JSON.stringify(grouped), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		logger.error({ errMessage: err?.message, errStack: err?.stack }, 'Unhandled error in getTodos');
		return new Response('Internal Server Error', { status: 500 });
	}
}

async function updateTodo(request, env, logger, todoId) {
	const user = await getAuthenticatedUser(request, env, logger);
	if (!user) {
		logger.warn('Unauthorized attempt to update todo');
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const updates = await request.json();
		console.log(updates);

		// Only allow updating specific fields
		const allowed = ['title', 'content', 'category', 'completed', 'next_due_date', 'recurrence_rule', 'reminder_days_before'];
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

		values.push(todoId, user.userId);

		const query = `UPDATE todos SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;

		await env.DB.prepare(query).bind(...values).run();

		logger.info({ userId: user.userId, todoId }, 'Todo updated successfully');
		return new Response(JSON.stringify({ success: true }));
	} catch (err) {
		logger.error({ errMessage: err?.message, errStack: err?.stack }, 'Unhandled error in updateTodo');
		return new Response('Internal Server Error', { status: 500 });
	}
}

async function deleteTodo(request, env, logger, todoId) {
	const user = await getAuthenticatedUser(request, env, logger);
	if (!user) {
		logger.warn('Unauthorized attempt to delete todo');
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		await env.DB.prepare('DELETE FROM todos WHERE id = ? AND user_id = ?')
			.bind(todoId, user.userId)
			.run();

		logger.info({ userId: user.userId, todoId }, 'Todo deleted');
		return new Response(JSON.stringify({ success: true }));
	} catch (err) {
		logger.error({ errMessage: err?.message, errStack: err?.stack }, 'Unhandled error in deleteTodo');
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

