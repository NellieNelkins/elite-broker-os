import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Log a WhatsApp message sent via direct linking (wa.me).
 * This creates an Activity record so we can track messaging history.
 */
export async function POST(req: NextRequest) {
  const { contactId, text, via } = await req.json();

  if (!contactId || !text) {
    return NextResponse.json({ error: "contactId and text required" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) {
    return NextResponse.json({ error: "No user found" }, { status: 400 });
  }

  await Promise.all([
    prisma.activity.create({
      data: {
        userId: user.id,
        contactId,
        type: "message",
        description: `[${via || "direct"}] ${text}`,
      },
    }),
    prisma.contact.update({
      where: { id: contactId },
      data: { whatsappConnected: true, lastContactedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ success: true });
}
