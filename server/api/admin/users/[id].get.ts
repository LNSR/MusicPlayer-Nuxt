import { type H3Event, createError } from 'h3';
import { UsersQueryBuilder } from '@@/server/querybuilder/users.querybuilder';

export default defineEventHandler(async (event: H3Event) => {
  if (event.node.req.method !== 'GET') {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
  }

  const { id } = event.context.params ?? {};
  const uid = Number(id ?? NaN);
  if (!Number.isFinite(uid) || uid <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid user id' });
  }

  const user = await UsersQueryBuilder.findUserById(uid);
  if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' });

  return user;
});
