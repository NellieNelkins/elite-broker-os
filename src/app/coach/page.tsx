import { getCoachSession } from "@/lib/queries";
import CoachView from "./coach-view";

export const dynamic = "force-dynamic";

export default async function CoachPage() {
  const session = await getCoachSession();

  return <CoachView session={session} />;
}
