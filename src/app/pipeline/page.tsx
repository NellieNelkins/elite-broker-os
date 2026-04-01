import { getPipelineDeals } from "@/lib/queries";
import { PipelineView } from "./pipeline-view";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const { stages, totalValue, totalCommission } = await getPipelineDeals();

  // Serialize for client component
  const serializedStages = stages.map((s) => ({
    name: s.name,
    deals: s.deals.map((d) => ({
      id: d.id,
      name: d.name,
      value: d.value,
      commission: d.commission,
      probability: d.probability,
      community: d.contact?.community || d.community || "",
      notes: d.notes || "",
      daysInStage: Math.floor((Date.now() - d.updatedAt.getTime()) / (1000 * 60 * 60 * 24)),
    })),
  }));

  return (
    <PipelineView
      stages={serializedStages}
      totalValue={totalValue}
      totalCommission={totalCommission}
    />
  );
}
