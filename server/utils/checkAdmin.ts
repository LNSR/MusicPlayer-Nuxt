import redis from '~/lib/redis'
import type { H3Event } from 'h3'
import { setResponseStatus } from 'h3'

export async function requireAdmin(event: H3Event) {
  const sessionToken = getCookie(event, 'session_token')
  if (!sessionToken) {
    setResponseStatus(event, 401)
    throw new Error('Unauthorized')
  }
  
  const session = await redis.get(`session:${sessionToken}`)
  if (!session) {
    setResponseStatus(event, 401)
    throw new Error('Unauthorized')
  }
  
  const user = JSON.parse(session)
  if (!['SUPERADMIN', 'ADMIN'].includes(user.role)) {
    setResponseStatus(event, 403)
    throw new Error('Forbidden')
  }
  
  return user
}

export async function requireSuperAdmin(event: H3Event) {
  const sessionToken = getCookie(event, 'session_token')
  if (!sessionToken) {
    setResponseStatus(event, 401)
    throw new Error('Unauthorized')
  }
  
  const session = await redis.get(`session:${sessionToken}`)
  if (!session) {
    setResponseStatus(event, 401)
    throw new Error('Unauthorized')
  }
  
  const user = JSON.parse(session)
  if (user.role !== 'SUPERADMIN') {
    setResponseStatus(event, 403)
    throw new Error('Forbidden - SUPERADMIN access required')
  }
  
  return user
}