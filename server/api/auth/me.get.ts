import redis from '~/lib/redis'

export default defineEventHandler(async (event) => {
  const sessionToken = getCookie(event, 'session_token')
  if (!sessionToken) {
    return { user: null }
  }
  
  const session = await redis.get(`session:${sessionToken}`)
  if (!session) {
    return { user: null }
  }
  
  return { user: JSON.parse(session) }
})