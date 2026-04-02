import { getCampaigns } from "@/lib/queries";
import CampaignsView from "./campaigns-view";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const { campaigns, totals } = await getCampaigns();

  return <CampaignsView campaigns={campaigns} totals={totals} />;
}
