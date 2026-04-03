"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CreateDealModal } from "./create-deal-modal";
import { toast } from "sonner";

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

function DealCardUI({ deal, currentStage, onMove }: { deal: DealCard; currentStage: string; onMove: (dealId: string, newStage: string) => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const stages = ["Lead", "Qualified", "Viewing Done", "Offer Made", "Under Offer", "Closed"];

  useEffect(() => {
    if (!showMenu) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-deep)] p-3 transition-all hover:border-[var(--border-gold)] hover:shadow-[var(--shadow-sm)]">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-[var(--text-primary)]">{deal.name}</p>
        <div className="relative" ref={menuRef}>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowMenu(!showMenu)}>
            <MoreHorizontal size={12} />
          </Button>
          {showMenu && (
            <div className="absolute right-0 top-7 z-20 w-44 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-1 shadow-[var(--shadow-lg)]">
              <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Move to</p>
              {stages.filter(s => s !== currentStage).map(stage => (
                <button
                  key={stage}
                  onClick={() => { onMove(deal.id, stage); setShowMenu(false); }}
                  className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                >
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stageColors[stage] || "var(--blue)" }} />
                  {stage}
                </button>
              ))}
            </div>
          )}
        </div>
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
  const [showCreate, setShowCreate] = useState(false);
  const [moving, setMoving] = useState(false);
  const router = useRouter();
  const totalDeals = stages.reduce((sum, s) => sum + s.deals.length, 0);

  async function moveDeal(dealId: string, newStage: string) {
    setMoving(true);
    try {
      const res = await fetch("/api/pipeline", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dealId, stage: newStage }),
      });
      if (!res.ok) throw new Error("Failed to move deal");
      toast.success(`Deal moved to ${newStage}`);
      router.refresh();
    } catch {
      toast.error("Failed to move deal");
    } finally {
      setMoving(false);
    }
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-gold)]">Pipeline</h2>
          <p className="text-sm text-[var(--text-muted)]">
            {totalDeals} deals &middot; {formatCurrency(totalValue)} total value &middot; {formatCurrency(totalCommission)} weighted commission
          </p>
        </div>
        <Button size="md" onClick={() => setShowCreate(true)}><Plus size={16} /> Add Deal</Button>
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
                stage.deals.map((deal) => <DealCardUI key={deal.id} deal={deal} currentStage={stage.name} onMove={moveDeal} />)
              )}
            </div>
          </div>
        ))}
      </div>
      {showCreate && (
        <CreateDealModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); router.refresh(); }}
        />
      )}
    </div>
  );
}
