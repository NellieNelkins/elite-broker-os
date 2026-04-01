"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Eye, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const demoListings = [
  { id: "l1", name: "5BR Villa - The Springs 1", type: "Villa", price: 3200000, community: "The Springs", bedrooms: "5", views: 142, status: "Active", days: 12, steps: { docs: true, photos: true, price: true, portal: true, live: true } },
  { id: "l2", name: "3BR Townhouse - The Meadows 4", type: "Townhouse", price: 2800000, community: "The Meadows", bedrooms: "3", views: 89, status: "Active", days: 28, steps: { docs: true, photos: true, price: true, portal: false, live: false } },
  { id: "l3", name: "2BR Apt - Palm Jumeirah", type: "Apartment", price: 4500000, community: "Palm Jumeirah", bedrooms: "2", views: 234, status: "Under Offer", days: 45, steps: { docs: true, photos: true, price: true, portal: true, live: true } },
  { id: "l4", name: "4BR Villa - Arabian Ranches", type: "Villa", price: 5100000, community: "Arabian Ranches", bedrooms: "4", views: 67, status: "Active", days: 5, steps: { docs: true, photos: false, price: true, portal: false, live: false } },
  { id: "l5", name: "6BR Villa - Emirates Hills", type: "Villa", price: 18500000, community: "Emirates Hills", bedrooms: "6", views: 312, status: "Active", days: 62, steps: { docs: true, photos: true, price: true, portal: true, live: true } },
  { id: "l6", name: "Penthouse - Dubai Marina", type: "Penthouse", price: 12000000, community: "Dubai Marina", bedrooms: "4", views: 198, status: "Sold", days: 0, steps: { docs: true, photos: true, price: true, portal: true, live: true } },
];

const statusVariant = (s: string) => s === "Active" ? "green" : s === "Under Offer" ? "amber" : s === "Sold" ? "violet" : "default";

export default function ListingsPage() {
  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-gold)]">Listings</h2>
          <p className="text-sm text-[var(--text-muted)]">{demoListings.length} active properties</p>
        </div>
        <Button size="md"><Plus size={16} /> Add Listing</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {demoListings.map((listing) => (
          <Card key={listing.id} className="transition-all hover:border-[var(--border-gold)] hover:shadow-[var(--shadow-gold)]">
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">{listing.name}</h3>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">{listing.community}</p>
              </div>
              <Badge variant={statusVariant(listing.status) as "green" | "amber" | "violet" | "default"}>{listing.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg font-semibold text-[var(--text-gold)]">{formatCurrency(listing.price)}</span>
                <span className="text-xs text-[var(--text-secondary)]">{listing.type} &middot; {listing.bedrooms}BR</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1"><Eye size={12} /> {listing.views} views</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {listing.days}d on market</span>
              </div>
              {/* Checklist progress */}
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
    </div>
  );
}
