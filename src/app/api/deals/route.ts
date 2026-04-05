import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

async function resolveUserId(): Promise<string> {
  const session = await auth();
  if (session?.user?.id) return session.user.id;
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
  if (!user) throw new Error("No users found");
  return user.id;
}

/**
 * PATCH /api/deals  — update milestones, commission splits, or any deal field
 * Body: { id, ...fields }
 */
export async function PATCH(req: NextRequest) {
  const userId = await resolveUserId();
  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const update: Record<string, unknown> = {};
  const scalarFields = ["name", "stage", "value", "commission", "probability", "community", "property", "nextAction", "notes", "listingId", "contactId", "netCommission"];
  for (const f of scalarFields) if (data[f] !== undefined) update[f] = data[f];

  const dateFields = ["nextDate", "offerAcceptedAt", "mouSignedAt", "depositPaidAt", "nocReceivedAt", "trusteeBookedAt", "trusteeDate", "transferredAt", "keysHandedAt"];
  for (const f of dateFields) {
    if (data[f] !== undefined) update[f] = data[f] ? new Date(data[f]) : null;
  }

  if (data.commissionSplits !== undefined) update.commissionSplits = data.commissionSplits;

  const result = await prisma.deal.updateMany({ where: { id, userId }, data: update });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const userId = await resolveUserId();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const result = await prisma.deal.deleteMany({ where: { id, userId } });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
