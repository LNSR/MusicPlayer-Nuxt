import { getCookie } from 'h3'
import { prisma } from '~/lib/prisma'
import redis from '~/lib/redis'

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session_id')
  if (!sessionId) return null

  const session = await redis.get(`session:${sessionId}`)
  if (!session) return null

  const { userId } = JSON.parse(session)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true }
  })
  return user ? { name: user.name } : null
})