import { logger, withCORS, corsHeaders } from './utils.js';
import {
	createRecommendation,
	updateRecommendation,
	deleteRecommendation,
	getMyRecommendations,
} from './recommendations.js';
import { handleFeedback } from './feedbacks.js';
import { getPersonalizedFeed } from './feed.js';
import { getFavorites } from './favorites.js';
import { recalculateFeedCountdown } from './recalculate.js';

export default {
	async fetch(request, env, ctx) {
		const requestId = Math.random().toString(36).substring(2, 8);
		const reqLogger = logger.child({
			requestId,
			method: request.method,
			url: request.url,
		});

		try {
			const url = new URL(request.url);
			const path = url.pathname;
			const method = request.method;

			if (path === '/') {
				reqLogger.info('Health check endpoint hit');
				return new Response('Worker: Discover', { status: 200 });
			}

			if (method === 'OPTIONS') {
				reqLogger.debug('Handling CORS preflight');
				return new Response(null, { status: 204, headers: corsHeaders });
			}

			// Route to create a new recommendation
			if (path === '/recommendations' && method === 'POST') {
				reqLogger.info('Routing to POST /recommendations');
				return withCORS(await createRecommendation(request, env, reqLogger));
			}

			// Route to get user's own recommendations
			if (path === '/recommendations/my' && method === 'GET') {
				reqLogger.info('Routing to GET /recommendations/my');
				return withCORS(await getMyRecommendations(request, env, reqLogger));
			}

			// Routes for specific recommendation by ID
			const recommendationIdMatch = path.match(/^\/recommendations\/([a-f0-9-]+)$/);
			if (recommendationIdMatch) {
				const recommendationId = recommendationIdMatch[1];
				if (method === 'PUT') {
					reqLogger.info({ recommendationId }, 'Routing to PUT /recommendations/:id');
					return withCORS(await updateRecommendation(request, env, reqLogger, recommendationId));
				}
				if (method === 'DELETE') {
					reqLogger.info({ recommendationId }, 'Routing to DELETE /recommendations/:id');
					return withCORS(await deleteRecommendation(request, env, reqLogger, recommendationId));
				}
			}

			// Route to get the personalized feed
			if (path === '/feed' && method === 'GET') {
				reqLogger.info('Routing to getPersonalizedFeed');
				return withCORS(await getPersonalizedFeed(request, env, reqLogger));
			}

			// Route to get user's favorite items
			if (path === '/favorites' && method === 'GET') {
				reqLogger.info('Routing to getFavorites');
				return withCORS(await getFavorites(request, env, reqLogger));
			}

			// Route to handle user feedback
			if (path === '/feedbacks' && method === 'POST') {
				reqLogger.info('Routing to handleFeedback');
				return withCORS(await handleFeedback(request, env, reqLogger));
			}

			// Route to trigger countdown recalculation
			if (path === '/recalculate' && method === 'POST') {
				reqLogger.info('Routing to recalculateFeedCountdown');
				return withCORS(await recalculateFeedCountdown(request, env, reqLogger));
			}

			reqLogger.warn({ path }, 'Route not found');
			const notFoundResponse = new Response('Not Found', { status: 404 });
			return withCORS(notFoundResponse);
		} catch (err) {
			reqLogger.error(
				{
					errMessage: err?.message,
					errStack: err?.stack,
				},
				'Unhandled error in fetch handler'
			);
			const errorResponse = new Response('Internal Server Error', {
				status: 500,
			});
			return withCORS(errorResponse);
		}
	},
};