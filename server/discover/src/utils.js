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

export { logger };

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function withCORS(response) {
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
 * Verifies JWT by delegating to the external auth worker service.
 */
export async function getAuthenticatedUser(request, env, reqLogger) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        reqLogger.warn('Missing Authorization header');
        return null;
    }

    try {
        const res = await env.AUTH.fetch(
            new Request('https://auth/verify', {
                headers: { Authorization: authHeader },
            }),
        );

        if (res.status !== 200) {
            const text = await res.text();
            reqLogger.warn({ status: res.status, body: text }, 'Auth server denied token');
            return null;
        }
        const payload = await res.json();
        reqLogger.debug({ userId: payload.userId }, 'User authenticated via auth server');
        return payload;
    } catch (err) {
        reqLogger.error({ errMessage: err?.message, errStack: err?.stack }, 'Unhandled error in verifying token via auth worker');
        return null;
    }
}