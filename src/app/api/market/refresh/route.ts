import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SEED_COMMUNITIES } from "@/lib/communities/seed-data";
import { fetchAllSources } from "@/lib/market-sources";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/market/refresh
 * Called by Vercel Cron daily. Also accepts manual trigger.
 *
 * 1. Upserts seed communities (idempotent baseline).
 * 2. For each community, fetches from all configured external sources.
 * 3. Writes MarketDataPoint rows + updates community aggregates.
 */
export async function GET(req: NextRequest) {
  // Vercel cron auth: CRON_SECRET header OR bearer token
  const auth = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    // Allow anonymous if no secret set (dev mode)
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let seeded = 0;
  let ingested = 0;

  // Upsert all seed communities
  for (const c of SEED_COMMUNITIES) {
    await prisma.community.upsert({
      where: { slug: c.slug },
      create: {
        slug: c.slug,
        name: c.name,
        tier: c.tier,
        propertyTypes: c.propertyTypes.join(","),
        developer: c.developer,
        handover: c.handover,
        avgPricePerSqft: c.avgPricePerSqft,
        avgYield: c.avgYield,
        minPrice: c.minPrice,
        maxPrice: c.maxPrice,
        amenities: c.amenities.join(","),
        description: c.description,
      },
      update: {
        name: c.name,
        tier: c.tier,
        propertyTypes: c.propertyTypes.join(","),
        developer: c.developer,
        handover: c.handover,
        amenities: c.amenities.join(","),
        description: c.description,
        lastRefreshedAt: new Date(),
      },
    });
    seeded++;
  }

  // Ingest live data from external sources (no-op if no credentials set)
  const communities = await prisma.community.findMany();
  for (const community of communities) {
    const points = await fetchAllSources(community.slug);
    if (points.length === 0) continue;

    for (const p of points) {
      await prisma.marketDataPoint.create({
        data: {
          communityId: community.id,
          source: p.source,
          bedrooms: p.bedrooms,
          propertyType: p.propertyType,
          pricePerSqft: p.pricePerSqft,
          avgPrice: p.avgPrice,
          rentalYield: p.rentalYield,
          transactions: p.transactions,
        },
      });
      ingested++;
    }

    // Update community aggregates from latest source data
    const latestPsf = points.reduce((s, p) => s + p.pricePerSqft, 0) / points.length;
    const latestYield = points.reduce((s, p) => s + p.rentalYield, 0) / points.length;
    await prisma.community.update({
      where: { id: community.id },
      data: {
        avgPricePerSqft: latestPsf || community.avgPricePerSqft,
        avgYield: latestYield || community.avgYield,
        lastRefreshedAt: new Date(),
      },
    });
  }

  return NextResponse.json({
    success: true,
    seeded,
    ingested,
    timestamp: new Date().toISOString(),
  });
}
