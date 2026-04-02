import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getConnectionString(): string {
  // Support multiple env var names:
  // - DATABASE_URL: manual setup
  // - POSTGRES_PRISMA_URL: Supabase-Vercel integration (pooled, recommended)
  // - POSTGRES_URL: Supabase-Vercel integration (pooled)
  // - POSTGRES_URL_NON_POOLING: Supabase-Vercel integration (direct)
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (!url) {
    throw new Error(
      "No database connection string found. Set DATABASE_URL, POSTGRES_PRISMA_URL, or POSTGRES_URL."
    );
  }
  return url;
}

function createPrismaClient() {
  const connectionString = getConnectionString();
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
