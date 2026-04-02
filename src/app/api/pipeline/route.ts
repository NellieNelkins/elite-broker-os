import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { dealSchema } from "@/lib/validations";

async function resolveUserId(): Promise<string | null> {
  const session = await auth();
  if (session?.user?.id) return session.user.id;
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
  return user?.id || null;
}

export async function GET() {
  const userId = await resolveUserId();
  if (!userId) {
    return NextResponse.json({ error: "No user found" }, { status: 401 });
  }

  const deals = await prisma.deal.findMany({
    where: { userId },
    include: { contact: { select: { name: true, phone: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const grouped = deals.reduce<Record<string, typeof deals>>((acc, deal) => {
    const stage = deal.stage;
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(deal);
    return acc;
  }, {});

  return NextResponse.json({ success: true, data: grouped });
}

export async function POST(request: NextRequest) {
  const userId = await resolveUserId();
  if (!userId) {
    return NextResponse.json({ error: "No user found" }, { status: 401 });
  }

  const body = await request.json();
  const result = dealSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const deal = await prisma.deal.create({
    data: {
      ...result.data,
      nextDate: result.data.nextDate ? new Date(result.data.nextDate) : null,
      userId,
    },
  });

  return NextResponse.json({ success: true, data: deal }, { status: 201 });
}
