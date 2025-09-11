import { getQuery } from 'h3';
import { UsersQueryBuilder } from '@@/server/querybuilder/users.querybuilder';

export default defineEventHandler(async (event) => {
	if (event.node.req.method !== 'GET') {
		throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
	}

	const query = getQuery(event) as { page?: string; perPage?: string };
	const page = Math.max(1, Number(query.page ?? 1));
	const perPage = Math.min(100, Math.max(1, Number(query.perPage ?? 20)));

	const skip = (page - 1) * perPage;

	const users = await UsersQueryBuilder.findUsers(skip, perPage);

	const total = await UsersQueryBuilder.countUsers();

	return { data: users, meta: { page, perPage, total } };
});
