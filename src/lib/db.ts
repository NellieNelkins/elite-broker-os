import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getConnectionString(): string {
  // Prefer pooled connections (more reliable for serverless/Vercel)
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
  return url;
}

function createPrismaClient() {
  const connectionString = getConnectionString();

  // Supabase pooler (Supavisor) requires SSL.
  // Append sslmode=require if not already present.
  const url = new URL(connectionString);
  if (!url.searchParams.has("sslmode")) {
    url.searchParams.set("sslmode", "require");
  }

  const adapter = new PrismaPg({ connectionString: url.toString() });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
