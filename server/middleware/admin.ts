import { getCookie, sendRedirect, createError } from 'h3';
import { AuthUtils } from '../utils/auth.utils';
export default defineEventHandler(async (event) => {
    // Protect both UI admin pages and API admin endpoints
    if (!event.path.startsWith('/admin') && !event.path.startsWith('/api/admin')) return;

    const sessionToken = getCookie(event, 'session');

    const sessionResult = sessionToken ? await AuthUtils.trySession(sessionToken) : null;

    if (sessionResult?.authenticated) {
        return;
    }

    // Not authenticated
    if (event.path.startsWith('/api/')) {
        // For API endpoints return 401 JSON error
        throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' });
    }

    // For UI routes redirect to home
    return sendRedirect(event, '/', 302);
});