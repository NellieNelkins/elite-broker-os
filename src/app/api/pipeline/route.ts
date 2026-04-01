import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { dealSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deals = await prisma.deal.findMany({
    where: { userId: session.user.id },
    include: { contact: { select: { name: true, phone: true } } },
    orderBy: { updatedAt: "desc" },
  });

  // Group by stage for kanban view
  const grouped = deals.reduce<Record<string, typeof deals>>((acc, deal) => {
    const stage = deal.stage;
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(deal);
    return acc;
  }, {});

  return NextResponse.json({ success: true, data: grouped });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      userId: session.user.id,
    },
  });

  return NextResponse.json({ success: true, data: deal }, { status: 201 });
}
