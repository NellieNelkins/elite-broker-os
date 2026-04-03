import type { Metadata } from "next";
import { getDashboardKPIs, getFunnelStages } from "@/lib/queries";
import { DashboardView } from "./dashboard-view";

export const metadata: Metadata = { title: "Dashboard — Elite Broker OS" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [kpis, funnelStages] = await Promise.all([
    getDashboardKPIs(),
    getFunnelStages(),
  ]);

  return <DashboardView kpis={kpis} funnelStages={funnelStages} />;
}
