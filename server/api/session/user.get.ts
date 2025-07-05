import { UserSessionService } from '~/server/service/users/users'

export default defineEventHandler(async (event) => {
  const userSessionService = new UserSessionService()
  const sessionUser = await userSessionService.getSessionUser(event)
  return sessionUser
    ? {
        name: sessionUser.name,
        email: sessionUser.email,
        isAdmin: sessionUser.role === 'ADMIN' || sessionUser.role === 'SUPERADMIN'
      }
    : null
})