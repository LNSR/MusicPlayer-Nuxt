import type { H3Event } from 'h3'
import { readBody, setCookie, createError } from 'h3'
import argon2 from 'argon2'
import { v4 as uuidv4 } from 'uuid'
import redis from '~/lib/redis'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event: H3Event) => {
  const { email, password } = await readBody(event)

  // Input validation
  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email ||
    !password
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input' })
  }

  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.password) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  // Check password using argon2
  const valid = await argon2.verify(user.password, password)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  // Create session
  const sessionId = uuidv4()
  await redis.set(`session:${sessionId}`, JSON.stringify({ userId: user.id }), 'EX', 60 * 60 * 24 * 7) // 7 days

  // Set session cookie (httpOnly, secure in production)
  setCookie(event, 'session_id', sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'production'
  })

  // Return user info (omit password)
  return { id: user.id, email: user.email, name: user.name, role: user.role }
})