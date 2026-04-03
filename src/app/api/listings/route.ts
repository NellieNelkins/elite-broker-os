import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function resolveUserId(): Promise<string> {
  const session = await auth();
  if (session?.user?.id) return session.user.id;
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) throw new Error("No users found");
  return user.id;
}

export async function POST(req: Request) {
  const userId = await resolveUserId();
  const body = await req.json();
  const listing = await prisma.listing.create({
    data: {
      userId,
      name: body.name,
      type: body.type || "Villa",
      price: body.price || 0,
      community: body.community,
      bedrooms: body.bedrooms,
      address: body.address,
      status: body.status || "Active",
    },
  });
  return NextResponse.json(listing, { status: 201 });
}
