import redis from '@@/lib/redis';
import { verify as argonVerify } from 'argon2';
import { logger } from '@@/lib/logger';
import { AuthQueryBuilder } from '@@/server/querybuilder/auth.querybuilder';
import type { User } from '@prisma/client';

export class AuthService {
  static SESSION_TTL = 60 * 60 * 24 * 7; // 7 days in seconds
  static async validateUser(username: string, password: string): Promise<Pick<User, 'id' | 'username' | 'name' | 'role'> | null> {
    const user = await AuthQueryBuilder.findUserByUsername(username);
    if (!user) return null;
    const valid = await argonVerify(user.password, password);
    if (valid) {
      logger.debug('User validated', { username });
      return { id: user.id, username: user.username, name: user.name, role: user.role };
    }
    logger.warn('Invalid password attempt', { username });
    return null;
  }
  static async createSession(userId: number, userAgent: string, platform: string = 'web') {
    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + this.SESSION_TTL * 1000);
    try {
      await AuthQueryBuilder.createSessionRecord(String(sessionToken), userId, expires, userAgent, platform);
      await redis.set(`session:${sessionToken}`, userId, { EX: this.SESSION_TTL });
      logger.info('Session created', { userId, sessionToken });
      return sessionToken;
    } catch (err: unknown) {
      logger.error('Failed to create session', { error: err instanceof Error ? err.message : String(err), userId });
      throw err;
    }
  }

  static async revokeSession(sessionToken: string) {
    try {
      // delete from database
      await AuthQueryBuilder.deleteSessionRecords(String(sessionToken));
      await redis.del(`session:${sessionToken}`);
      logger.info('Session revoked', { sessionToken });
    } catch (e: unknown) {
      logger.warn('Failed to fully revoke session', { sessionToken, error: e instanceof Error ? e.message : String(e) });
    }
  }

  /**
   * Resolve a session token to a user id if the session is valid.
   * Returns the user id (number) or null if the session is missing/expired/invalid.
   */
  static async getUserIdFromSession(sessionToken: string): Promise<number | null> {
    try {
      if (!sessionToken) return null;

      // Try Redis first (fast lookup)
      const userIdStr = await redis.get(`session:${sessionToken}`);
      if (userIdStr) {
        const uid = Number(userIdStr);
        if (!Number.isNaN(uid)) return uid;
      }

      // Fallback to DB (in case redis was flushed or missed)
      const sess = await AuthQueryBuilder.findSessionByToken(String(sessionToken));
      if (!sess) return null;
      if (sess.expires && sess.expires < new Date()) {
        // expired - optionally clean up
        try {
          await AuthQueryBuilder.deleteSessionRecords(sessionToken);
          await redis.del(`session:${sessionToken}`);
        } catch (e: unknown) {
          logger.warn('Failed to cleanup expired session', { sessionToken, error: e instanceof Error ? e.message : String(e) });
        }
        return null;
      }
      return sess.userId ?? null;
    } catch (err: unknown) {
      logger.warn('Error resolving session token', { sessionToken, error: err instanceof Error ? (err as Error).message : String(err) });
      return null;
    }
  }
}
