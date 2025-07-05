import type { H3Event } from 'h3'
import { readBody, createError } from 'h3'
import { prisma } from '~/lib/prisma'
import argon2 from 'argon2'

export default defineEventHandler(async (event: H3Event) => {
  const { email, password, name } = await readBody(event)

  // Input validation
  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email ||
    !password
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input' })
  }

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Email already registered' })
  }

  // Hash password
  const hashedPassword = await argon2.hash(password)

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: typeof name === 'string' ? name : undefined,
      role: 'VISITOR',
    },
    select: { id: true, email: true, name: true, role: true }
  })

  return user
})