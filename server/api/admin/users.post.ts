import prisma from '~/lib/prisma'
import bcrypt from 'bcryptjs'
import { requireSuperAdmin } from '~/server/utils/checkAdmin'

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event)
  
  const body = await readBody<{ name: string; email: string; password: string }>(event)
  const name = body.name?.trim()
  const email = body.email?.trim().toLowerCase()
  const password = body.password

  if (!name || !email || !password) {
    setResponseStatus(event, 400)
    return { message: 'All fields are required' }
  }

  if (password.length < 8) {
    setResponseStatus(event, 400)
    return { message: 'Password must be at least 8 characters' }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    setResponseStatus(event, 400)
    return { message: 'Email already registered' }
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  })

  return { user }
})