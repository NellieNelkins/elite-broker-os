"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Check, Circle, FileCheck, Key, Building2,
  Handshake, Wallet, FileSignature, CalendarCheck, Plus, X, Users,
} from "lucide-react";
import { toast } from "sonner";

interface CommissionSplit { name: string; role: string; pct: number; amount: number }

interface DealDetailData {
  id: string;
  name: string;
  stage: string;
  value: number;
  commission: number;
  probability: number;
  community: string | null;
  property: string | null;
  notes: string | null;
  netCommission: number;
  commissionSplits: unknown;
  offerAcceptedAt: Date | string | null;
  mouSignedAt: Date | string | null;
  depositPaidAt: Date | string | null;
  nocReceivedAt: Date | string | null;
  trusteeBookedAt: Date | string | null;
  trusteeDate: Date | string | null;
  transferredAt: Date | string | null;
  keysHandedAt: Date | string | null;
  contact: { id: string; name: string; phone: string; email: string | null } | null;
  activities: { id: string; type: string; description: string; createdAt: Date | string }[];
  viewings: { id: string; scheduledAt: Date | string; status: string }[];
  documents: { id: string; name: string; type: string; url: string; createdAt: Date | string }[];
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", minimumFractionDigits: 0 }).format(n);
}

const MILESTONES = [
  { key: "offerAcceptedAt", label: "Offer Accepted", icon: Handshake },
  { key: "mouSignedAt", label: "MOU Signed (Form F)", icon: FileSignature },
  { key: "depositPaidAt", label: "Deposit Paid", icon: Wallet },
  { key: "nocReceivedAt", label: "Developer NOC", icon: FileCheck },
  { key: "trusteeBookedAt", label: "Trustee Booked", icon: CalendarCheck },
  { key: "transferredAt", label: "DLD Transfer", icon: Building2 },
  { key: "keysHandedAt", label: "Keys Handed Over", icon: Key },
] as const;

