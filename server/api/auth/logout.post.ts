import { setCookie, getCookie } from 'h3';
import { AuthService } from '@@/server/services/auth.service';
import { logger } from '@@/lib/logger';

export default defineEventHandler(async (event) => {
  let session: string | undefined = undefined;
  try {
    session = getCookie(event, 'session') ?? undefined;
    if (session) {
      try {
        await AuthService.revokeSession(session);
      } catch (e: unknown) {
        logger.warn('Failed to revoke session during logout', { session, error: e instanceof Error ? e.message : String(e) });
      }
    }
  } catch (e: unknown) {
    logger.error('Unexpected error during logout handling', { error: e instanceof Error ? e.message : String(e) });
  }

  // Clear cookies
  try {
    setCookie(event, 'session', '', { path: '/', maxAge: 0 });
    logger.info('Cleared auth cookies during logout', { hadSession: !!session });
  } catch (e: unknown) {
    logger.warn('Failed to clear logout cookies', { error: e instanceof Error ? e.message : String(e) });
  }

  return { ok: true };
});
