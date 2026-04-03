"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  Clock,
  Target,
  BarChart3,
  ArrowRight,
  Calendar,
  Zap,
} from "lucide-react";
import type { DashboardKPIs } from "@/types";

interface PipelineDeal {
  id: string;
  name: string;
  value: number;
  commission: number;
  probability: number;
  community?: string | null;
  notes?: string | null;
  updatedAt: Date;
  createdAt: Date;
}

interface PipelineStage {
  name: string;
  deals: PipelineDeal[];
}

interface PipelineData {
  stages: PipelineStage[];
  totalValue: number;
  totalCommission: number;
}

interface ForecastViewProps {
  kpis: DashboardKPIs;
  pipeline: PipelineData;
}

/** Compute days in current stage from updatedAt */
function daysInStage(deal: PipelineDeal): number {
  return Math.max(0, Math.floor((Date.now() - new Date(deal.updatedAt).getTime()) / (1000 * 60 * 60 * 24)));
}

// Stage ordering and typical close timelines (days) for Dubai real estate
const STAGE_CLOSE_DAYS: Record<string, number> = {
  Lead: 90,
  Qualified: 60,
  "Viewing Done": 45,
  "Offer Made": 30,
  "Under Offer": 14,
  Closed: 0,
};

const STAGE_PROBABILITY: Record<string, number> = {
  Lead: 10,
  Qualified: 30,
  "Viewing Done": 50,
  "Offer Made": 70,
  "Under Offer": 90,
  Closed: 100,
  Lost: 0,
};

const ACTIVE_STAGES = ["Lead", "Qualified", "Viewing Done", "Offer Made", "Under Offer"];

function computeForecasts(pipeline: PipelineData) {
  const allDeals = pipeline.stages.flatMap((s) => s.deals.map((d) => ({ ...d, stage: s.name })));
  const activeDeals = allDeals.filter((d) => ACTIVE_STAGES.includes(d.stage));
  const closedDeals = allDeals.filter((d) => d.stage === "Closed");

  // Revenue projections for 30/60/90 days
  const projections = [30, 60, 90].map((days) => {
    const eligible = activeDeals.filter((d) => {
      const estimatedDaysToClose = (STAGE_CLOSE_DAYS[d.stage] ?? 60) - daysInStage(d);
      return estimatedDaysToClose <= days;
    });
    const weightedValue = eligible.reduce(
      (sum, d) => sum + d.value * ((STAGE_PROBABILITY[d.stage] ?? 30) / 100),
      0,
    );
    const weightedCommission = eligible.reduce(
      (sum, d) => sum + d.value * d.commission * ((STAGE_PROBABILITY[d.stage] ?? 30) / 100),
      0,
    );
    return { days, dealCount: eligible.length, weightedValue, weightedCommission };
  });

  // Pipeline velocity
  const avgDaysToClose =
    closedDeals.length > 0
      ? Math.round(closedDeals.reduce((sum, d) => sum + daysInStage(d), 0) / closedDeals.length)
      : 0;
  const winRate =
    allDeals.length > 0
      ? Math.round((closedDeals.length / allDeals.length) * 100 * 10) / 10
      : 0;
  const avgDealSize =
    activeDeals.length > 0
      ? activeDeals.reduce((sum, d) => sum + d.value, 0) / activeDeals.length
      : 0;

  // Monthly projection (next 6 months)
  const monthlyProjections = Array.from({ length: 6 }, (_, i) => {
    const monthStart = i * 30;
    const monthEnd = (i + 1) * 30;
    const monthDeals = activeDeals.filter((d) => {
      const estDays = (STAGE_CLOSE_DAYS[d.stage] ?? 60) - daysInStage(d);
      return estDays > monthStart && estDays <= monthEnd;
    });
    const revenue = monthDeals.reduce(
      (sum, d) => sum + d.value * d.commission * ((STAGE_PROBABILITY[d.stage] ?? 30) / 100),
      0,
    );
    const now = new Date();
    const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const label = monthDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    return { label, revenue, dealCount: monthDeals.length };
  });

  // Stage conversion table
  const orderedStages = ["Lead", "Qualified", "Viewing Done", "Offer Made", "Under Offer", "Closed"];
  const stageConversions = orderedStages.slice(0, -1).map((from, i) => {
    const to = orderedStages[i + 1];
    const fromCount = pipeline.stages.find((s) => s.name === from)?.deals.length ?? 0;
    const toCount = pipeline.stages.find((s) => s.name === to)?.deals.length ?? 0;
    // Conversion is cumulative: deals that reached the next stage or beyond
    const reachedNext = orderedStages
      .slice(i + 1)
      .reduce((sum, s) => sum + (pipeline.stages.find((st) => st.name === s)?.deals.length ?? 0), 0);
    const totalFromAndBeyond = fromCount + reachedNext;
    const rate = totalFromAndBeyond > 0 ? Math.round((reachedNext / totalFromAndBeyond) * 100) : 0;
    return { from, to, fromCount: totalFromAndBeyond, toCount: reachedNext, rate };
  });

  return { projections, avgDaysToClose, winRate, avgDealSize, monthlyProjections, stageConversions };
}

