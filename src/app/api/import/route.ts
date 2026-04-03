import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/import
 * Accepts parsed CSV/Excel data (JSON array of rows) with column mapping.
 * Creates contacts in the database.
 */
export async function POST(req: NextRequest) {
  const { rows, mapping, type } = await req.json();

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }

  if (!mapping || typeof mapping !== "object") {
    return NextResponse.json({ error: "Column mapping required" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) {
    return NextResponse.json({ error: "No user found" }, { status: 400 });
  }

  const importType = type || "contacts";
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  if (importType === "contacts") {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const name = row[mapping.name]?.toString().trim();
        const phone = row[mapping.phone]?.toString().trim();

        if (!name || !phone) {
          skipped++;
          continue;
        }

        // Check for duplicate by phone
        const existing = await prisma.contact.findFirst({
          where: { userId: user.id, phone },
        });
        if (existing) {
          skipped++;
          continue;
        }

        // Build notes with location info if mapped
        const noteParts: string[] = [];
        if (mapping.notes && row[mapping.notes]?.toString().trim()) {
          noteParts.push(row[mapping.notes].toString().trim());
        }
        if (mapping.location && row[mapping.location]?.toString().trim()) {
          noteParts.push(`Location: ${row[mapping.location].toString().trim()}`);
        }
        if (mapping.city && row[mapping.city]?.toString().trim()) {
          noteParts.push(`City: ${row[mapping.city].toString().trim()}`);
        }
        if (mapping.country && row[mapping.country]?.toString().trim()) {
          noteParts.push(`Country: ${row[mapping.country].toString().trim()}`);
        }

        await prisma.contact.create({
          data: {
            userId: user.id,
            name,
            phone,
            email: mapping.email ? row[mapping.email]?.toString().trim() || undefined : undefined,
            type: mapping.type ? (row[mapping.type]?.toString().trim() || "Buyer") : "Buyer",
            stage: mapping.stage ? (row[mapping.stage]?.toString().trim() || "Lead") : "Lead",
            priority: mapping.priority ? (row[mapping.priority]?.toString().trim() || "MEDIUM") : "MEDIUM",
            value: mapping.value ? parseFloat(row[mapping.value]) || 0 : 0,
            community: mapping.community ? row[mapping.community]?.toString().trim() || undefined : undefined,
            property: mapping.property ? row[mapping.property]?.toString().trim() || undefined : undefined,
            propType: mapping.propType ? row[mapping.propType]?.toString().trim() || undefined : undefined,
            bedrooms: mapping.bedrooms ? row[mapping.bedrooms]?.toString().trim() || undefined : undefined,
            nationality: mapping.nationality ? row[mapping.nationality]?.toString().trim() || undefined : undefined,
            source: mapping.source ? row[mapping.source]?.toString().trim() || "Excel" : "Excel",
            notes: noteParts.length > 0 ? noteParts.join(" | ") : undefined,
          },
        });
        imported++;
      } catch (err) {
        errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }
  }

  return NextResponse.json({
    success: true,
    imported,
    skipped,
    total: rows.length,
    errors: errors.slice(0, 10),
  });
}
