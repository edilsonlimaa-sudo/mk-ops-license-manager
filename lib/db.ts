import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL || "";
  
  // Debug: Log connection attempt (mask password)
  if (typeof window === "undefined") { // Only log on server side
    const masked = connectionString.replace(/:(\w+)@/, ':****@');
    console.log('[DB] Creating Prisma Client with connection:', masked || '❌ EMPTY');
  }
  
  return new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
