import prisma from '~/lib/prisma'
import { requireSuperAdmin } from '~/server/utils/checkAdmin'

export default defineEventHandler(async (event) => {
  const currentUser = await requireSuperAdmin(event)
  
  const id = Number(event.context.params?.id)
  if (!id) {
    setResponseStatus(event, 400)
    return { message: 'Kesalahan user ID' }
  }

  const body = await readBody<{ name: string; email: string; role?: string }>(event)
  const name = body.name?.trim()
  const email = body.email?.trim().toLowerCase()
  const role = body.role

  if (!name || !email) {
    setResponseStatus(event, 400)
    return { message: 'Name and email are required' }
  }

  // Check if email is already taken by another user
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing && existing.id !== id) {
    setResponseStatus(event, 400)
    return { message: 'Email already registered' }
  }

  // Only SUPERADMIN can change roles
  const updateData: any = { name, email }
  if (role && currentUser.role === 'SUPERADMIN') {
    if (['USER', 'ADMIN', 'SUPERADMIN'].includes(role)) {
      updateData.role = role
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  })

  return { user }
})