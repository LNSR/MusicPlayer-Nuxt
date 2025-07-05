import { sendError } from 'h3'
import type { H3Event } from 'h3'
import { UserService, UserSessionService } from '~/server/service/users/users'

export default async function (event: H3Event) {
  const userSessionService = new UserSessionService()
  const sessionUser = await userSessionService.getSessionUser(event)
  if (!sessionUser || (sessionUser.role !== 'SUPERADMIN' && sessionUser.role !== 'ADMIN')) {
    return sendError(event, createError({ statusCode: 403, statusMessage: 'Forbidden' }))
  }

  const userId = Number(event.context.params?.userId)
  if (isNaN(userId)) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Invalid user ID' }))
  }

  try {
    const userService = new UserService()
    await userService.deleteUser(userId)
    return { success: true }
  } catch (err) {
    return sendError(event, createError({ statusCode: 500, statusMessage: 'Failed to delete user' }))
  }
}