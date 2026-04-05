import { prisma } from "@/lib/db";
import { FormsBuilder } from "./forms-builder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "RERA Forms — Elite Broker OS" };
export const dynamic = "force-dynamic";

export default async function FormsPage() {
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) return <div className="p-8 text-sm text-[var(--text-muted)]">No user found.</div>;

  const [contacts, listings] = await Promise.all([
    prisma.contact.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, phone: true, email: true, nationality: true, type: true, community: true, value: true },
      orderBy: { updatedAt: "desc" },
      take: 200,
    }),
    prisma.listing.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, type: true, community: true, bedrooms: true, price: true, address: true },
      orderBy: { updatedAt: "desc" },
      take: 200,
    }),
  ]);

  return <FormsBuilder contacts={contacts} listings={listings} userName={user.name || ""} userEmail={user.email} />;
}
