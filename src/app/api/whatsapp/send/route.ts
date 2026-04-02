import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendBusinessMessage, getBusinessConfig } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  const config = getBusinessConfig();
  if (!config) {
    return NextResponse.json(
      { error: "WhatsApp Business API not configured. Add WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID to env vars." },
      { status: 400 }
    );
  }

  const { contactId, phone, text } = await req.json();

  if (!phone || !text) {
    return NextResponse.json({ error: "phone and text required" }, { status: 400 });
  }

  const result = await sendBusinessMessage(phone, text, config);

  // Log the activity regardless of send result
  if (contactId) {
    const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
    if (user) {
      await prisma.activity.create({
        data: {
          userId: user.id,
          contactId,
          type: "message",
          description: text,
        },
      });

      // Mark contact as WhatsApp connected
      await prisma.contact.update({
        where: { id: contactId },
        data: { whatsappConnected: true, lastContactedAt: new Date() },
      });
    }
  }

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, messageId: result.messageId });
}
