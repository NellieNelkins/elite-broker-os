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
  Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { FunnelStage, PerformanceTier } from "@/types";

// Demo data — will be replaced with real API calls
const kpis = {
  totalContacts: 1247,
  activeDeals: 34,
  weightedCommission: 485000,
  conversionRate: 18.5,
  hotDeals: 6,
  urgentFollowUps: 12,
  totalListings: 28,
  avgDaysOnMarket: 42,
  performanceScore: 78,
  performanceTier: "Top 10%" as PerformanceTier,
};

const funnelStages: FunnelStage[] = [
  { name: "Lead", count: 156, value: 45000000, percentage: 100 },
  { name: "Qualified", count: 89, value: 28000000, percentage: 57 },
  { name: "Viewing Done", count: 42, value: 15000000, percentage: 27 },
  { name: "Offer Made", count: 18, value: 8500000, percentage: 12 },
  { name: "Under Offer", count: 8, value: 4200000, percentage: 5 },
  { name: "Closed", count: 4, value: 2100000, percentage: 3 },
];

export default function DashboardPage() {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-gold)]">Dashboard</h2>
        <p className="text-sm text-[var(--text-muted)]">Your real estate command center</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          title="Total Contacts"
          value={kpis.totalContacts.toLocaleString()}
          subtitle="this month"
          icon={Users}
          trend={{ value: 12, label: "vs last month" }}
          accent="blue"
        />
        <KpiCard
          title="Active Deals"
          value={kpis.activeDeals}
          subtitle="in pipeline"
          icon={TrendingUp}
          trend={{ value: 8, label: "vs last month" }}
          accent="violet"
        />
        <KpiCard
          title="Weighted Commission"
          value={formatCurrency(kpis.weightedCommission)}
          subtitle="projected"
          icon={DollarSign}
          trend={{ value: 15, label: "vs last month" }}
          accent="gold"
        />
        <KpiCard
          title="Conversion Rate"
          value={`${kpis.conversionRate}%`}
          subtitle="lead to close"
          icon={Target}
          trend={{ value: 2.3, label: "vs last month" }}
          accent="green"
        />
      </div>

      {/* Second row: Performance + Funnel + Alerts */}
      <div className="grid grid-cols-3 gap-4">
        <PerformanceRing score={kpis.performanceScore} tier={kpis.performanceTier} />

        <FunnelChart stages={funnelStages} />

        {/* Quick stats */}
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
