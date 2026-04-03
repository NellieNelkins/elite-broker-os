import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function resolveUserId(): Promise<string> {
  const session = await auth();
  if (session?.user?.id) return session.user.id;
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) throw new Error("No users found");
  return user.id;
}

export async function GET() {
  try {
    const userId = await resolveUserId();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        apiKey: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hasWhatsapp =
      !!process.env.WHATSAPP_ACCESS_TOKEN &&
      !!process.env.WHATSAPP_PHONE_NUMBER_ID;

    return NextResponse.json({
      success: true,
      data: {
        name: user.name || "Dubai Broker",
        email: user.email,
        image: user.image,
        apiKey: user.apiKey ? "sk-ant-...configured" : null,
        whatsapp: hasWhatsapp ? "connected" : "direct",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await resolveUserId();
    const body = await request.json();

    if (!body.apiKey || typeof body.apiKey !== "string") {
      return NextResponse.json(
        { error: "apiKey is required and must be a string" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { apiKey: body.apiKey },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
