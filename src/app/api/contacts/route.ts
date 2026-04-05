import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { contactSchema } from "@/lib/validations";

async function resolveUserId(): Promise<string | null> {
  const session = await auth();
  if (session?.user?.id) return session.user.id;
  // Fallback: first user (single-user app)
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
  return user?.id || null;
}

export async function GET(request: NextRequest) {
  const userId = await resolveUserId();
  if (!userId) {
    return NextResponse.json({ error: "No user found" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "20"), 100);
  const search = searchParams.get("search") || "";
  const stage = searchParams.get("stage") || "";
  const type = searchParams.get("type") || "";
  const priority = searchParams.get("priority") || "";

  const where = {
    userId,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { phone: { contains: search } },
        { community: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(stage && { stage }),
    ...(type && { type }),
    ...(priority && { priority }),
  };

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contact.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: contacts,
    total,
    page,
    pageSize,
  });
}

export async function POST(request: NextRequest) {
  const userId = await resolveUserId();
  if (!userId) {
    return NextResponse.json({ error: "No user found" }, { status: 401 });
  }

  const body = await request.json();
  const result = contactSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const contact = await prisma.contact.create({
    data: {
      ...result.data,
      userId,
    },
  });

  return NextResponse.json({ success: true, data: contact }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "No user found" }, { status: 401 });

  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Only update fields that are provided
  const updateData: Record<string, unknown> = {};
  const allowedFields = ["name", "phone", "email", "type", "stage", "priority", "value", "community", "property", "propType", "bedrooms", "nationality", "source", "notes"];
  for (const field of allowedFields) {
    if (data[field] !== undefined) updateData[field] = data[field];
  }

  const contact = await prisma.contact.updateMany({
    where: { id, userId },
    data: updateData,
  });
  if (contact.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
