"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DealCard {
  id: string;
  name: string;
  value: number;
  commission: number;
  probability: number;
  community: string;
  notes: string;
  daysInStage: number;
}

interface StageColumn {
  name: string;
  deals: DealCard[];
}

const stageColors: Record<string, string> = {
  Lead: "var(--blue)",
  Qualified: "var(--violet)",
  "Viewing Done": "var(--amber)",
  "Offer Made": "var(--amber)",
  "Under Offer": "var(--green)",
  Closed: "var(--green)",
};

function DealCardUI({ deal }: { deal: DealCard }) {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-deep)] p-3 transition-all hover:border-[var(--border-gold)] hover:shadow-[var(--shadow-sm)]">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-[var(--text-primary)]">{deal.name}</p>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><MoreHorizontal size={12} /></Button>
      </div>
      <p className="mt-0.5 text-xs text-[var(--text-muted)]">{deal.community || "—"}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-mono text-sm font-semibold text-[var(--text-gold)]">
          {formatCurrency(deal.value)}
        </span>
        <Badge variant={deal.daysInStage > 7 ? "red" : "default"}>{deal.daysInStage}d</Badge>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <DollarSign size={10} className="text-[var(--text-muted)]" />
        <span className="text-xs text-[var(--text-secondary)]">
          {(deal.commission * 100).toFixed(0)}% comm
        </span>
        <span className="ml-auto text-xs text-[var(--text-muted)]">{deal.probability}%</span>
      </div>
    </div>
  );
}

interface PipelineViewProps {
  stages: StageColumn[];
  totalValue: number;
  totalCommission: number;
}

export function PipelineView({ stages, totalValue, totalCommission }: PipelineViewProps) {
  const totalDeals = stages.reduce((sum, s) => sum + s.deals.length, 0);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-gold)]">Pipeline</h2>
          <p className="text-sm text-[var(--text-muted)]">
            {totalDeals} deals &middot; {formatCurrency(totalValue)} total value &middot; {formatCurrency(totalCommission)} weighted commission
          </p>
        </div>
        <Button size="md"><Plus size={16} /> Add Deal</Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div
            key={stage.name}
            className="flex w-72 min-w-[288px] flex-col rounded-[var(--radius-lg)] bg-[var(--bg-surface)] border border-[var(--border-default)]"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stageColors[stage.name] || "var(--blue)" }} />
                <h3 className="text-sm font-medium text-[var(--text-primary)]">{stage.name}</h3>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-[10px] font-medium text-[var(--text-muted)]">
                  {stage.deals.length}
                </span>
              </div>
              <span className="font-mono text-xs text-[var(--text-muted)]">
                {formatCurrency(stage.deals.reduce((sum, d) => sum + d.value, 0))}
              </span>
            </div>

            <div className="flex-1 space-y-2 p-3">
              {stage.deals.length === 0 ? (
                <p className="py-4 text-center text-xs text-[var(--text-muted)]">No deals</p>
              ) : (
                stage.deals.map((deal) => <DealCardUI key={deal.id} deal={deal} />)
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
