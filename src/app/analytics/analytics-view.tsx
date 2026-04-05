"use client";

import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Users, Clock, Wallet } from "lucide-react";

interface FunnelRow {
  stage: string;
  count: number;
  pctOfTop: number;
  conversionFromPrev: number;
}
interface SourceRow {
  name: string;
  leads: number;
  closed: number;
  value: number;
  commission: number;
  conversion: number;
}
interface PeriodRow {
  period: "mtd" | "qtd" | "ytd";
  deals: number;
  gross: number;
  net: number;
  gmv: number;
}

interface Props {
  funnel: FunnelRow[];
  sources: SourceRow[];
  periods: PeriodRow[];
  avgDaysToClose: number;
  closedCount: number;
}

const PERIOD_LABEL: Record<PeriodRow["period"], string> = {
  mtd: "Month to Date",
  qtd: "Quarter to Date",
  ytd: "Year to Date",
};

export function AnalyticsView({
  funnel,
  sources,
  periods,
  avgDaysToClose,
  closedCount,
}: Props) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Analytics</h1>
        <p className="text-xs text-[var(--text-muted)]">
          Funnel conversion, source ROI, commission run-rate.
        </p>
      </header>

      {/* Commission cards */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {periods.map((p) => (
          <div
            key={p.period}
            className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4"
          >
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              <Wallet size={12} /> {PERIOD_LABEL[p.period]}
            </div>
            <div className="mt-2 text-lg font-semibold text-[var(--text-gold)]">
              {formatCurrency(p.net)}
            </div>
            <div className="mt-1 text-[11px] text-[var(--text-muted)]">
              {p.deals} deals · GMV {formatCurrency(p.gmv)}
            </div>
            {p.gross !== p.net && (
              <div className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                Gross {formatCurrency(p.gross)}
              </div>
            )}
          </div>
        ))}
        <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            <Clock size={12} /> Avg Days to Close
          </div>
          <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
            {avgDaysToClose > 0 ? `${avgDaysToClose}d` : "—"}
          </div>
          <div className="mt-1 text-[11px] text-[var(--text-muted)]">
            {closedCount} closed deals
          </div>
        </div>
      </section>

      {/* Funnel */}
      <section className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <TrendingUp size={14} /> Conversion Funnel
        </div>
        <div className="space-y-2">
          {funnel.map((row, i) => (
            <div key={row.stage} className="flex items-center gap-3">
              <div className="w-32 text-xs text-[var(--text-secondary)]">{row.stage}</div>
              <div className="flex-1">
                <div className="h-6 rounded bg-[var(--bg-elevated)]">
                  <div
                    className="h-6 rounded bg-gradient-to-r from-[var(--gold-700)] to-[var(--gold-500)]"
                    style={{ width: `${Math.max(row.pctOfTop, 2)}%` }}
                  />
                </div>
              </div>
              <div className="w-14 text-right text-xs font-mono text-[var(--text-primary)]">
                {row.count}
              </div>
              <div className="w-16 text-right text-[11px] text-[var(--text-muted)]">
                {i === 0 ? "—" : `${row.conversionFromPrev}%`}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-[var(--text-muted)]">
          Right column shows stage-over-stage conversion from prior stage.
        </p>
      </section>

      {/* Source ROI */}
      <section className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <Users size={14} /> Lead Source ROI
        </div>
        {sources.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)]">No source data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-default)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="py-2 pr-4">Source</th>
                  <th className="py-2 pr-4 text-right">Leads</th>
                  <th className="py-2 pr-4 text-right">Closed</th>
                  <th className="py-2 pr-4 text-right">Conv%</th>
                  <th className="py-2 pr-4 text-right">GMV</th>
                  <th className="py-2 pr-4 text-right">Commission</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((s) => (
                  <tr key={s.name} className="border-b border-[var(--border-default)]/50">
                    <td className="py-2 pr-4 text-[var(--text-primary)]">{s.name}</td>
                    <td className="py-2 pr-4 text-right font-mono">{s.leads}</td>
                    <td className="py-2 pr-4 text-right font-mono">{s.closed}</td>
                    <td className="py-2 pr-4 text-right font-mono text-[var(--text-gold)]">
                      {s.conversion}%
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-[var(--text-muted)]">
                      {formatCurrency(s.value)}
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-[var(--text-gold)]">
                      {formatCurrency(s.commission)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
