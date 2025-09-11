import { AuthQueryBuilder } from '@@/server/querybuilder/auth.querybuilder';
import { logger } from '@@/lib/logger';
import { AuthService } from '@@/server/services/auth.service';
import { setCookie, H3Event } from 'h3';
import type { User } from '@prisma/client';
export class AuthUtils {
    static async trySession(sessionToken: string): Promise<{ authenticated: boolean, user: Pick<User, 'id' | 'username' | 'role'> | null }> {
        try {
            const userId = await AuthService.getUserIdFromSession?.(sessionToken) ?? null;
            if (!userId) return { authenticated: false, user: null };

            const user = await AuthQueryBuilder.findUserById(userId);
            if (!user) return { authenticated: false, user: null };

            return { authenticated: true, user: { id: user.id, username: user.username, role: user.role } };
        } catch (err: unknown) {
            logger.warn('/api/me session lookup failed', { error: err instanceof Error ? err.message : String(err) });
            return { authenticated: false, user: null };
        }
    }

    static async issueCookies(event: H3Event, sessionToken?: string) {
        try {
            if (sessionToken) {
                setCookie(event, 'session', sessionToken, {
                    httpOnly: true,
                    sameSite: 'lax',
                    path: '/',
                    maxAge: AuthService.SESSION_TTL,
                });
            }
        } catch (err: unknown) {
            logger.warn('Failed to set auth cookies', { error: err instanceof Error ? err.message : String(err) });
        }
    }
}