import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Home as HomeIcon, Clock } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { RefreshMarketButton } from "./refresh-button";

export const metadata: Metadata = { title: "Market Insights — Elite Broker OS" };
export const dynamic = "force-dynamic";

function fmt(n: number) {
  return new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function tierVariant(tier: string): "green" | "amber" | "default" {
  return tier === "priority" ? "green" : tier === "premium" ? "amber" : "default";
}

function tierLabel(tier: string): string {
  return tier === "priority" ? "Priority" : tier === "premium" ? "Premium" : "Standard";
}

export default async function MarketPage() {
  const communities = await prisma.community.findMany({
    orderBy: [{ tier: "asc" }, { name: "asc" }],
  });

  const priorityCount = communities.filter(c => c.tier === "priority").length;
  const lastRefresh = communities[0]?.lastRefreshedAt;

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-gold)]">Market Insights</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Expert community data sourced from PropertyMonitor, DXBInteract, Bayut, PropertyFinder, DLD
          </p>
        </div>
        <RefreshMarketButton />
      </div>

      {communities.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              No community data yet. Run the refresh below or hit{" "}
              <code className="rounded bg-[var(--bg-elevated)] px-1.5 py-0.5 text-xs">/api/market/refresh</code>
            </p>
          </CardContent>
        </Card>
      )}

      {communities.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-[var(--text-muted)]">Communities Tracked</p>
                <p className="mt-1 font-mono text-2xl font-semibold text-[var(--text-gold)]">{communities.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-[var(--text-muted)]">Priority Villa Communities</p>
                <p className="mt-1 font-mono text-2xl font-semibold text-[var(--green)]">{priorityCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-[var(--text-muted)]">Avg Yield (Priority)</p>
                <p className="mt-1 font-mono text-2xl font-semibold text-[var(--blue)]">
                  {(communities.filter(c => c.tier === "priority").reduce((s, c) => s + c.avgYield, 0) / (priorityCount || 1)).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-[var(--text-muted)]">Last Refresh</p>
                <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                  {lastRefresh ? new Date(lastRefresh).toLocaleString("en-AE", { dateStyle: "medium", timeStyle: "short" }) : "Never"}
                </p>
              </CardContent>
            </Card>
          </div>

          {(["priority", "premium", "standard"] as const).map(tier => {
            const tierCommunities = communities.filter(c => c.tier === tier);
            if (tierCommunities.length === 0) return null;
            return (
              <div key={tier} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-[var(--text-secondary)]">{tierLabel(tier)} Communities</h2>
                  <Badge variant={tierVariant(tier)}>{tierCommunities.length}</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {tierCommunities.map(c => (
                    <Card key={c.id} className="transition-all hover:border-[var(--border-gold)]">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-[var(--text-primary)]">{c.name}</CardTitle>
                            <p className="mt-1 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                              <MapPin size={11} /> {c.developer || "—"} · {c.handover || "—"}
                            </p>
                          </div>
                          <Badge variant={tierVariant(c.tier)}>{tierLabel(c.tier)}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-xs leading-relaxed text-[var(--text-muted)] line-clamp-3">{c.description}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-md bg-[var(--bg-elevated)] p-2">
                            <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Avg PSF</p>
                            <p className="font-mono text-sm font-semibold text-[var(--text-gold)]">AED {c.avgPricePerSqft.toLocaleString()}</p>
                          </div>
                          <div className="rounded-md bg-[var(--bg-elevated)] p-2">
                            <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Avg Yield</p>
                            <p className="font-mono text-sm font-semibold text-[var(--blue)]">{c.avgYield.toFixed(1)}%</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 text-[var(--text-muted)]"><HomeIcon size={11} />{c.propertyTypes}</span>
                          <span className="flex items-center gap-1 text-[var(--text-muted)]"><TrendingUp size={11} />{fmt(c.minPrice)} - {fmt(c.maxPrice)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}

          <Card>
            <CardContent className="py-4">
              <div className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                <Clock size={14} className="mt-0.5 shrink-0 text-[var(--text-gold)]" />
                <div className="space-y-1">
                  <p className="font-medium text-[var(--text-secondary)]">Daily refresh at 03:00 UTC via Vercel Cron.</p>
                  <p>
                    Live ingestion hooks for PropertyMonitor, DXBInteract, PropertyFinder, Bayut, and DLD are wired in{" "}
                    <code className="rounded bg-[var(--bg-elevated)] px-1 py-0.5">src/lib/market-sources/</code>.
                    Set API keys (<code>PROPERTY_MONITOR_API_KEY</code>, <code>DLD_API_TOKEN</code>, etc.) in Vercel env to enable live data.
                    Baseline expert data always available from seed.
                  </p>
                  <p className="pt-1">
                    <Link href="/dashboard/agents" className="text-[var(--text-gold)] hover:underline">Configure Community Expert agent →</Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
