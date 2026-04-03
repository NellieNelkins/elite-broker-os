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

export async function POST(request: NextRequest) {
  try {
    const userId = await resolveUserId();
    const body = await request.json();

    const { name, type, template } = body as {
      name?: string;
      type?: string;
      template?: string;
    };

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Campaign name is required" }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        userId,
        name: name.trim(),
        type: type || "whatsapp",
        template: template || null,
      },
    });

    return NextResponse.json({ success: true, data: campaign }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
