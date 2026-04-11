import { PrismaClient } from '@prisma/client'

const globalThis_prisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalThis_prisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalThis_prisma.prisma = prisma
