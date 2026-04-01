"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ListingRow {
  id: string;
  name: string;
  type: string;
  price: number;
  community: string;
  bedrooms: string;
  views: number;
  status: string;
  days: number;
  steps: { docs: boolean; photos: boolean; price: boolean; portal: boolean; live: boolean };
}

const statusVariant = (s: string) =>
  s === "Active" ? "green" as const : s === "Under Offer" ? "amber" as const : s === "Sold" ? "violet" as const : "default" as const;

interface ListingsViewProps {
  listings: ListingRow[];
}

export function ListingsView({ listings }: ListingsViewProps) {
  const activeCount = listings.filter((l) => l.status === "Active").length;

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-gold)]">Listings</h2>
          <p className="text-sm text-[var(--text-muted)]">{activeCount} active properties</p>
        </div>
        <Button size="md"><Plus size={16} /> Add Listing</Button>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-[var(--text-muted)]">
            No listings yet. Run <code className="rounded bg-[var(--bg-elevated)] px-1.5 py-0.5 text-xs">pnpm db:seed</code> to load data, or click Add Listing.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Card key={listing.id} className="transition-all hover:border-[var(--border-gold)] hover:shadow-[var(--shadow-gold)]">
              <CardHeader className="flex-row items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">{listing.name}</h3>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">{listing.community || "—"}</p>
                </div>
                <Badge variant={statusVariant(listing.status)}>{listing.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-semibold text-[var(--text-gold)]">{formatCurrency(listing.price)}</span>
                  <span className="text-xs text-[var(--text-secondary)]">{listing.type} {listing.bedrooms ? `· ${listing.bedrooms}BR` : ""}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1"><Eye size={12} /> {listing.views} views</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {listing.days}d on market</span>
                </div>
                <div className="flex gap-1">
                  {Object.entries(listing.steps).map(([step, done]) => (
                    <div key={step} className={`h-1.5 flex-1 rounded-full ${done ? "bg-[var(--green)]" : "bg-[var(--bg-elevated)]"}`} />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                  <span>Docs</span><span>Photos</span><span>Price</span><span>Portal</span><span>Live</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
