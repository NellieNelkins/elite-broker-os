import type { Metadata } from "next";
import { getFollowUpReminders } from "@/lib/queries";
import RemindersView from "./reminders-view";

export const metadata: Metadata = { title: "Reminders — Elite Broker OS" };
export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const reminders = await getFollowUpReminders();

  return <RemindersView reminders={reminders} />;
}
