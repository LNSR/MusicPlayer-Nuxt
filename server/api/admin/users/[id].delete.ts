import prisma from '~/lib/prisma'
import { requireSuperAdmin } from '~/server/utils/checkAdmin'

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event)
  const id = Number(event.context.params?.id)
  if (!id) {
    setResponseStatus(event, 400)
    return { message: 'Kesalahan user ID' }
  }
  await prisma.user.delete({ where: { id } })
  return { success: true }
})