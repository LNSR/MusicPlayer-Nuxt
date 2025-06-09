import redis from '~/lib/redis'
import { verifyJwt } from '~/lib/jwt'

export default defineEventHandler(async (event) => {
  const sessionToken = getCookie(event, 'session_token')
  if (!sessionToken) return { user: null }

  const jwtPayload = verifyJwt(sessionToken)
  if (!jwtPayload) return { user: null }

  const sessionRaw = await redis.get(`session:${sessionToken}`)
  if (!sessionRaw) return { user: null }

  const session = JSON.parse(sessionRaw)
  return { user: session }
})