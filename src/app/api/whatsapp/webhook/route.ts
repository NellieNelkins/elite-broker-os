import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getBusinessConfig } from "@/lib/whatsapp";

/**
 * WhatsApp Business webhook.
 *
 * GET  — Verification challenge (Meta sends this when you register the webhook)
 * POST — Incoming messages and status updates
 */
export async function GET(req: NextRequest) {
  const config = getBusinessConfig();
  const verifyToken = config?.webhookVerifyToken || "elite-broker-webhook";

  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Process incoming messages
  const entries = body.entry || [];
  for (const entry of entries) {
    const changes = entry.changes || [];
    for (const change of changes) {
      if (change.field !== "messages") continue;

      const messages = change.value?.messages || [];
      const contacts = change.value?.contacts || [];

      for (const msg of messages) {
        if (msg.type !== "text") continue;

        const senderPhone = msg.from;
        const text = msg.text?.body;
        if (!senderPhone || !text) continue;

        // Find contact by phone number
        const contact = await prisma.contact.findFirst({
          where: {
            OR: [
              { phone: senderPhone },
              { phone: `+${senderPhone}` },
            ],
          },
        });

        if (contact) {
          // Log incoming message as activity
          await prisma.activity.create({
            data: {
              userId: contact.userId,
              contactId: contact.id,
              type: "message",
              description: `[incoming] ${text}`,
            },
          });

          // Update contact
          await prisma.contact.update({
            where: { id: contact.id },
            data: {
              replied: true,
              whatsappConnected: true,
              lastContactedAt: new Date(),
            },
          });
        }
      }
    }
  }

  return NextResponse.json({ success: true });
}
