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

// --- Activity Feed ---

export async function getActivities(opts?: { page?: number; pageSize?: number; type?: string }) {
  const userId = await getUserId();
  if (!userId) return { activities: [], total: 0 };

  const page = opts?.page || 1;
  const pageSize = Math.min(opts?.pageSize || 30, 100);

  const where = {
    userId,
    ...(opts?.type && { type: opts.type }),
  };

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        contact: { select: { id: true, name: true, phone: true } },
        deal: { select: { id: true, name: true, stage: true, value: true } },
      },
    }),
    prisma.activity.count({ where }),
  ]);

  return {
    activities: activities.map((a) => ({
      id: a.id,
      type: a.type,
      description: a.description,
      createdAt: a.createdAt.toISOString(),
      contact: a.contact ? { id: a.contact.id, name: a.contact.name, phone: a.contact.phone } : null,
      deal: a.deal ? { id: a.deal.id, name: a.deal.name, stage: a.deal.stage, value: a.deal.value } : null,
    })),
    total,
  };
}

// --- Follow-up Reminders ---

export async function getFollowUpReminders() {
  const userId = await getUserId();
  if (!userId) return [];

  const contacts = await prisma.contact.findMany({
    where: {
      userId,
      stage: { notIn: ["Closed", "Lost"] },
    },
    orderBy: { lastContactedAt: "asc" },
    include: {
      deals: {
        where: { stage: { notIn: ["Closed", "Lost"] } },
        select: { id: true, name: true, stage: true, value: true },
        take: 1,
      },
    },
  });

  const now = Date.now();

  return contacts
    .map((c) => {
      const lastContact = c.lastContactedAt?.getTime() || c.createdAt.getTime();
      const daysSince = Math.floor((now - lastContact) / (1000 * 60 * 60 * 24));

      let urgency: "overdue" | "due_today" | "upcoming" | "ok";
      if (daysSince >= 14) urgency = "overdue";
      else if (daysSince >= 7) urgency = "due_today";
      else if (daysSince >= 5) urgency = "upcoming";
      else urgency = "ok";

      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        type: c.type,
        stage: c.stage,
        priority: c.priority,
        community: c.community,
        daysSinceContact: daysSince,
        lastContactedAt: c.lastContactedAt?.toISOString() || null,
        urgency,
        deal: c.deals[0] ? {
          id: c.deals[0].id,
          name: c.deals[0].name,
          stage: c.deals[0].stage,
          value: c.deals[0].value,
        } : null,
      };
    })
    .filter((c) => c.urgency !== "ok")
    .sort((a, b) => b.daysSinceContact - a.daysSinceContact);
}

// --- Coach ---

export async function getCoachSession(date?: Date) {
  const userId = await getUserId();
  if (!userId) return null;

  const targetDate = date || new Date();
  // Normalize to start of day in UTC (consistent across server environments)
  const dayStart = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate()));

  let session = await prisma.coachSession.findUnique({
    where: { userId_date: { userId, date: dayStart } },
  });

  if (!session) {
    // Calculate streak from previous sessions
    const yesterday = new Date(dayStart);
    yesterday.setDate(yesterday.getDate() - 1);
    const prevSession = await prisma.coachSession.findUnique({
      where: { userId_date: { userId, date: yesterday } },
    });
    const streak = prevSession && prevSession.score > 0 ? prevSession.streak + 1 : 0;

    session = await prisma.coachSession.create({
      data: {
        userId,
        date: dayStart,
        habits: [],
        challengesDone: [],
        streak,
        score: 0,
        targetCalls: 5,
        targetViewings: 1,
        targetOffers: 0,
      },
    });
  }

  // Get personal best streak
  const bestSession = await prisma.coachSession.findFirst({
    where: { userId },
    orderBy: { streak: "desc" },
    select: { streak: true },
  });

  return {
    id: session.id,
    date: session.date.toISOString(),
    habits: session.habits as Array<{ name: string; completed: boolean; points: number }>,
    challengesDone: session.challengesDone as string[],
    streak: session.streak,
    score: session.score,
    personalBest: bestSession?.streak || 0,
    targetCalls: session.targetCalls,
    targetViewings: session.targetViewings,
    targetOffers: session.targetOffers,
  };
}

// --- WhatsApp Contacts ---

export async function getWhatsAppContacts() {
  const userId = await getUserId();
  if (!userId) return [];

  const contacts = await prisma.contact.findMany({
    where: {
      userId,
      phone: { not: "" },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      activities: {
        where: { type: "message" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return contacts.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    community: c.community,
    type: c.type,
    stage: c.stage,
    priority: c.priority,
    whatsappConnected: c.whatsappConnected,
    replied: c.replied,
    lastMsg: c.activities[0]?.description || null,
    lastMsgAt: c.activities[0]?.createdAt.toISOString() || c.updatedAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));
}

// --- Campaigns ---

export async function getCampaigns() {
  const userId = await getUserId();
  if (!userId) return { campaigns: [], totals: { sent: 0, replies: 0, rate: 0 } };

  const campaigns = await prisma.campaign.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { contacts: true } },
    },
  });

  const totalSent = campaigns.reduce((s, c) => s + c.sentCount, 0);
  const totalReplies = campaigns.reduce((s, c) => s + c.replyCount, 0);

  return {
    campaigns: campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      status: c.status,
      contactCount: c._count.contacts,
      sentCount: c.sentCount,
      replyCount: c.replyCount,
      createdAt: c.createdAt.toISOString(),
    })),
    totals: {
      sent: totalSent,
      replies: totalReplies,
      rate: totalSent > 0 ? Math.round((totalReplies / totalSent) * 1000) / 10 : 0,
    },
  };
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
