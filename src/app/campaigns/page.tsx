"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone, Send, Users, BarChart3 } from "lucide-react";

const demoCampaigns = [
  { id: 1, name: "Springs Q1 2026 Buyers", type: "whatsapp", status: "in_progress", contacts: 156, sent: 89, replies: 23, created: "2026-03-15" },
  { id: 2, name: "Emirates Hills VIP Sellers", type: "whatsapp", status: "completed", contacts: 42, sent: 42, replies: 18, created: "2026-03-10" },
  { id: 3, name: "Palm Jumeirah New Listings", type: "blast", status: "draft", contacts: 320, sent: 0, replies: 0, created: "2026-03-28" },
  { id: 4, name: "March Market Report", type: "newsletter", status: "completed", contacts: 1200, sent: 1200, replies: 45, created: "2026-03-01" },
];

const statusVariant = (s: string) => s === "completed" ? "green" : s === "in_progress" ? "amber" : "default";
const typeIcon = (t: string) => t === "newsletter" ? "NL" : t === "blast" ? "BL" : "WA";

export default function CampaignsPage() {
  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-gold)]">Campaigns</h2>
          <p className="text-sm text-[var(--text-muted)]">WhatsApp campaigns, newsletters, and listing blasts</p>
        </div>
        <Button size="md"><Plus size={16} /> New Campaign</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardHeader className="flex-row items-center justify-between"><CardTitle>Total Sent</CardTitle><Send size={16} className="text-[var(--blue)]" /></CardHeader><CardContent><p className="text-2xl font-semibold text-[var(--blue)]">1,331</p></CardContent></Card>
        <Card><CardHeader className="flex-row items-center justify-between"><CardTitle>Total Replies</CardTitle><Users size={16} className="text-[var(--green)]" /></CardHeader><CardContent><p className="text-2xl font-semibold text-[var(--green)]">86</p></CardContent></Card>
        <Card><CardHeader className="flex-row items-center justify-between"><CardTitle>Reply Rate</CardTitle><BarChart3 size={16} className="text-[var(--text-gold)]" /></CardHeader><CardContent><p className="text-2xl font-semibold text-[var(--text-gold)]">6.5%</p></CardContent></Card>
      </div>

      <div className="space-y-3">
        {demoCampaigns.map((c) => (
          <Card key={c.id} className="transition-all hover:border-[var(--border-gold)]">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-elevated)] text-xs font-bold text-[var(--text-gold)]">
                  {typeIcon(c.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{c.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{c.type} &middot; Created {c.created}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-xs">
                <div className="text-center"><p className="font-mono text-sm text-[var(--text-primary)]">{c.contacts}</p><p className="text-[var(--text-muted)]">Contacts</p></div>
                <div className="text-center"><p className="font-mono text-sm text-[var(--blue)]">{c.sent}</p><p className="text-[var(--text-muted)]">Sent</p></div>
                <div className="text-center"><p className="font-mono text-sm text-[var(--green)]">{c.replies}</p><p className="text-[var(--text-muted)]">Replies</p></div>
                <Badge variant={statusVariant(c.status) as "green" | "amber" | "default"}>{c.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
