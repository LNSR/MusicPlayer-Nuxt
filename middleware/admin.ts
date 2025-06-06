export default defineNuxtRouteMiddleware(async (_to, _from) => {
  const { data } = await useFetch<{ user?: { role: string } }>('/api/auth/me')
  const user = data.value?.user
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }
  
  if (!['SUPERADMIN', 'ADMIN'].includes(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }
})