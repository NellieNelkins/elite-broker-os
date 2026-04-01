"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PipelineDeal {
  id: string;
  name: string;
  value: number;
  commission: number;
  community: string;
  daysInStage: number;
  probability: number;
  nextAction?: string;
}

const stages = [
  { name: "Lead", color: "var(--blue)", deals: [
    { id: "d1", name: "Mohammed Al Mansouri", value: 2500000, commission: 50000, community: "The Springs", daysInStage: 3, probability: 10 },
    { id: "d2", name: "Sarah Chen", value: 4200000, commission: 84000, community: "Emirates Hills", daysInStage: 1, probability: 10 },
    { id: "d3", name: "James Wright", value: 1800000, commission: 36000, community: "The Meadows", daysInStage: 7, probability: 10 },
  ]},
  { name: "Qualified", color: "var(--violet)", deals: [
    { id: "d4", name: "Elena Petrova", value: 8500000, commission: 170000, community: "Palm Jumeirah", daysInStage: 5, probability: 30 },
    { id: "d5", name: "Ahmed Al Hashmi", value: 3100000, commission: 62000, community: "Arabian Ranches", daysInStage: 2, probability: 30 },
  ]},
  { name: "Viewing Done", color: "var(--amber)", deals: [
    { id: "d6", name: "Priya Sharma", value: 5600000, commission: 112000, community: "Emirates Hills", daysInStage: 4, probability: 50 },
    { id: "d7", name: "Rashid Al Maktoum", value: 12000000, commission: 240000, community: "Palm Jumeirah", daysInStage: 8, probability: 50 },
  ]},
  { name: "Offer Made", color: "var(--amber)", deals: [
    { id: "d8", name: "Carlos Rodriguez", value: 3800000, commission: 76000, community: "The Springs", daysInStage: 3, probability: 70 },
  ]},
  { name: "Under Offer", color: "var(--green)", deals: [
    { id: "d9", name: "Fatima Al Zaabi", value: 6200000, commission: 124000, community: "Arabian Ranches", daysInStage: 6, probability: 90 },
    { id: "d10", name: "Nadia Abbas", value: 2900000, commission: 58000, community: "The Meadows", daysInStage: 2, probability: 90 },
  ]},
  { name: "Closed", color: "var(--green)", deals: [
    { id: "d11", name: "Liu Wei", value: 4500000, commission: 90000, community: "Emirates Hills", daysInStage: 0, probability: 100 },
  ]},
];

function DealCard({ deal }: { deal: PipelineDeal }) {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-deep)] p-3 transition-all hover:border-[var(--border-gold)] hover:shadow-[var(--shadow-sm)]">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-[var(--text-primary)]">{deal.name}</p>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <MoreHorizontal size={12} />
        </Button>
      </div>
      <p className="mt-0.5 text-xs text-[var(--text-muted)]">{deal.community}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-mono text-sm font-semibold text-[var(--text-gold)]">
          {formatCurrency(deal.value)}
        </span>
        <Badge variant={deal.daysInStage > 7 ? "red" : "default"}>
          {deal.daysInStage}d
        </Badge>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <DollarSign size={10} className="text-[var(--text-muted)]" />
        <span className="text-xs text-[var(--text-secondary)]">
          {formatCurrency(deal.commission)} comm
        </span>
        <span className="ml-auto text-xs text-[var(--text-muted)]">{deal.probability}%</span>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const totalValue = stages.flatMap((s) => s.deals).reduce((sum, d) => sum + d.value, 0);
  const totalCommission = stages.flatMap((s) => s.deals).reduce((sum, d) => sum + d.commission, 0);

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-gold)]">Pipeline</h2>
          <p className="text-sm text-[var(--text-muted)]">
            {formatCurrency(totalValue)} total value &middot; {formatCurrency(totalCommission)} weighted commission
          </p>
        </div>
        <Button size="md">
          <Plus size={16} />
          Add Deal
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div
            key={stage.name}
            className="flex w-72 min-w-[288px] flex-col rounded-[var(--radius-lg)] bg-[var(--bg-surface)] border border-[var(--border-default)]"
          >
            {/* Stage header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: stage.color }}
                />
                <h3 className="text-sm font-medium text-[var(--text-primary)]">{stage.name}</h3>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-[10px] font-medium text-[var(--text-muted)]">
                  {stage.deals.length}
                </span>
              </div>
              <span className="font-mono text-xs text-[var(--text-muted)]">
                {formatCurrency(stage.deals.reduce((sum, d) => sum + d.value, 0))}
              </span>
            </div>

            {/* Deal cards */}
            <div className="flex-1 space-y-2 p-3">
              {stage.deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
