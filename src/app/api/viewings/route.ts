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

export async function GET(req: NextRequest) {
  const userId = await resolveUserId();
  const status = req.nextUrl.searchParams.get("status");
  const viewings = await prisma.viewing.findMany({
    where: { userId, ...(status ? { status } : {}) },
    orderBy: { scheduledAt: "asc" },
    take: 200,
  });
  return NextResponse.json({ data: viewings });
}

export async function POST(req: NextRequest) {
  const userId = await resolveUserId();
  const body = await req.json();
  if (!body.scheduledAt) return NextResponse.json({ error: "scheduledAt required" }, { status: 400 });

  const viewing = await prisma.viewing.create({
    data: {
      userId,
      scheduledAt: new Date(body.scheduledAt),
      duration: body.duration || 30,
      status: body.status || "scheduled",
      location: body.location,
      notes: body.notes,
      contactId: body.contactId || null,
      listingId: body.listingId || null,
      dealId: body.dealId || null,
    },
  });
  return NextResponse.json({ data: viewing }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const userId = await resolveUserId();
  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (data.scheduledAt) update.scheduledAt = new Date(data.scheduledAt);
  if (data.duration !== undefined) update.duration = data.duration;
  if (data.status !== undefined) update.status = data.status;
  if (data.location !== undefined) update.location = data.location;
  if (data.notes !== undefined) update.notes = data.notes;
  if (data.feedback !== undefined) update.feedback = data.feedback;
  if (data.rating !== undefined) update.rating = data.rating;

  const result = await prisma.viewing.updateMany({ where: { id, userId }, data: update });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const userId = await resolveUserId();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const result = await prisma.viewing.deleteMany({ where: { id, userId } });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
