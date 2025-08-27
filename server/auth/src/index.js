import { hash, compare } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import pino from 'pino';

// Initialize pino logger with pretty printing for development
const logger = pino({
	level: 'info',
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
			translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
			ignore: 'pid,hostname'
		}
	}
});

// CORS headers configuration
const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
	async fetch(request, env, ctx) {
		// Generate unique request ID for tracing
		const requestId = Math.random().toString(36).slice(2, 8);
		const reqLogger = logger.child({ requestId });

		try {
			reqLogger.info({
				method: request.method,
				url: request.url,
				msg: 'Request received'
			});

			const url = new URL(request.url);
			const path = url.pathname;
			const method = request.method;

			if (path === '/') {
				return new Response('Worker: Auth', { status: 200, headers: corsHeaders });
			}

			// Handle OPTIONS preflight request
			if (method === 'OPTIONS') {
				reqLogger.debug('Handling OPTIONS preflight request');
				return new Response(null, {
					status: 204,
					headers: corsHeaders,
				});
			}

			// Route requests to appropriate handlers
			if (path === '/register' && method === 'POST') {
				return withCORS(await register(request, env, reqLogger));
			}

			if (path === '/login' && method === 'POST') {
				return withCORS(await login(request, env, reqLogger));
			}

			if (path === '/verify' && method === 'GET') {
				return withCORS(await verifyToken(request, env, reqLogger));
			}

			reqLogger.warn({ path }, 'Route not found');
			return new Response('Not Found', { status: 404, headers: corsHeaders });

		} catch (error) {
			reqLogger.error({
				err: error,
				msg: 'Unhandled exception in request processing'
			});
			return new Response('Internal Server Error', {
				status: 500,
				headers: corsHeaders
			});
		}
	},
};

// Helper function to add CORS headers to responses
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
 * Handles user registration
 * @param {Request} request 
 * @param {Env} env 
 * @param {pino.Logger} logger 
 * @returns {Promise<Response>}
 */
async function register(request, env, logger) {
	try {
		// Change from 'email' to 'username'
		const { username, password } = await request.json();
		logger.info({ username }, 'Registration attempt');

		// Validate input
		if (!username || !password) {
			logger.warn('Missing required fields in registration request');
			return new Response('Missing fields', { status: 400 });
		}

		// Check if user already exists based on 'username', but in current database, it is called 'email'
		const existing = await env.DB.prepare('SELECT 1 FROM users WHERE email = ?')
			.bind(username)
			.first();

		if (existing) {
			logger.warn({ username }, 'Username already registered');
			return new Response('Username already registered', { status: 409 });
		}

		// Generate UUID using Web Crypto API
		const userId = crypto.randomUUID();
		logger.debug({ userId }, 'Generated user ID');

		// Hash password
		const password_hash = await hash(password, 10);
		logger.debug('Password hashed successfully');

		// Create new user, inserting 'username', but in current database, it is called 'email'
		await env.DB.prepare(
			'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)'
		)
			.bind(userId, username, password_hash)
			.run();

		logger.info({ userId, username }, 'User registered successfully');

		return new Response(JSON.stringify({
			success: true,
			userId
		}), {
			status: 201,
			headers: { 'Content-Type': 'application/json' }
		});

	} catch (error) {
		logger.error({ error }, 'Registration failed');
		return new Response(JSON.stringify({
			error: 'Registration failed'
		}), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

/**
 * Handles user login and JWT generation
 * @param {Request} request 
 * @param {Env} env 
 * @param {pino.Logger} logger 
 * @returns {Promise<Response>}
 */
async function login(request, env, logger) {
	try {
		// Change from 'email' to 'username'
		const { username, password } = await request.json();
		logger.info({ username }, 'Login attempt');

		// Find user in database based on 'username', but in current database, it is called 'email'
		const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
			.bind(username)
			.first();

		if (!user) {
			logger.warn({ username }, 'User not found during login');
			return new Response('Invalid credentials', { status: 401 });
		}

		// Verify password
		const passwordMatch = await compare(password, user.password_hash);
		if (!passwordMatch) {
			logger.warn({ username }, 'Invalid password provided');
			return new Response('Invalid credentials', { status: 401 });
		}

		// Generate JWT token
		const secret = new TextEncoder().encode(env.JWT_SECRET);
		const jwt = await new SignJWT({ userId: user.id, username: user.username })
			.setProtectedHeader({ alg: 'HS256' })
			.setIssuedAt()
			.setExpirationTime('30d')
			.sign(secret);

		logger.info({ userId: user.id }, 'Login successful, JWT generated');

		return new Response(JSON.stringify({ token: jwt }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});

	} catch (error) {
		logger.error({
			err: error,
			msg: 'Login failed'
		});
		return new Response('Login failed', { status: 500 });
	}
}

/**
 * Verifies JWT token
 * @param {string} token 
 * @param {Env} env 
 * @returns {Promise<object|null>}
 */
async function verifyJWT(token, env, logger) {
	try {
		const secret = new TextEncoder().encode(env.JWT_SECRET);
		// Change to look for 'username' in the payload
		const { payload } = await jwtVerify(token, secret);
		logger.info({ username: payload.username }, 'JWT verification successful');
		return payload;
	} catch (err) {
		logger.warn({
			err,
			msg: 'JWT verification failed'
		});
		return null;
	}
}

/**
 * Handles token verification requests
 * @param {Request} request 
 * @param {Env} env 
 * @param {pino.Logger} logger 
 * @returns {Promise<Response>}
 */
async function verifyToken(request, env, logger) {
	try {
		const authHeader = request.headers.get('Authorization');
		const token = authHeader?.split(' ')[1];

		if (!token) {
			logger.warn('No token provided in Authorization header');
			return new Response('Unauthorized', { status: 401 });
		}

		const payload = await verifyJWT(token, env, logger);
		if (!payload) {
			logger.warn('Invalid token provided');
			return new Response('Unauthorized', { status: 401 });
		}

		logger.info({ username: payload.username }, 'Token verification successful');
		return new Response(JSON.stringify(payload), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});

	} catch (error) {
		logger.error({
			err: error,
			msg: 'Token verification error'
		});
		return new Response('Token verification error', { status: 500 });
	}
}
