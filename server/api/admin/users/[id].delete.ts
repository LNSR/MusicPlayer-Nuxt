import { type H3Event, createError } from 'h3';
import { UsersQueryBuilder } from '@@/server/querybuilder/users.querybuilder';
import { logger } from '@@/lib/logger';

export default defineEventHandler(async (event: H3Event) => {
    if (event.node.req.method !== 'DELETE') {
        throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
    }

    const { id } = event.context.params ?? {};
    const uid = Number(id ?? NaN);
    if (!Number.isFinite(uid) || uid <= 0) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid user id' });
    }

    try {
        await UsersQueryBuilder.deleteUserSessions(uid);
        await UsersQueryBuilder.deleteUser(uid);
        return { success: true };
    } catch (err: unknown) {
        logger.warn('Failed deleting user', { id: uid, error: err instanceof Error ? err.message : String(err) });
        throw createError({ statusCode: 500, statusMessage: 'Failed to delete user' });
    }
});
