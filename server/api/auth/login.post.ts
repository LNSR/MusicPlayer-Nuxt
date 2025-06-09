import prisma from '~/lib/prisma'
import redis from '~/lib/redis'
import argon2 from 'argon2'
import { signJwt } from '~/lib/jwt'

const JWT_EXPIRES_IN = '7d'
const WINDOW_SECONDS = 60 * 5 // 5 menit
const MAX_ATTEMPTS = 10

export default defineEventHandler(async (event) => {
  const userAgent = event.node.req.headers['user-agent'] || ''

  // Rate limiting (no IP/subnet logic)
  const rateKey = `login:attempts:${userAgent}`
  const attempts = await redis.incr(rateKey)
  if (attempts === 1) await redis.expire(rateKey, WINDOW_SECONDS)
  if (attempts > MAX_ATTEMPTS) {
    throw createError({ statusCode: 429, message: `Terlalu banyak percobaan login. Coba lagi dalam beberapa menit.` })
  }

  const { identifier, password } = await readBody<{ identifier: string; password: string }>(event)
  if (!identifier || !password) {
    throw createError({ statusCode: 400, message: 'Kesalahan username/email atau password' })
  }

  const user = await prisma.user.findFirst({
    where: { OR: [{ name: identifier }, { email: identifier }] }
  })
  if (!user?.password) {
    throw createError({ statusCode: 401, message: 'Kesalahan username/email atau password' })
  }

  const valid = await argon2.verify(user.password, password)
  if (!valid) {
    throw createError({ statusCode: 401, message: 'Kesalahan username/email atau password' })
  }

  const payload = { id: user.id, name: user.name, email: user.email, role: user.role }
  const token = signJwt(payload, { expiresIn: JWT_EXPIRES_IN })

  // Store session with just userAgent
  await redis.set(
    `session:${token}`,
    JSON.stringify({ ...payload, userAgent }),
    'EX',
    60 * 60 * 24 * 7
  )

  setCookie(event, 'session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7
  })

  return { user: payload, token }
})
