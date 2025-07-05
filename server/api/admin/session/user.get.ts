import { UserSessionService } from '~/server/service/users/users'

export default defineEventHandler(async (event) => {
  const userSessionService = new UserSessionService()
  const user = await userSessionService.getSessionUser(event)
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
    return null
  }

  return {
    user: user.name,
    email: user.email,
    isAdmin: user.role === 'ADMIN' || user.role === 'SUPERADMIN',
    isLoggedIn: true
  }
})