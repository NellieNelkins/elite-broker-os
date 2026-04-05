import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

async function resolveUserId(): Promise<string> {
  const session = await auth();
  if (session?.user?.id) return session.user.id;
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
  if (!user) throw new Error("No users found");
  return user.id;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = [
  "application/pdf",
  "image/jpeg", "image/png", "image/webp", "image/heic",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function GET(req: NextRequest) {
  const userId = await resolveUserId();
  const contactId = req.nextUrl.searchParams.get("contactId");
  const dealId = req.nextUrl.searchParams.get("dealId");
  const listingId = req.nextUrl.searchParams.get("listingId");

  const docs = await prisma.document.findMany({
    where: { userId, ...(contactId ? { contactId } : {}), ...(dealId ? { dealId } : {}), ...(listingId ? { listingId } : {}) },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ data: docs });
}

export async function POST(req: NextRequest) {
  try {
    const userId = await resolveUserId();
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) return NextResponse.json({ error: "Blob storage not configured. Set BLOB_READ_WRITE_TOKEN in Vercel env." }, { status: 500 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "other";
    const contactId = (formData.get("contactId") as string) || null;
    const dealId = (formData.get("dealId") as string) || null;
    const listingId = (formData.get("listingId") as string) || null;

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
    if (file.type && !ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json({ error: `File type ${file.type} not allowed` }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const pathname = `documents/${userId}/${Date.now()}-${safeName}`;

    const blob = await put(pathname, file, { access: "public", token });

    const doc = await prisma.document.create({
      data: {
        userId,
        contactId,
        dealId,
        listingId,
        name: file.name,
        type,
        url: blob.url,
        size: file.size,
        mimeType: file.type || null,
      },
    });

    return NextResponse.json({ data: doc }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const userId = await resolveUserId();
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const doc = await prisma.document.findFirst({ where: { id, userId } });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (token) {
    try { await del(doc.url, { token }); } catch { /* blob may already be gone */ }
  }
  await prisma.document.delete({ where: { id: doc.id } });
  return NextResponse.json({ success: true });
}
