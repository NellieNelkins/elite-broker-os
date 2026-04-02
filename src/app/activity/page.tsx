import { getActivities } from "@/lib/queries";
import ActivityView from "./activity-view";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const { activities, total } = await getActivities();

  return <ActivityView activities={activities} total={total} />;
}
