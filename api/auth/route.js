const { auth } = require("../../lib/auth");

// Create request handler for authentication
const handleAuthRequest = async (request) => {
    try {
        const url = new URL(request.url);
        const pathname = url.pathname;
        
        // Route authentication requests to Better Auth
        if (pathname.startsWith('/api/auth/')) {
            return await auth.handler(request);
        }
        
        return new Response('Not Found', { status: 404 });
    } catch (error) {
        console.error('Auth handler error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};

// Export handlers for different methods
module.exports = {
    GET: handleAuthRequest,
    POST: handleAuthRequest,
    PUT: handleAuthRequest,
    DELETE: handleAuthRequest,
    PATCH: handleAuthRequest
}; 