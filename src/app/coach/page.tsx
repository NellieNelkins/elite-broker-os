import { getCoachSession, getDashboardKPIs, getFunnelStages, getFollowUpReminders } from "@/lib/queries";
import CoachView from "./coach-view";

export const dynamic = "force-dynamic";

export default async function CoachPage() {
  const [session, kpis, funnel, reminders] = await Promise.all([
    getCoachSession(),
    getDashboardKPIs(),
    getFunnelStages(),
    getFollowUpReminders(),
  ]);

  // Build context string for AI coach
  const coachContext = [
    `Performance: ${kpis.performanceScore}/100 (${kpis.performanceTier})`,
    `Contacts: ${kpis.totalContacts} | Active Deals: ${kpis.activeDeals} | Listings: ${kpis.totalListings}`,
    `Weighted Commission: AED ${Math.round(kpis.weightedCommission).toLocaleString()}`,
    `Conversion Rate: ${kpis.conversionRate}%`,
    `Hot Deals: ${kpis.hotDeals} | Urgent Follow-ups: ${kpis.urgentFollowUps}`,
    `Avg Days on Market: ${kpis.avgDaysOnMarket}`,
    `Pipeline: ${funnel.map((s) => `${s.name}: ${s.count} deals (AED ${Math.round(s.value).toLocaleString()})`).join(", ")}`,
    `Overdue follow-ups: ${reminders.filter((r) => r.urgency === "overdue").length}`,
    `Today's habits: ${session?.score || 0} / 90 pts | Streak: ${session?.streak || 0} days`,
  ].join("\n");

  return <CoachView session={session} coachContext={coachContext} />;
}
