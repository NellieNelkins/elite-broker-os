import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

function getConnectionString(): string {
  const url =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (!url) {
    throw new Error(
      "No database connection string found. Set DATABASE_URL, POSTGRES_PRISMA_URL, or POSTGRES_URL."
    );
  }

  // Supabase pooler requires SSL
  const parsed = new URL(url);
  if (!parsed.searchParams.has("sslmode")) {
    parsed.searchParams.set("sslmode", "require");
  }
  return parsed.toString();
}

function createPrismaClient() {
  const connectionString = getConnectionString();
  const pool = new pg.Pool({
    connectionString,
    max: 2,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 15_000,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
