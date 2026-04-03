import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function resolveUserId(): Promise<string> {
  const session = await auth();
  if (session?.user?.id) return session.user.id;
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) throw new Error("No users found");
  return user.id;
}

interface NotificationItem {
  id: string;
  type: "follow_up" | "deal" | "activity";
  title: string;
  description: string;
  createdAt: Date;
}

export async function GET() {
  try {
    const userId = await resolveUserId();

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const [overdueContacts, hotDeals, recentActivities] = await Promise.all([
      // Contacts not contacted in 14+ days
      prisma.contact.findMany({
        where: {
          userId,
          OR: [
            { lastContactedAt: { lt: fourteenDaysAgo } },
            { lastContactedAt: null },
          ],
          stage: { notIn: ["Closed", "Lost"] },
        },
        orderBy: { lastContactedAt: "asc" },
        take: 5,
        select: {
          id: true,
          name: true,
          lastContactedAt: true,
          stage: true,
        },
      }),

      // Hot deals: stage is "Offer Made" or "Under Offer"
      prisma.deal.findMany({
        where: {
          userId,
          stage: { in: ["Offer Made", "Under Offer"] },
        },
        orderBy: { updatedAt: "desc" },
        take: 3,
        select: {
          id: true,
          name: true,
          stage: true,
          value: true,
          updatedAt: true,
        },
      }),

      // Activity in last 24h
      prisma.activity.findMany({
        where: {
          userId,
          createdAt: { gte: twentyFourHoursAgo },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          type: true,
          description: true,
          createdAt: true,
        },
      }),
    ]);

    const items: NotificationItem[] = [];

    for (const contact of overdueContacts) {
      const daysAgo = contact.lastContactedAt
        ? Math.floor(
            (Date.now() - contact.lastContactedAt.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : null;
      items.push({
        id: `followup-${contact.id}`,
        type: "follow_up",
        title: `Follow up with ${contact.name}`,
        description: daysAgo
          ? `No contact in ${daysAgo} days`
          : "Never contacted",
        createdAt: contact.lastContactedAt || new Date(0),
      });
    }

    for (const deal of hotDeals) {
      items.push({
        id: `deal-${deal.id}`,
        type: "deal",
        title: `${deal.name}`,
        description: `${deal.stage} — AED ${(deal.value / 1_000_000).toFixed(1)}M`,
        createdAt: deal.updatedAt,
      });
    }

    for (const activity of recentActivities) {
      items.push({
        id: `activity-${activity.id}`,
        type: "activity",
        title: `New ${activity.type}`,
        description: activity.description,
        createdAt: activity.createdAt,
      });
    }

    // Sort by most recent/urgent first, limit to 10
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const limited = items.slice(0, 10);

    return NextResponse.json({
      success: true,
      count: limited.length,
      items: limited,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
