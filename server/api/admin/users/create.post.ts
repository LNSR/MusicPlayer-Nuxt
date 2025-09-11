
import { type H3Event, readBody, createError } from 'h3';
import { UsersQueryBuilder } from '@@/server/querybuilder/users.querybuilder';
import { hash as argonHash } from 'argon2';
import { logger } from '@@/lib/logger';

export default defineEventHandler(async (event: H3Event) => {
    if (event.node.req.method !== 'POST') {
        throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
    }

    const body = await readBody(event) as { username?: string; password?: string; name?: string };
    const { username, password, name } = body;

    if (!username || !password || !name) {
        throw createError({ statusCode: 400, statusMessage: 'username, password and name are required' });
    }

    const existing = await UsersQueryBuilder.findUserByUsername(username);
    if (existing) {
        throw createError({ statusCode: 409, statusMessage: 'Username already exists' });
    }

    try {
        const hashed = await argonHash(password);
        const created = await UsersQueryBuilder.createUser({ username, password: hashed, name });
        // don't return password
        return created;
    } catch (err: unknown) {
        logger.error('Failed to create user', { error: err instanceof Error ? err.message : String(err), username });
        throw createError({ statusCode: 500, statusMessage: 'Failed to create user' });
    }
});
