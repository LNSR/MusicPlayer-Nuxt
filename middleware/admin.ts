import type { PrismaUser } from '~/lib/prisma'
import { ROLE } from '~/lib/prisma'

export default defineNuxtRouteMiddleware(async (_to, _from) => {
  const { data } = await useFetch<{ user?: PrismaUser }>('/api/auth/user', { credentials: 'include' })
  const user = data.value?.user

  if (!user) {
    return navigateTo('/')
  }

  const role = user.role as ROLE | undefined
  if (!role || (role !== ROLE.SUPERADMIN && role !== ROLE.ADMIN)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Diperlukan akses admin'
    })
  }
})