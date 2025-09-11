import { type H3Event, createError } from 'h3';
import { AuthService } from '@@/server/services/auth.service';
import { logger } from '@@/lib/logger';
import { AuthUtils } from '@@/server/utils/auth.utils';

export default defineEventHandler(async (event: H3Event) => {
  if (event.method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed.' });
  }

  const body = await readBody(event);
  const { username, password } = body;
  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Username and password are required.' });
  }

  const user = await AuthService.validateUser(username, password);

  if (!user) {
    logger.warn('Login failed: invalid credentials', { username });
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials.' });
  }

  try {
    const userAgent = event.node.req.headers['user-agent'] || 'Unknown';
    const platform = userAgent.toLowerCase().includes('mobile') ? 'mobile' : 'web';
    const sessionToken = await AuthService.createSession(user.id, userAgent, platform);

    await AuthUtils.issueCookies(event, sessionToken);

    logger.info('User logged in', { userId: user.id, username: user.username });
    return { sessionToken };
  } catch (err: unknown) {
    // Unexpected server error
    logger.error('Login error', { error: err instanceof Error ? err.message : String(err), username });
    const message = err instanceof Error ? err.message : 'Internal server error.';
    throw createError({ statusCode: 500, statusMessage: message });
  }
});
