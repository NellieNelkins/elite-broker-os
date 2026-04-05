import { prisma } from "@/lib/db";
import { DocumentsView } from "./documents-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Documents — Elite Broker OS" };
export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) return <div className="p-8 text-sm text-[var(--text-muted)]">No user found.</div>;

  const [docs, contacts, deals, listings] = await Promise.all([
    prisma.document.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.contact.findMany({ where: { userId: user.id }, select: { id: true, name: true }, orderBy: { updatedAt: "desc" }, take: 200 }),
    prisma.deal.findMany({ where: { userId: user.id }, select: { id: true, name: true }, orderBy: { updatedAt: "desc" }, take: 200 }),
    prisma.listing.findMany({ where: { userId: user.id }, select: { id: true, name: true }, orderBy: { updatedAt: "desc" }, take: 200 }),
  ]);

  const hasBlobConfig = !!process.env.BLOB_READ_WRITE_TOKEN;

  return <DocumentsView docs={docs} contacts={contacts} deals={deals} listings={listings} hasBlobConfig={hasBlobConfig} />;
}
