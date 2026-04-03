"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Send, Zap, MessageSquare, Mail } from "lucide-react";

const AUDIENCES = ["All Contacts", "Buyers Only", "Sellers Only", "Investors"] as const;
const CHANNELS = ["WhatsApp", "Email", "Both"] as const;

interface DemoListing {
  id: string;
  name: string;
  community: string;
  price: string;
  beds: number;
  type: string;
}

const DEMO_LISTINGS: DemoListing[] = [
  { id: "1", name: "Marina Heights Penthouse", community: "Dubai Marina", price: "AED 8,500,000", beds: 4, type: "Penthouse" },
  { id: "2", name: "Palm Jumeirah Villa", community: "Palm Jumeirah", price: "AED 25,000,000", beds: 6, type: "Villa" },
  { id: "3", name: "Downtown Boulevard Apt", community: "Downtown Dubai", price: "AED 3,200,000", beds: 2, type: "Apartment" },
  { id: "4", name: "Creek Harbour Townhouse", community: "Dubai Creek Harbour", price: "AED 5,800,000", beds: 3, type: "Townhouse" },
];

function generateMessage(listings: DemoListing[]): string {
  if (listings.length === 0) return "Select one or more listings to generate a blast message.";
  if (listings.length === 1) {
    const l = listings[0];
    return `New listing alert!\n\n${l.name}\n${l.type} in ${l.community}\n${l.beds} Bedrooms | ${l.price}\n\nInterested? Reply to schedule a viewing.`;
  }
  const items = listings.map((l) => `- ${l.name} (${l.community}) - ${l.price}`).join("\n");
  return `Hot listings you don't want to miss!\n\n${items}\n\nReply with the listing name to schedule a private viewing.`;
}

export default function BlastPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [audience, setAudience] = useState<string>(AUDIENCES[0]);
  const [channel, setChannel] = useState<string>(CHANNELS[0]);

  const selectedListings = DEMO_LISTINGS.filter((l) => selected.includes(l.id));
  const message = generateMessage(selectedListings);

  function toggleListing(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const channelIcon = channel === "Email" ? <Mail size={14} /> : <MessageSquare size={14} />;

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-gold)]">Listings Blast</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Blast your latest listings to targeted audiences
          </p>
        </div>
        <Badge variant="amber">
          <Zap size={12} /> Blast
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Selection panel */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Select Listings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {DEMO_LISTINGS.map((listing) => (
                <label
                  key={listing.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-deep)] p-3 transition-all hover:border-[var(--border-gold)]"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(listing.id)}
                    onChange={() => toggleListing(listing.id)}
                    className="h-4 w-4 accent-[var(--gold-500)]"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{listing.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {listing.community} &middot; {listing.beds} BR &middot; {listing.price}
                    </p>
                  </div>
                  <Badge variant="default">{listing.type}</Badge>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Target &amp; Channel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  Audience
                </label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="flex h-9 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-500)]"
                >
                  {AUDIENCES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  Channel
                </label>
                <div className="flex gap-2">
                  {CHANNELS.map((c) => (
                    <Button
                      key={c}
                      variant={channel === c ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setChannel(c)}
                    >
                      {c}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview & send */}
        <div className="space-y-5">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Message Preview</CardTitle>
              {channelIcon}
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-deep)] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="violet">{audience}</Badge>
                  <Badge variant="blue">{channel}</Badge>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-[var(--text-secondary)]">
                  {message}
                </pre>
              </div>
              <div className="mt-4">
                <Button size="md" disabled={selected.length === 0}>
                  <Send size={14} /> Send Blast
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Blasts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="py-6 text-center text-sm text-[var(--text-muted)]">
                No blasts sent yet. Select listings and send your first blast.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
