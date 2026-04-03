import { getDashboardKPIs, getPipelineDeals } from "@/lib/queries";
import { ForecastView } from "./forecast-view";

export const dynamic = "force-dynamic";

export default async function ForecastPage() {
  const [kpis, pipeline] = await Promise.all([
    getDashboardKPIs(),
    getPipelineDeals(),
  ]);

  return <ForecastView kpis={kpis} pipeline={pipeline} />;
}
