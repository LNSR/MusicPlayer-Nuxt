import redis from '~/lib/redis'

export default defineEventHandler(async (event) => {
  const sessionToken = getCookie(event, 'session_token')
  if (sessionToken) {
    await redis.del(`session:${sessionToken}`)
    setCookie(event, 'session_token', '', { path: '/', maxAge: 0 })
  }
  return { message: 'Logged out' }
})