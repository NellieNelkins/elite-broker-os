import type { Metadata } from "next";
import { getWhatsAppContacts } from "@/lib/queries";
import { getBusinessConfig } from "@/lib/whatsapp";
import WhatsAppView from "./whatsapp-view";

export const metadata: Metadata = { title: "WhatsApp — Elite Broker OS" };
export const dynamic = "force-dynamic";

export default async function WhatsAppPage() {
  const contacts = await getWhatsAppContacts();
  const hasBusinessApi = getBusinessConfig() !== null;

  return <WhatsAppView contacts={contacts} hasBusinessApi={hasBusinessApi} />;
}
