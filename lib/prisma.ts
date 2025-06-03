import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  try {
    return new PrismaClient()
  } catch (error) {
    console.error('Failed to initialize PrismaClient:', error)
    throw error
  }
}

declare const globalThis: {
  prismaGlobal?: PrismaClient
} & typeof global

const prisma =
  process.env.NODE_ENV !== 'production'
    ? (globalThis.prismaGlobal ??= prismaClientSingleton())
    : prismaClientSingleton();

export default prisma
