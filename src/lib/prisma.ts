import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = `${process.env.DATABASE_URL}`;
// Vercel Serverless environment optimization for Supabase Session Mode
const pool = new Pool({
    connectionString,
    max: 1, // Restrict to 1 connection per serverless cold start
    idleTimeoutMillis: 1000, // Drop idle connections immediately
    connectionTimeoutMillis: 10000,
});
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma_v4: PrismaClient };

export const prisma =
    globalForPrisma.prisma_v4 ||
    new PrismaClient({
        adapter: adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_v4 = prisma;

