"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Send, Users, BarChart3, Settings2, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import CreateCampaignModal from "./create-campaign-modal";
import { ManageCampaignModal } from "./manage-campaign-modal";

interface CampaignData {
  id: string;
  name: string;
  type: string;
  status: string;
  contactCount: number;
  sentCount: number;
  replyCount: number;
  createdAt: string;
}

interface CampaignTotals {
  sent: number;
  replies: number;
  rate: number;
}

const statusVariant = (s: string) =>
  s === "completed" ? "green" : s === "in_progress" ? "amber" : "default";
const typeIcon = (t: string) =>
  t === "newsletter" ? "NL" : t === "blast" ? "BL" : t === "email" ? "EM" : "WA";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CampaignsView({
  campaigns,
  totals,
}: {
  campaigns: CampaignData[];
  totals: CampaignTotals;
}) {
  const [showModal, setShowModal] = useState(false);
  const [managing, setManaging] = useState<CampaignData | null>(null);
  const router = useRouter();

  async function quickAction(id: string, action: string, label: string) {
    const res = await fetch("/api/campaigns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    if (res.ok) {
      toast.success(`Campaign ${label}`);
      router.refresh();
    } else {
      toast.error("Action failed");
    }
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-gold)]">Campaigns</h2>
          <p className="text-sm text-[var(--text-muted)]">
            WhatsApp campaigns, newsletters, and listing blasts
          </p>
        </div>
        <Button size="md" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Total Sent</CardTitle>
            <Send size={16} className="text-[var(--blue)]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-[var(--blue)]">
              {totals.sent.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Total Replies</CardTitle>
            <Users size={16} className="text-[var(--green)]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-[var(--green)]">
              {totals.replies.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Reply Rate</CardTitle>
            <BarChart3 size={16} className="text-[var(--text-gold)]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-[var(--text-gold)]">
              {totals.rate}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {campaigns.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-[var(--text-muted)]">
              No campaigns yet. Create your first campaign to get started.
            </CardContent>
          </Card>
        )}
        {campaigns.map((c) => (
          <Card key={c.id} className="transition-all hover:border-[var(--border-gold)]">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-elevated)] text-xs font-bold text-[var(--text-gold)]">
                  {typeIcon(c.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {c.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {c.type} &middot; Created {formatDate(c.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-xs">
                <div className="text-center">
                  <p className="font-mono text-sm text-[var(--text-primary)]">
                    {c.contactCount}
                  </p>
                  <p className="text-[var(--text-muted)]">Contacts</p>
                </div>
                <div className="text-center">
                  <p className="font-mono text-sm text-[var(--blue)]">{c.sentCount}</p>
                  <p className="text-[var(--text-muted)]">Sent</p>
                </div>
                <div className="text-center">
                  <p className="font-mono text-sm text-[var(--green)]">{c.replyCount}</p>
                  <p className="text-[var(--text-muted)]">Replies</p>
                </div>
                <Badge
                  variant={
                    statusVariant(c.status) as "green" | "amber" | "default"
                  }
                >
                  {c.status.replace("_", " ")}
                </Badge>
                <div className="flex items-center gap-1">
                  {c.status === "draft" && (
                    <button
                      onClick={() => quickAction(c.id, "launch", "launched")}
                      className="rounded p-1.5 text-[var(--green)] hover:bg-[var(--bg-elevated)]"
                      title="Launch"
                    ><Play size={14} /></button>
                  )}
                  {c.status === "in_progress" && (
                    <button
                      onClick={() => quickAction(c.id, "pause", "paused")}
                      className="rounded p-1.5 text-[var(--amber)] hover:bg-[var(--bg-elevated)]"
                      title="Pause"
                    ><Pause size={14} /></button>
                  )}
                  {c.status === "paused" && (
                    <button
                      onClick={() => quickAction(c.id, "resume", "resumed")}
                      className="rounded p-1.5 text-[var(--green)] hover:bg-[var(--bg-elevated)]"
                      title="Resume"
                    ><Play size={14} /></button>
                  )}
                  <button
                    onClick={() => setManaging(c)}
                    className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                    title="Manage"
                  ><Settings2 size={14} /></button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {managing && (
        <ManageCampaignModal
          campaign={managing}
          onClose={() => setManaging(null)}
          onChanged={() => { setManaging(null); router.refresh(); }}
        />
      )}

      {showModal && (
        <CreateCampaignModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
