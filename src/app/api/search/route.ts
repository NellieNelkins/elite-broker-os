import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Global search across contacts, deals, and listings.
 * GET /api/search?q=springs
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ contacts: [], deals: [], listings: [] });
  }

  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) {
    return NextResponse.json({ contacts: [], deals: [], listings: [] });
  }

  const searchFilter = { contains: q, mode: "insensitive" as const };

  const [contacts, deals, listings] = await Promise.all([
    prisma.contact.findMany({
      where: {
        userId: user.id,
        OR: [
          { name: searchFilter },
          { phone: { contains: q } },
          { email: searchFilter },
          { community: searchFilter },
          { notes: searchFilter },
        ],
      },
      take: 8,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        type: true,
        stage: true,
        priority: true,
        community: true,
      },
    }),
    prisma.deal.findMany({
      where: {
        userId: user.id,
        OR: [
          { name: searchFilter },
          { community: searchFilter },
          { notes: searchFilter },
        ],
      },
      take: 8,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        stage: true,
        value: true,
        commission: true,
        community: true,
      },
    }),
    prisma.listing.findMany({
      where: {
        userId: user.id,
        OR: [
          { name: searchFilter },
          { community: searchFilter },
          { address: searchFilter },
        ],
      },
      take: 8,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        type: true,
        price: true,
        community: true,
        status: true,
      },
    }),
  ]);

  return NextResponse.json({ contacts, deals, listings });
}
