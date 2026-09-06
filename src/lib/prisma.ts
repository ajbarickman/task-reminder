import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export function getPrisma(): PrismaClient | null {
  if (!process.env.POSTGRES_PRISMA_URL && !process.env.DATABASE_URL) {
    return null;
  }
  if (!globalForPrisma.prisma) {
    try {
      globalForPrisma.prisma = new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      });
    } catch (err) {
      console.warn("Could not initialize PrismaClient:", err);
      return null;
    }
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    if (!client) {
      throw new Error("Prisma accessed without POSTGRES_PRISMA_URL or DATABASE_URL configured.");
    }
    return (client as any)[prop];
  },
});