export function DealDetail({ deal }: { deal: DealDetailData }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const splits: CommissionSplit[] = Array.isArray(deal.commissionSplits)
    ? (deal.commissionSplits as unknown as CommissionSplit[])
    : [];
  const [localSplits, setLocalSplits] = useState<CommissionSplit[]>(splits);

  async function patchDeal(data: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/deals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deal.id, ...data }),
      });
      if (!res.ok) throw new Error("Save failed");
      router.refresh();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleMilestone(key: string, currentValue: Date | string | null) {
    const val = currentValue ? null : new Date().toISOString();
    await patchDeal({ [key]: val });
    toast.success(currentValue ? "Milestone cleared" : "Milestone completed");
  }

  const totalSplitPct = localSplits.reduce((s, sp) => s + (sp.pct || 0), 0);
  const grossCommission = deal.commission;
  const myShare = grossCommission * (1 - totalSplitPct / 100);

  function updateSplit(idx: number, field: keyof CommissionSplit, value: string | number) {
    setLocalSplits(prev => prev.map((sp, i) => {
      if (i !== idx) return sp;
      const next = { ...sp, [field]: value };
      if (field === "pct") next.amount = (grossCommission * (Number(value) || 0)) / 100;
      return next;
    }));
  }
  function addSplit() { setLocalSplits(prev => [...prev, { name: "", role: "Referral", pct: 0, amount: 0 }]); }
  function removeSplit(idx: number) { setLocalSplits(prev => prev.filter((_, i) => i !== idx)); }

  async function saveSplits() {
    await patchDeal({ commissionSplits: localSplits, netCommission: myShare });
    toast.success("Commission splits saved");
  }

  const completedMilestones = MILESTONES.filter(m => (deal as unknown as Record<string, unknown>)[m.key]).length;
  const progress = (completedMilestones / MILESTONES.length) * 100;

  return (
    <div className="animate-fade-in space-y-5">
      <Link href="/pipeline" className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">
        <ArrowLeft size={12} /> Back to Pipeline
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-[var(--text-gold)]">{deal.name}</h1>
            <Badge variant="amber">{deal.stage}</Badge>
          </div>
          {deal.contact && (
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {deal.contact.name} · {deal.contact.phone}{deal.property ? ` · ${deal.property}` : ""}{deal.community ? ` · ${deal.community}` : ""}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--text-muted)]">Deal Value</p>
          <p className="font-mono text-2xl font-semibold text-[var(--text-gold)]">{fmt(deal.value)}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Commission: {fmt(deal.commission)} · {deal.probability}% probability</p>
        </div>
      </div>

      {/* Transaction Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transaction Timeline</CardTitle>
            <span className="text-xs text-[var(--text-muted)]">{completedMilestones}/{MILESTONES.length} milestones</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]">
            <div className="h-full bg-[var(--gold-500)] transition-all" style={{ width: `${progress}%` }} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {MILESTONES.map((m, i) => {
              const Icon = m.icon;
              const completedAt = (deal as unknown as Record<string, unknown>)[m.key] as string | null;
              const isDone = !!completedAt;
              return (
                <div key={m.key} className="flex items-center gap-3 rounded-lg p-2 hover:bg-[var(--bg-elevated)]">
                  <button
                    onClick={() => toggleMilestone(m.key, completedAt)}
                    disabled={saving}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${isDone ? "border-[var(--green)] bg-[var(--green)]/20" : "border-[var(--border-default)] hover:border-[var(--gold-500)]"}`}
                  >
                    {isDone ? <Check size={14} className="text-[var(--green)]" /> : <Circle size={14} className="text-[var(--text-muted)]" />}
                  </button>
                  <div className="flex-1 flex items-center gap-2">
                    <Icon size={14} className={isDone ? "text-[var(--text-gold)]" : "text-[var(--text-muted)]"} />
                    <span className={`text-sm ${isDone ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-secondary)]"}`}>{m.label}</span>
                  </div>
                  {isDone && completedAt && (
                    <span className="text-xs text-[var(--text-muted)]">{new Date(completedAt).toLocaleDateString("en-AE", { month: "short", day: "numeric", year: "numeric" })}</span>
                  )}
                  {i < MILESTONES.length - 1 && <div className="sr-only">next</div>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Commission Splits */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Users size={16} className="text-[var(--text-gold)]" />Commission Splits</CardTitle>
            <Button size="sm" variant="secondary" onClick={addSplit}><Plus size={13} /> Add Split</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-3 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-[var(--bg-elevated)] p-3"><p className="text-xs text-[var(--text-muted)]">Gross Commission</p><p className="font-mono text-lg font-semibold text-[var(--text-primary)]">{fmt(grossCommission)}</p></div>
            <div className="rounded-lg bg-[var(--bg-elevated)] p-3"><p className="text-xs text-[var(--text-muted)]">Total Splits ({totalSplitPct}%)</p><p className="font-mono text-lg font-semibold text-[var(--amber)]">−{fmt(grossCommission * totalSplitPct / 100)}</p></div>
            <div className="rounded-lg border border-[var(--border-gold)] bg-[var(--bg-surface)] p-3"><p className="text-xs text-[var(--text-muted)]">My Net Take-Home</p><p className="font-mono text-lg font-bold text-[var(--text-gold)]">{fmt(myShare)}</p></div>
          </div>
          {localSplits.length > 0 ? (
            <div className="space-y-2">
              {localSplits.map((sp, i) => (
                <div key={i} className="grid grid-cols-12 items-center gap-2">
                  <div className="col-span-4"><Input placeholder="Name" value={sp.name} onChange={e => updateSplit(i, "name", e.target.value)} /></div>
                  <div className="col-span-3">
                    <select className="flex h-9 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)]" value={sp.role} onChange={e => updateSplit(i, "role", e.target.value)}>
                      <option>Referral</option><option>Co-Agent</option><option>Team Lead</option><option>Manager</option><option>External Broker</option>
                    </select>
                  </div>
                  <div className="col-span-2"><Input type="number" step="0.5" placeholder="%" value={sp.pct} onChange={e => updateSplit(i, "pct", Number(e.target.value))} /></div>
                  <div className="col-span-2 text-right font-mono text-sm text-[var(--text-secondary)]">{fmt(sp.amount)}</div>
                  <button onClick={() => removeSplit(i)} className="col-span-1 text-[var(--text-muted)] hover:text-[var(--red)]"><X size={14} /></button>
                </div>
              ))}
              <Button size="sm" onClick={saveSplits} disabled={saving} className="mt-2">Save Splits</Button>
            </div>
          ) : (
            <p className="text-xs text-[var(--text-muted)]">No splits configured. Click Add Split to track referrals, co-agents, or team splits.</p>
          )}
        </CardContent>
      </Card>

      {/* Activity & Viewings */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            {deal.activities.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">No activity yet.</p>
            ) : (
              <ul className="space-y-2">
                {deal.activities.map(a => (
                  <li key={a.id} className="flex items-start gap-2 text-xs">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold-500)]" />
                    <div className="flex-1">
                      <p className="text-[var(--text-primary)]">{a.description}</p>
                      <p className="text-[var(--text-muted)]">{new Date(a.createdAt).toLocaleString("en-AE", { dateStyle: "medium", timeStyle: "short" })}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Viewings</CardTitle></CardHeader>
          <CardContent>
            {deal.viewings.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">No viewings linked. <Link href="/viewings" className="text-[var(--text-gold)] hover:underline">Schedule one →</Link></p>
            ) : (
              <ul className="space-y-2">
                {deal.viewings.map(v => (
                  <li key={v.id} className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-primary)]">{new Date(v.scheduledAt).toLocaleString("en-AE", { dateStyle: "medium", timeStyle: "short" })}</span>
                    <Badge variant="default">{v.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
