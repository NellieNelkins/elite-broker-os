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

export async function PATCH(req: Request) {
  const userId = await resolveUserId();
  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const listing = await prisma.listing.updateMany({
    where: { id, userId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.community !== undefined && { community: data.community }),
      ...(data.bedrooms !== undefined && { bedrooms: data.bedrooms }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.stepDocs !== undefined && { stepDocs: data.stepDocs }),
      ...(data.stepPhotos !== undefined && { stepPhotos: data.stepPhotos }),
      ...(data.stepPrice !== undefined && { stepPrice: data.stepPrice }),
      ...(data.stepPortal !== undefined && { stepPortal: data.stepPortal }),
      ...(data.stepLive !== undefined && { stepLive: data.stepLive }),
    },
  });
  if (listing.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
