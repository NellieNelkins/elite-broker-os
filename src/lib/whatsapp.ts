/**
 * WhatsApp integration utilities.
 *
 * Two modes:
 * 1. Direct linking — opens user's own WhatsApp via wa.me deep links
 * 2. Business Cloud API — sends via Meta WhatsApp Business Platform
 */

// --- Direct WhatsApp Deep Links ---

/**
 * Normalize a phone number to international format (strip spaces, dashes, etc.)
 * Keeps the leading + if present, otherwise assumes it's already international.
 */
function normalizePhone(phone: string): string {
  // Remove all non-digit characters except leading +
  const cleaned = phone.replace(/[^\d+]/g, "");
  // Remove leading + for wa.me format
  return cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;
}

/**
 * Generate a wa.me deep link to open WhatsApp with a pre-filled message.
 * Works with WhatsApp Web, desktop app, or mobile app.
 */
export function waLink(phone: string, message?: string): string {
  const num = normalizePhone(phone);
  const base = `https://wa.me/${num}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate a WhatsApp API link (for programmatic use via Business API).
 */
export function waApiLink(phone: string): string {
  return `https://api.whatsapp.com/send?phone=${normalizePhone(phone)}`;
}

// --- Message Templates ---

export interface MessageTemplate {
  id: string;
  name: string;
  text: string;
  category: "greeting" | "follow_up" | "listing" | "viewing" | "offer" | "custom";
}

export const defaultTemplates: MessageTemplate[] = [
  {
    id: "greeting_buyer",
    name: "New Buyer Greeting",
    category: "greeting",
    text: "Hi {name}, thank you for your interest! I'm {agent}, your dedicated property advisor. What type of property are you looking for in Dubai?",
  },
  {
    id: "greeting_seller",
    name: "New Seller Greeting",
    category: "greeting",
    text: "Hi {name}, I'd love to help you sell your property. Could you share some details about your property so I can provide a market valuation?",
  },
  {
    id: "follow_up_hot",
    name: "Hot Lead Follow-up",
    category: "follow_up",
    text: "Hi {name}, just following up on our conversation about {community}. Are you available for a viewing this week?",
  },
  {
    id: "follow_up_cold",
    name: "Re-engagement",
    category: "follow_up",
    text: "Hi {name}, hope you're well! The market in {community} has been moving — wanted to share some new opportunities. Would you like an update?",
  },
  {
    id: "listing_share",
    name: "Share Listing",
    category: "listing",
    text: "Hi {name}, I have a fantastic {propType} in {community} that matches what you're looking for. Shall I send you the details?",
  },
  {
    id: "viewing_confirm",
    name: "Viewing Confirmation",
    category: "viewing",
    text: "Hi {name}, confirming our viewing appointment. Looking forward to showing you the property. Please let me know if the time still works!",
  },
  {
    id: "offer_update",
    name: "Offer Update",
    category: "offer",
    text: "Hi {name}, great news — I have an update on your offer. Can we schedule a quick call to discuss?",
  },
];

/**
 * Fill template placeholders with contact data.
 */
export function fillTemplate(
  template: string,
  data: Record<string, string | undefined>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => data[key] || `{${key}}`);
}

// --- WhatsApp Business Cloud API ---

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId?: string;
  webhookVerifyToken?: string;
}

/**
 * Send a text message via WhatsApp Business Cloud API.
 * Requires WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID env vars.
 */
export async function sendBusinessMessage(
  to: string,
  text: string,
  config: WhatsAppConfig
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const phone = normalizePhone(to);

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${config.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "text",
          text: { body: text },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.error?.message || `HTTP ${res.status}`,
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

/**
 * Get WhatsApp Business config from environment variables.
 * Returns null if not configured.
 */
export function getBusinessConfig(): WhatsAppConfig | null {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) return null;

  return {
    accessToken,
    phoneNumberId,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
  };
}
