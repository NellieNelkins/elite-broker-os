import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { AnalyticsView } from "./analytics-view";

export const dynamic = "force-dynamic";

async function resolveUserId(): Promise<string | null> {
  const session = await auth();
  if (session?.user?.id) return session.user.id;
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
  return user?.id ?? null;
}

const STAGES = ["Lead", "Qualified", "Viewing Done", "Offer Made", "Under Offer", "Closed"] as const;

function startOfPeriod(period: "mtd" | "qtd" | "ytd"): Date {
  const now = new Date();
  if (period === "mtd") return new Date(now.getFullYear(), now.getMonth(), 1);
  if (period === "qtd") {
    const q = Math.floor(now.getMonth() / 3) * 3;
    return new Date(now.getFullYear(), q, 1);
  }
  return new Date(now.getFullYear(), 0, 1);
}

export default async function AnalyticsPage() {
  const userId = await resolveUserId();
  if (!userId) {
    return <div className="p-6 text-sm text-[var(--text-muted)]">No data yet.</div>;
  }

  const [contacts, deals] = await Promise.all([
    prisma.contact.findMany({
      where: { userId },
      select: { id: true, source: true, value: true, stage: true, createdAt: true },
    }),
    prisma.deal.findMany({
      where: { userId },
      select: {
        id: true, stage: true, value: true, commission: true, netCommission: true,
        contactId: true, createdAt: true, keysHandedAt: true, transferredAt: true,
      },
    }),
  ]);

  // Funnel counts (contacts by stage)
  const funnel = STAGES.map((stage) => ({
    stage,
    count: contacts.filter((c) => c.stage === stage).length,
  }));
  const totalFunnel = funnel[0]?.count || 1;
  const funnelWithRates = funnel.map((f, i) => ({
    ...f,
    pctOfTop: totalFunnel ? Math.round((f.count / totalFunnel) * 100) : 0,
    conversionFromPrev:
      i === 0
        ? 100
        : funnel[i - 1].count
          ? Math.round((f.count / funnel[i - 1].count) * 100)
          : 0,
  }));

  // Source ROI — contacts grouped by source, closed count & value
  const sourceMap = new Map<
    string,
    { leads: number; closed: number; value: number; commission: number }
  >();
  contacts.forEach((c) => {
    const key = c.source || "Unknown";
    const s = sourceMap.get(key) || { leads: 0, closed: 0, value: 0, commission: 0 };
    s.leads += 1;
    sourceMap.set(key, s);
  });
  deals.forEach((d) => {
    const contact = contacts.find((c) => c.id === d.contactId);
    const key = contact?.source || "Unknown";
    const s = sourceMap.get(key) || { leads: 0, closed: 0, value: 0, commission: 0 };
    if (d.stage === "Closed") {
      s.closed += 1;
      s.value += d.value;
      s.commission += d.value * d.commission;
    }
    sourceMap.set(key, s);
  });
  const sources = Array.from(sourceMap.entries())
    .map(([name, s]) => ({
      name,
      leads: s.leads,
      closed: s.closed,
      value: s.value,
      commission: s.commission,
      conversion: s.leads ? Math.round((s.closed / s.leads) * 100) : 0,
    }))
    .sort((a, b) => b.commission - a.commission);

  // Commission periods
  const periods = (["mtd", "qtd", "ytd"] as const).map((period) => {
    const since = startOfPeriod(period);
    const closedInPeriod = deals.filter(
      (d) =>
        d.stage === "Closed" &&
        (d.keysHandedAt || d.transferredAt || d.createdAt) >= since,
    );
    const gross = closedInPeriod.reduce((s, d) => s + d.value * d.commission, 0);
    const net = closedInPeriod.reduce(
      (s, d) => s + (d.netCommission > 0 ? d.netCommission : d.value * d.commission),
      0,
    );
    return {
      period,
      deals: closedInPeriod.length,
      gross,
      net,
      gmv: closedInPeriod.reduce((s, d) => s + d.value, 0),
    };
  });

  // Days-to-close
  const closedDeals = deals.filter((d) => d.stage === "Closed");
  const daysToClose = closedDeals
    .map((d) => {
      const end = d.keysHandedAt || d.transferredAt;
      if (!end) return null;
      return Math.round((new Date(end).getTime() - new Date(d.createdAt).getTime()) / 86400000);
    })
    .filter((n): n is number => n !== null && n >= 0);
  const avgDaysToClose =
    daysToClose.length > 0
      ? Math.round(daysToClose.reduce((a, b) => a + b, 0) / daysToClose.length)
      : 0;

  return (
    <AnalyticsView
      funnel={funnelWithRates}
      sources={sources}
      periods={periods}
      avgDaysToClose={avgDaysToClose}
      closedCount={closedDeals.length}
    />
  );
}
