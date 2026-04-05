import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { DealDetail } from "./deal-detail";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const deal = await prisma.deal.findUnique({ where: { id } });
  return { title: deal ? `${deal.name} — Elite Broker OS` : "Deal — Elite Broker OS" };
}

export default async function DealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      contact: { select: { id: true, name: true, phone: true, email: true } },
      activities: { orderBy: { createdAt: "desc" }, take: 20 },
      viewings: { orderBy: { scheduledAt: "desc" }, take: 10 },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!deal) notFound();

  return <DealDetail deal={deal} />;
}
