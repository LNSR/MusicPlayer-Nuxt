import { type H3Event, readBody, createError } from 'h3';
import { UsersQueryBuilder } from '@@/server/querybuilder/users.querybuilder';
import { hash as argonHash } from 'argon2';
import { logger } from '@@/lib/logger';
import type { Role } from '@prisma/client';

export default defineEventHandler(async (event: H3Event) => {
  if (event.node.req.method !== 'PUT') {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
  }

  const { id } = event.context.params ?? {};
  const uid = Number(id ?? NaN);
  if (!Number.isFinite(uid) || uid <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid user id' });
  }

  const body = await readBody(event) as { username?: string; password?: string; name?: string; role?: Role };
  const updateData: any = {};
  if (body.username) updateData.username = body.username;
  if (body.name) updateData.name = body.name;
  if (body.password) updateData.password = await argonHash(body.password);
  if (body.role) updateData.role = body.role;

  if (Object.keys(updateData).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No fields to update' });
  }

  try {
    const updated = await UsersQueryBuilder.updateUser(uid, updateData);
    if (body.password) {
      try {
        await UsersQueryBuilder.deleteUserSessions(uid);
      } catch (revokeErr: unknown) {
        logger.warn('Failed to revoke user sessions after password update', { id: uid, error: revokeErr instanceof Error ? revokeErr.message : String(revokeErr) });
      }
    }
    return updated;
  } catch (err: unknown) {
    // handle unique constraint violation on username
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn('Failed updating user', { id: uid, error: msg });
    if (String(msg).includes('Unique') || String(msg).includes('unique')) {
      throw createError({ statusCode: 409, statusMessage: 'Username already exists' });
    }
    throw createError({ statusCode: 500, statusMessage: 'Failed to update user' });
  }
});
