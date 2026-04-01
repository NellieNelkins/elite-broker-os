/**
 * Server-side data access functions.
 * These run ONLY on the server (in Server Components or API routes).
 * They replace the old D.contacts / D.pipeline global variables.
 */

import { prisma } from "@/lib/db";
import type { DashboardKPIs, FunnelStage, PerformanceTier } from "@/types";

// --- Helpers ---

// Temporary: get the first user in the DB (single-user app for now)
// Will be replaced with auth session user once Google OAuth is configured
async function getUserId(): Promise<string | null> {
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  return user?.id || null;
}

const stageProbability: Record<string, number> = {
  Lead: 10,
  Qualified: 30,
  "Viewing Done": 50,
  "Offer Made": 70,
  "Under Offer": 90,
  Closed: 100,
  Lost: 0,
};

const DEAL_STAGES = ["Lead", "Qualified", "Viewing Done", "Offer Made", "Under Offer", "Closed"];

// --- Dashboard ---

export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  const userId = await getUserId();
  if (!userId) return emptyKPIs();

  const [contacts, deals, listings] = await Promise.all([
    prisma.contact.findMany({ where: { userId } }),
    prisma.deal.findMany({ where: { userId } }),
    prisma.listing.findMany({ where: { userId } }),
  ]);

  const totalContacts = contacts.length;
  const activeDeals = deals.filter((d) => d.stage !== "Closed" && d.stage !== "Lost").length;
  const totalListings = listings.filter((l) => l.status === "Active").length;

  // Weighted commission
  const weightedCommission = deals.reduce((sum, d) => {
    const prob = (stageProbability[d.stage] ?? 30) / 100;
    return sum + d.value * d.commission * prob;
  }, 0);

  // Conversion rate (closed / total deals)
  const closedDeals = deals.filter((d) => d.stage === "Closed").length;
  const conversionRate = deals.length > 0 ? (closedDeals / deals.length) * 100 : 0;

  // Hot deals
  const hotDeals = deals.filter((d) => ["Under Offer", "Offer Made"].includes(d.stage)).length;

  // Urgent follow-ups (14+ days no contact)
  const urgentFollowUps = contacts.filter((c) => {
    if (!c.lastContactedAt) return true;
    const daysSince = Math.floor((Date.now() - c.lastContactedAt.getTime()) / (1000 * 60 * 60 * 24));
    return daysSince >= 14;
  }).length;

  // Avg days on market
  const activeListings = listings.filter((l) => l.status === "Active");
  const avgDaysOnMarket = activeListings.length > 0
    ? Math.round(activeListings.reduce((sum, l) => {
        return sum + Math.floor((Date.now() - l.listedAt.getTime()) / (1000 * 60 * 60 * 24));
      }, 0) / activeListings.length)
    : 0;

  // Performance score (simplified version of original score() function)
  const score = Math.min(100, Math.round(
    (conversionRate * 2) +
    (hotDeals * 8) +
    (totalContacts > 0 ? 20 : 0) +
    (activeDeals > 0 ? 15 : 0) +
    (totalListings > 0 ? 10 : 0) +
    (urgentFollowUps < 5 ? 15 : urgentFollowUps < 10 ? 8 : 0)
  ));

  const tier: PerformanceTier = score >= 85 ? "Elite" : score >= 70 ? "Top 10%" : score >= 50 ? "Building" : "Below Target";

  return {
    totalContacts,
    activeDeals,
    weightedCommission,
    conversionRate: Math.round(conversionRate * 10) / 10,
    hotDeals,
    urgentFollowUps,
    totalListings,
    avgDaysOnMarket,
    performanceScore: score,
    performanceTier: tier,
  };
}

export async function getFunnelStages(): Promise<FunnelStage[]> {
  const userId = await getUserId();
  if (!userId) return [];

  const deals = await prisma.deal.findMany({ where: { userId } });
  const total = deals.length || 1;

  return DEAL_STAGES.map((stage) => {
    const stageDeals = deals.filter((d) => d.stage === stage);
    return {
      name: stage as FunnelStage["name"],
      count: stageDeals.length,
      value: stageDeals.reduce((sum, d) => sum + d.value, 0),
      percentage: Math.round((stageDeals.length / total) * 100),
    };
  });
}

// --- Contacts ---

export async function getContacts(opts?: {
  page?: number;
  pageSize?: number;
  search?: string;
  stage?: string;
  type?: string;
  priority?: string;
}) {
  const userId = await getUserId();
  if (!userId) return { contacts: [], total: 0 };

  const page = opts?.page || 1;
  const pageSize = Math.min(opts?.pageSize || 20, 100);

  const where = {
    userId,
    ...(opts?.search && {
      OR: [
        { name: { contains: opts.search, mode: "insensitive" as const } },
        { phone: { contains: opts.search } },
        { community: { contains: opts.search, mode: "insensitive" as const } },
      ],
    }),
    ...(opts?.stage && { stage: opts.stage }),
    ...(opts?.type && { type: opts.type }),
    ...(opts?.priority && { priority: opts.priority }),
  };

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contact.count({ where }),
  ]);

  return { contacts, total };
}

// --- Pipeline ---

export async function getPipelineDeals() {
  const userId = await getUserId();
  if (!userId) return { stages: [], totalValue: 0, totalCommission: 0 };

  const deals = await prisma.deal.findMany({
    where: { userId },
    include: { contact: { select: { name: true, phone: true, community: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const stages = DEAL_STAGES.map((stage) => ({
    name: stage,
    deals: deals.filter((d) => d.stage === stage),
  }));

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const totalCommission = deals.reduce((sum, d) => {
    const prob = (stageProbability[d.stage] ?? 30) / 100;
    return sum + d.value * d.commission * prob;
  }, 0);

  return { stages, totalValue, totalCommission };
}

// --- Listings ---

export async function getListings() {
  const userId = await getUserId();
  if (!userId) return [];

  return prisma.listing.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

// --- Empty defaults ---

function emptyKPIs(): DashboardKPIs {
  return {
    totalContacts: 0,
    activeDeals: 0,
    weightedCommission: 0,
    conversionRate: 0,
    hotDeals: 0,
    urgentFollowUps: 0,
    totalListings: 0,
    avgDaysOnMarket: 0,
    performanceScore: 0,
    performanceTier: "Below Target",
  };
}
