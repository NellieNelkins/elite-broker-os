"use client";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { PerformanceRing } from "@/components/dashboard/performance-ring";
import {
  Users,
  TrendingUp,
  DollarSign,
  Target,
  Flame,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { DashboardKPIs, FunnelStage } from "@/types";

interface DashboardViewProps {
  kpis: DashboardKPIs;
  funnelStages: FunnelStage[];
}

export function DashboardView({ kpis, funnelStages }: DashboardViewProps) {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-gold)]">Dashboard</h2>
        <p className="text-sm text-[var(--text-muted)]">Your real estate command center</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          title="Total Contacts"
          value={kpis.totalContacts.toLocaleString()}
          subtitle="in CRM"
          icon={Users}
          accent="blue"
        />
        <KpiCard
          title="Active Deals"
          value={kpis.activeDeals}
          subtitle="in pipeline"
          icon={TrendingUp}
          accent="violet"
        />
        <KpiCard
          title="Weighted Commission"
          value={formatCurrency(kpis.weightedCommission)}
          subtitle="projected"
          icon={DollarSign}
          accent="gold"
        />
        <KpiCard
          title="Conversion Rate"
          value={`${kpis.conversionRate}%`}
          subtitle="lead to close"
          icon={Target}
          accent="green"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <PerformanceRing score={kpis.performanceScore} tier={kpis.performanceTier} />
        <FunnelChart stages={funnelStages} />
        <div className="space-y-4">
          <KpiCard
            title="Hot Deals"
            value={kpis.hotDeals}
            subtitle="offer made / under offer"
            icon={Flame}
            accent="amber"
          />
          <KpiCard
            title="Urgent Follow-ups"
            value={kpis.urgentFollowUps}
            subtitle="14+ days no contact"
            icon={AlertTriangle}
            accent="red"
          />
          <KpiCard
            title="Active Listings"
            value={kpis.totalListings}
            subtitle={`avg ${kpis.avgDaysOnMarket}d on market`}
            icon={Building2}
            accent="blue"
          />
        </div>
      </div>
    </div>
  );
}
