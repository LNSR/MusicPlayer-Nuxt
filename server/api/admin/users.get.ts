import prisma from '~/lib/prisma'
import { requireSuperAdmin } from '~/server/utils/checkAdmin'

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event)
  
  const users = await prisma.user.findMany({
    select: { 
      id: true, 
      name: true, 
      email: true, 
      role: true, 
      createdAt: true 
    },
    orderBy: { id: 'asc' }
  })
  
  return { users }
})