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

export async function PATCH(request: NextRequest) {
  try {
    const userId = await resolveUserId();
    const body = await request.json();
    const { id, action, ...data } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    // Action shortcuts
    const update: Record<string, unknown> = {};
    if (action === "launch") update.status = "in_progress";
    else if (action === "pause") update.status = "paused";
    else if (action === "resume") update.status = "in_progress";
    else if (action === "complete") update.status = "completed";
    else if (action === "draft") update.status = "draft";
    else {
      // Field updates
      if (data.name !== undefined) update.name = data.name;
      if (data.type !== undefined) update.type = data.type;
      if (data.template !== undefined) update.template = data.template;
      if (data.status !== undefined) update.status = data.status;
      if (data.sentCount !== undefined) update.sentCount = data.sentCount;
      if (data.replyCount !== undefined) update.replyCount = data.replyCount;
    }

    const result = await prisma.campaign.updateMany({
      where: { id, userId },
      data: update,
    });
    if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await resolveUserId();
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const result = await prisma.campaign.deleteMany({ where: { id, userId } });
    if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
