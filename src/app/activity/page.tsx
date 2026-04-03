import type { Metadata } from "next";
import { getActivities } from "@/lib/queries";
import ActivityView from "./activity-view";

export const metadata: Metadata = { title: "Activity — Elite Broker OS" };
export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const { activities, total } = await getActivities();

  return <ActivityView activities={activities} total={total} />;
}
