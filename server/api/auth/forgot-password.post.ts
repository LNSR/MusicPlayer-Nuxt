import redis from '~/lib/redis'
import { randomBytes } from 'crypto'

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event)
  
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    // Don't reveal if email exists
    return { message: 'If email exists, reset link sent' }
  }
  
  const resetToken = randomBytes(32).toString('hex')
  
  // Store token for 1 hour
  await redis.setex(`reset:${resetToken}`, 3600, user.id.toString())
  
  // Send email with reset link (implement email service)
  // await sendResetEmail(email, resetToken)
  
  return { message: 'If email exists, reset link sent' }
})