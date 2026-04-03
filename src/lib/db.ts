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

  // Remove sslmode from URL — we configure SSL via pg.Pool options instead.
  // Newer pg versions treat sslmode=require as verify-full, which rejects
  // Supabase's self-signed certificates. By stripping it here and using
  // ssl: { rejectUnauthorized: false } on the Pool, we get encrypted
  // connections without certificate chain validation.
  const parsed = new URL(url);
  parsed.searchParams.delete("sslmode");
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
