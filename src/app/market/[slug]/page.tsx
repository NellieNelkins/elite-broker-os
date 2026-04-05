import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Building2,
  Calendar,
  TrendingUp,
  ExternalLink,
  Newspaper,
  Activity as ActivityIcon,
  Home as HomeIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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

function sourceName(id: string): string {
  const names: Record<string, string> = {
    propertymonitor: "Property Monitor",
    dxbinteract: "DXB Interact",
    propertyfinder: "PropertyFinder",
    bayut: "Bayut",
    dld: "DLD / Dubai REST",
    manual: "Manual",
  };
  return names[id] || id;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const community = await prisma.community.findUnique({ where: { slug } });
  return { title: community ? `${community.name} — Elite Broker OS` : "Community — Elite Broker OS" };
}

export default async function CommunityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const community = await prisma.community.findUnique({
    where: { slug },
    include: {
      dataPoints: { orderBy: { capturedAt: "desc" }, take: 50 },
    },
  });

  if (!community) notFound();

  // Pull user's own deals and listings that match this community
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  const [matchingListings, matchingDeals, matchingContacts] = user
    ? await Promise.all([
        prisma.listing.findMany({
          where: { userId: user.id, community: { contains: community.name, mode: "insensitive" } },
          orderBy: { updatedAt: "desc" },
          take: 10,
        }),
        prisma.deal.findMany({
          where: { userId: user.id, community: { contains: community.name, mode: "insensitive" } },
          orderBy: { updatedAt: "desc" },
          take: 10,
        }),
        prisma.contact.findMany({
          where: { userId: user.id, community: { contains: community.name, mode: "insensitive" } },
          orderBy: { updatedAt: "desc" },
          take: 10,
        }),
      ])
    : [[], [], []];

  const amenities = community.amenities?.split(",").map(s => s.trim()).filter(Boolean) || [];
  const propertyTypes = community.propertyTypes.split(",").map(s => s.trim());

  // External research links
  const q = encodeURIComponent(`${community.name} Dubai`);
  const newsLinks = [
    { label: "Google News", url: `https://news.google.com/search?q=${q}+real+estate` },
    { label: "Bayut Community", url: `https://www.bayut.com/to-rent/villas/dubai/${community.slug}/` },
    { label: "PropertyFinder", url: `https://www.propertyfinder.ae/en/search?c=2&l=${q}&ob=mr` },
    { label: "Property Monitor", url: `https://www.propertymonitor.com/community/${community.slug}` },
    { label: "DXB Interact", url: `https://www.dxbinteract.com/community/${community.slug}` },
  ];

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Link href="/market" className="mb-2 inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <ArrowLeft size={12} /> Back to Market
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-[var(--text-gold)]">{community.name}</h1>
            <Badge variant={tierVariant(community.tier)}>{tierLabel(community.tier)}</Badge>
          </div>
          <p className="mt-1 flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <MapPin size={13} /> {community.emirate}
            {community.developer && <> · <Building2 size={13} /> {community.developer}</>}
            {community.handover && <> · <Calendar size={13} /> Handover {community.handover}</>}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-[var(--text-muted)]">Avg Price/sqft</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-[var(--text-gold)]">AED {community.avgPricePerSqft.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-[var(--text-muted)]">Avg Rental Yield</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-[var(--blue)]">{community.avgYield.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-[var(--text-muted)]">Price Band</p>
            <p className="mt-1 font-mono text-sm font-semibold text-[var(--text-primary)]">
              {fmt(community.minPrice)}<br/><span className="text-[var(--text-muted)]">to</span> {fmt(community.maxPrice)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-[var(--text-muted)]">Last Refresh</p>
            <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
              {new Date(community.lastRefreshedAt).toLocaleString("en-AE", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* About */}
      <Card>
        <CardHeader><CardTitle>About {community.name}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {community.description && (
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{community.description}</p>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium text-[var(--text-secondary)]">Property Types</p>
              <div className="flex flex-wrap gap-1.5">
                {propertyTypes.map(t => <Badge key={t} variant="default">{t}</Badge>)}
              </div>
            </div>
            {amenities.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-[var(--text-secondary)]">Amenities</p>
                <div className="flex flex-wrap gap-1.5">
                  {amenities.map(a => <Badge key={a} variant="default">{a}</Badge>)}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent market data points */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[var(--text-gold)]" />
            <CardTitle>Recent Transactions & Market Data</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {community.dataPoints.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--text-muted)]">
              No ingested data yet. Transactions will appear here once live source APIs (DLD, Property Monitor, etc.) are connected.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[var(--border-default)]">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[var(--border-default)] bg-[var(--bg-elevated)]">
                  <th className="px-3 py-2 text-left text-xs text-[var(--text-muted)]">Date</th>
                  <th className="px-3 py-2 text-left text-xs text-[var(--text-muted)]">Source</th>
                  <th className="px-3 py-2 text-left text-xs text-[var(--text-muted)]">Type / Beds</th>
                  <th className="px-3 py-2 text-right text-xs text-[var(--text-muted)]">PSF</th>
                  <th className="px-3 py-2 text-right text-xs text-[var(--text-muted)]">Avg Price</th>
                  <th className="px-3 py-2 text-right text-xs text-[var(--text-muted)]">Yield</th>
                  <th className="px-3 py-2 text-right text-xs text-[var(--text-muted)]">Txns</th>
                </tr></thead>
                <tbody>
                  {community.dataPoints.map(dp => (
                    <tr key={dp.id} className="border-b border-[var(--border-subtle)]">
                      <td className="px-3 py-2 text-xs text-[var(--text-muted)]">{new Date(dp.capturedAt).toLocaleDateString("en-AE", { month: "short", day: "numeric" })}</td>
                      <td className="px-3 py-2 text-xs text-[var(--text-secondary)]">{sourceName(dp.source)}</td>
                      <td className="px-3 py-2 text-[var(--text-primary)]">{dp.propertyType}{dp.bedrooms ? ` · ${dp.bedrooms}BR` : ""}</td>
                      <td className="px-3 py-2 text-right font-mono text-[var(--text-gold)]">AED {dp.pricePerSqft.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right font-mono text-[var(--text-primary)]">{fmt(dp.avgPrice)}</td>
                      <td className="px-3 py-2 text-right font-mono text-[var(--blue)]">{dp.rentalYield.toFixed(1)}%</td>
                      <td className="px-3 py-2 text-right font-mono text-[var(--text-muted)]">{dp.transactions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Your Activity in this Community */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HomeIcon size={14} className="text-[var(--text-gold)]" />
              <CardTitle>Your Listings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {matchingListings.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">No listings in this community yet.</p>
            ) : (
              <ul className="space-y-2">
                {matchingListings.map(l => (
                  <li key={l.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-[var(--text-primary)]">{l.name}</span>
                    <span className="shrink-0 font-mono text-[var(--text-gold)]">{fmt(l.price)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ActivityIcon size={14} className="text-[var(--blue)]" />
              <CardTitle>Your Deals</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {matchingDeals.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">No deals in this community yet.</p>
            ) : (
              <ul className="space-y-2">
                {matchingDeals.map(d => (
                  <li key={d.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-[var(--text-primary)]">{d.name}</span>
                    <Badge variant="default">{d.stage}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ActivityIcon size={14} className="text-[var(--green)]" />
              <CardTitle>Your Contacts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {matchingContacts.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">No contacts in this community yet.</p>
            ) : (
              <ul className="space-y-2">
                {matchingContacts.map(c => (
                  <li key={c.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-[var(--text-primary)]">{c.name}</span>
                    <span className="shrink-0 text-[var(--text-muted)]">{c.stage}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* News & Research */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Newspaper size={16} className="text-[var(--text-gold)]" />
            <CardTitle>News & Research</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-[var(--text-muted)]">
            External research links for {community.name}. Connect news API keys to display live feeds inline.
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {newsLinks.map(link => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] transition-colors hover:border-[var(--border-gold)]"
              >
                <span>{link.label}</span>
                <ExternalLink size={12} className="text-[var(--text-muted)]" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
