import { PrismaClient, ROLE } from '@prisma/client'
import type { User as PrismaUser, Track as PrismaTrack } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare const globalThis: {
  prismaGlobal?: PrismaClient
} & typeof global

const prisma =
  process.env.NODE_ENV !== 'production'
    ? (globalThis.prismaGlobal ??= prismaClientSingleton())
    : prismaClientSingleton();

export { prisma, ROLE }
export type { PrismaUser, PrismaTrack }
export default prisma
