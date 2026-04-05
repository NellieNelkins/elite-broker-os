import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const tier = req.nextUrl.searchParams.get("tier");
  const slug = req.nextUrl.searchParams.get("slug");

  if (slug) {
    const community = await prisma.community.findUnique({
      where: { slug },
      include: {
        dataPoints: { orderBy: { capturedAt: "desc" }, take: 20 },
      },
    });
    if (!community) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: community });
  }

  const communities = await prisma.community.findMany({
    where: tier ? { tier } : undefined,
    orderBy: [{ tier: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ data: communities });
}
