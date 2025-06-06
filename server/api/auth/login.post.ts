import prisma from '~/lib/prisma'
import redis from '~/lib/redis'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; password: string }>(event)
  const identifier = body.email?.trim()
  const password = body.password

  if (!identifier || !password) {
    setResponseStatus(event, 400)
    return { message: 'Email/Name and password are required' }
  }

  const isEmail = identifier.includes('@')
  const whereClause = isEmail 
    ? { email: identifier.toLowerCase() }
    : { name: identifier }

  const user = await prisma.user.findFirst({ 
    where: whereClause,
    select: { id: true, name: true, email: true, role: true, password: true }
  })
  
  const hashed = user?.password || '$2a$10$invalidinvalidinvalidinvalidinv'
  const valid = await bcrypt.compare(password, hashed)

  if (!user || !valid) {
    setResponseStatus(event, 401)
    return { message: 'Kesalahan kredensial' }
  }

  const sessionToken = randomBytes(32).toString('hex')
  await redis.set(`session:${sessionToken}`, JSON.stringify({ 
    id: user.id, 
    name: user.name, 
    email: user.email,
    role: user.role 
  }), 'EX', 60 * 60 * 24 * 7)

  setCookie(event, 'session_token', sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'production'
  })

  return { user: { id: user.id, name: user.name, email: user.email, role: user.role } }
})