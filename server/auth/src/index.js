import { hash, compare } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const path = url.pathname;
		const method = request.method;

		if (path === '/register' && method === 'POST') {
			return await register(request, env);
		}

		if (path === '/login' && method === 'POST') {
			return await login(request, env);
		}

		if (path === '/verify' && method === 'GET') {
			return await verifyToken(request, env);
		}

		return new Response('Not Found', { status: 404 });
	},
};

async function register(request, env) {
	const { email, password } = await request.json();
	if (!email || !password) {
		return new Response('Missing fields', { status: 400 });
	}

	const existing = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
		.bind(email)
		.first();

	if (existing) {
		return new Response('Email already registered', { status: 409 });
	}

	const password_hash = await hash(password, 10);

	await env.DB.prepare(
		'INSERT INTO users (email, password_hash) VALUES (?, ?)'
	)
		.bind(email, password_hash)
		.run();

	return new Response('User registered', { status: 201 });
}

async function login(request, env) {
	const { email, password } = await request.json();

	const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
		.bind(email)
		.first();

	if (!user || !(await compare(password, user.password_hash))) {
		return new Response('Invalid credentials', { status: 401 });
	}

	const secret = new TextEncoder().encode(env.JWT_SECRET);

	const jwt = await new SignJWT({ userId: user.id, email: user.email })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('7d')
		.sign(secret);

	return new Response(JSON.stringify({ token: jwt }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
}

async function verifyJWT(token, env) {
	try {
		const secret = new TextEncoder().encode(env.JWT_SECRET);
		const { payload } = await jwtVerify(token, secret);
		return payload;
	} catch (err) {
		return null;
	}
}

async function verifyToken(request, env) {
	const authHeader = request.headers.get('Authorization');
	const token = authHeader?.split(' ')[1];

	const payload = await verifyJWT(token, env);
	if (!payload) {
		return new Response('Unauthorized', { status: 401 });
	}

	return new Response(JSON.stringify(payload), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
}
