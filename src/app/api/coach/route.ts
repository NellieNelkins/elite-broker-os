import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { sessionId, habits, score } = body;

  if (!sessionId || !Array.isArray(habits)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const session = await prisma.coachSession.update({
    where: { id: sessionId },
    data: { habits, score },
  });

  return NextResponse.json({ success: true, score: session.score });
}
