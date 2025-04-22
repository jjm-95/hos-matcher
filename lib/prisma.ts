// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // 로그를 활성화하여 디버깅에 도움
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;