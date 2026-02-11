import { PrismaClient } from '@prisma/client'

// Global singleton pattern for Prisma client
declare global {
  var prisma: PrismaClient | undefined
}

// Export singleton instance with accelerateUrl for Prisma 7.x
export const prisma = global.prisma || new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL?.includes('prisma+postgres') ? process.env.DATABASE_URL : undefined
})

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}