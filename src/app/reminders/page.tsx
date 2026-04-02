import { getFollowUpReminders } from "@/lib/queries";
import RemindersView from "./reminders-view";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const reminders = await getFollowUpReminders();

  return <RemindersView reminders={reminders} />;
}
