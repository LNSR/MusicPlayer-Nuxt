import prisma, { ROLE } from '~/lib/prisma'
import redis from '~/lib/redis'
import argon2 from 'argon2'

// Rate limit config
const WINDOW_SECONDS = 60 * 5 // 5 menit
const MAX_ATTEMPTS = 5

export default defineEventHandler(async (event) => {


  const ip = getRequestIP(event)

  // Rate limiting key
  const rateKey = `register:attempts:${ip}`

  // Increment attempts in Redis
  const attempts = await redis.incr(rateKey)
  if (attempts === 1) {
    await redis.expire(rateKey, WINDOW_SECONDS)
  }
  if (attempts > MAX_ATTEMPTS) {
    throw createError({ statusCode: 429, message: `Terlalu banyak percobaan. Coba lagi dalam beberapa menit.` })
  }

  const { name, email, password, role } = await readBody<{ name: string; email: string; password: string; role?: ROLE }>(event)

  if (!name || !email || !password) {
    throw createError({ statusCode: 400, message: 'Semua field wajib diisi.' })
  }

  if (password.length < 8) {
    throw createError({ statusCode: 400, message: 'Password minimal 8 karakter.' })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw createError({ statusCode: 400, message: 'Email sudah terdaftar.' })
  }

  // Only allow ADMIN/SUPERADMIN creation if already authenticated as admin
  let userRole: ROLE = ROLE.USER
  if (role && (role === ROLE.ADMIN || role === ROLE.SUPERADMIN)) {
    // Check if current session is admin
    const sessionToken = getCookie(event, 'session_token')
    let isAdmin = false
    if (sessionToken) {
      const sessionRaw = await redis.get(`session:${sessionToken}`)
      if (sessionRaw) {
        const session = JSON.parse(sessionRaw)
        if (session.role === ROLE.ADMIN || session.role === ROLE.SUPERADMIN) {
          isAdmin = true
        }
      }
    }
    if (isAdmin) {
      userRole = role
    }
  }

  const hashedPassword = await argon2.hash(password)
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role: userRole },
    select: { id: true, name: true, email: true, role: true }
  })

  return { user }
})