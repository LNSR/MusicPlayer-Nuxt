import redis from '~/lib/redis'

export default defineEventHandler(async (event) => {
  const sessionToken = getCookie(event, 'session_token')
  
  if (sessionToken) {
    await redis.del(`session:${sessionToken}`)
    
    // Clear the cookie
    setCookie(event, 'session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    })
  }
  
  return { success: true }
})