export function ForecastView({ kpis, pipeline }: ForecastViewProps) {
  const forecast = computeForecasts(pipeline);
  const maxMonthlyRevenue = Math.max(...forecast.monthlyProjections.map((m) => m.revenue), 1);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-gold)]">Revenue Forecast</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Pipeline projections and deal velocity analytics
        </p>
      </div>

      {/* Revenue Forecast Cards */}
      <div className="grid grid-cols-3 gap-4">
        {forecast.projections.map((p) => (
          <Card key={p.days}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={14} className="text-[var(--text-muted)]" />
                {p.days}-Day Projection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                  {formatCurrency(p.weightedCommission)}
                </p>
                <p className="text-xs text-[var(--text-muted)]">weighted commission</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    {formatCurrency(p.weightedValue)}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">deal value</p>
                </div>
                <Badge variant={p.days <= 30 ? "green" : p.days <= 60 ? "amber" : "blue"}>
                  {p.dealCount} {p.dealCount === 1 ? "deal" : "deals"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Velocity */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={14} className="text-[var(--text-muted)]" />
              Avg Days to Close
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              {forecast.avgDaysToClose}
              <span className="ml-1 text-sm font-normal text-[var(--text-muted)]">days</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target size={14} className="text-[var(--text-muted)]" />
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              {forecast.winRate}
              <span className="ml-1 text-sm font-normal text-[var(--text-muted)]">%</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap size={14} className="text-[var(--text-muted)]" />
              Avg Deal Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              {formatCurrency(forecast.avgDealSize)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Projection Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 size={14} className="text-[var(--text-muted)]" />
            Monthly Commission Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3" style={{ height: 200 }}>
            {forecast.monthlyProjections.map((m) => {
              const heightPct = maxMonthlyRevenue > 0 ? (m.revenue / maxMonthlyRevenue) * 100 : 0;
              return (
                <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    {m.revenue > 0 ? formatCurrency(m.revenue) : "-"}
                  </span>
                  <div className="flex w-full flex-col items-center" style={{ height: 140 }}>
                    <div className="w-full flex items-end" style={{ height: "100%" }}>
                      <div
                        className="w-full rounded-t-md transition-all duration-500"
                        style={{
                          height: `${Math.max(heightPct, 2)}%`,
                          background:
                            heightPct > 66
                              ? "var(--green)"
                              : heightPct > 33
                                ? "var(--amber)"
                                : "var(--blue)",
                          opacity: m.revenue > 0 ? 1 : 0.2,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-[var(--text-muted)]">{m.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {m.dealCount} {m.dealCount === 1 ? "deal" : "deals"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Deal Stage Conversion Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp size={14} className="text-[var(--text-muted)]" />
            Deal Stage Conversion Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-default)]">
                  <th className="pb-3 text-left font-medium text-[var(--text-secondary)]">From</th>
                  <th className="pb-3 text-center font-medium text-[var(--text-secondary)]" />
                  <th className="pb-3 text-left font-medium text-[var(--text-secondary)]">To</th>
                  <th className="pb-3 text-right font-medium text-[var(--text-secondary)]">
                    Deals In
                  </th>
                  <th className="pb-3 text-right font-medium text-[var(--text-secondary)]">
                    Deals Out
                  </th>
                  <th className="pb-3 text-right font-medium text-[var(--text-secondary)]">
                    Conversion
                  </th>
                </tr>
              </thead>
              <tbody>
                {forecast.stageConversions.map((row) => (
                  <tr
                    key={row.from}
                    className="border-b border-[var(--border-default)] last:border-0"
                  >
                    <td className="py-3 text-[var(--text-primary)]">{row.from}</td>
                    <td className="py-3 text-center">
                      <ArrowRight size={14} className="mx-auto text-[var(--text-muted)]" />
                    </td>
                    <td className="py-3 text-[var(--text-primary)]">{row.to}</td>
                    <td className="py-3 text-right text-[var(--text-secondary)]">{row.fromCount}</td>
                    <td className="py-3 text-right text-[var(--text-secondary)]">{row.toCount}</td>
                    <td className="py-3 text-right">
                      <Badge
                        variant={
                          row.rate >= 60 ? "green" : row.rate >= 30 ? "amber" : "red"
                        }
                      >
                        {row.rate}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
