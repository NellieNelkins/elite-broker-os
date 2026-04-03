import type { Metadata } from "next";
import { getListings } from "@/lib/queries";
import { ListingsView } from "./listings-view";

export const metadata: Metadata = { title: "Listings — Elite Broker OS" };
export const dynamic = "force-dynamic";

export default async function ListingsPage() {
  const listings = await getListings();

  const serialized = listings.map((l) => ({
    id: l.id,
    name: l.name,
    type: l.type,
    price: l.price,
    community: l.community || "",
    bedrooms: l.bedrooms || "",
    views: l.views,
    status: l.status,
    days: Math.floor((Date.now() - l.listedAt.getTime()) / (1000 * 60 * 60 * 24)),
    steps: {
      docs: l.stepDocs,
      photos: l.stepPhotos,
      price: l.stepPrice,
      portal: l.stepPortal,
      live: l.stepLive,
    },
  }));

  return <ListingsView listings={serialized} />;
}
