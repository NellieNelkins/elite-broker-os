import { prisma } from "@/lib/db";
import { ViewingsView } from "./viewings-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Viewings — Elite Broker OS" };
export const dynamic = "force-dynamic";

export default async function ViewingsPage() {
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) return <div className="p-8 text-sm text-[var(--text-muted)]">No user found.</div>;

  const [viewings, contacts, listings] = await Promise.all([
    prisma.viewing.findMany({
      where: { userId: user.id },
      orderBy: { scheduledAt: "desc" },
      take: 100,
    }),
    prisma.contact.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, phone: true },
      orderBy: { updatedAt: "desc" },
      take: 200,
    }),
    prisma.listing.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, community: true, price: true },
      orderBy: { updatedAt: "desc" },
      take: 200,
    }),
  ]);

  return <ViewingsView viewings={viewings} contacts={contacts} listings={listings} />;
}
