import { getContacts } from "@/lib/queries";
import { ContactsView } from "./contacts-view";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const { contacts, total } = await getContacts({ page: 1, pageSize: 50 });

  // Serialize dates for client component
  const serialized = contacts.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email || "",
    type: c.type,
    stage: c.stage,
    priority: c.priority,
    value: c.value,
    community: c.community || "",
    property: c.property || "",
    notes: c.notes || "",
    whatsappConnected: c.whatsappConnected,
    replied: c.replied,
    addedAt: c.createdAt.toISOString(),
    lastContactedAt: c.lastContactedAt?.toISOString() || "",
    days: c.lastContactedAt
      ? Math.floor((Date.now() - c.lastContactedAt.getTime()) / (1000 * 60 * 60 * 24))
      : 999,
  }));

  return <ContactsView contacts={serialized} total={total} />;
}
