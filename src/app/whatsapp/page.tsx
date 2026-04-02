import { getWhatsAppContacts } from "@/lib/queries";
import WhatsAppView from "./whatsapp-view";

export const dynamic = "force-dynamic";

export default async function WhatsAppPage() {
  const contacts = await getWhatsAppContacts();

  return <WhatsAppView contacts={contacts} />;
}
