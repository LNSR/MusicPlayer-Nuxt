import { sendError } from 'h3'
import { UserService, UserSessionService } from '~/server/service/users/users'
import { z } from 'zod'

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  role: z.enum(['SUPERADMIN', 'ADMIN', 'VISITOR']).optional()
})

export default defineEventHandler(async (event) => {
  const userSessionService = new UserSessionService()
  const sessionUser = await userSessionService.getSessionUser(event)
  if (!sessionUser || (sessionUser.role !== 'SUPERADMIN' && sessionUser.role !== 'ADMIN')) {
    return sendError(event, createError({ statusCode: 403, statusMessage: 'Forbidden' }))
  }

  const body = await readBody(event)
  const parse = createUserSchema.safeParse(body)
  if (!parse.success) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Invalid input' }))
  }

  try {
    const userService = new UserService()
    const user = await userService.createUser(parse.data)
    return { success: true, user }
  } catch (err) {
    return sendError(event, createError({ statusCode: 500, statusMessage: 'Failed to create user' }))
  }
})