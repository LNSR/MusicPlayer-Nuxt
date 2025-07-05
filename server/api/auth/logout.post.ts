import { getCookie, setCookie, createError } from 'h3'
import redis from '~/lib/redis'

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session_id')

  if (!sessionId) {
    throw createError({ statusCode: 401, statusMessage: 'Not logged in' })
  }

  // Remove session from Redis
  await redis.del(`session:${sessionId}`)

  // Remove session cookie
  setCookie(event, 'session_id', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    secure: process.env.NODE_ENV === 'production'
  })

  return { success: true }
})