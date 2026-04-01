/**
 * Elite Broker OS — Google Sheets to PostgreSQL Migration Script
 *
 * This script migrates data from:
 * 1. The original seedDemo() data embedded in index.original.html
 * 2. Google Sheets via the Apps Script endpoint
 * 3. Excel files (via xlsx parsing)
 *
 * Usage:
 *   npx tsx scripts/migrate.ts                  # Migrate seed data
 *   npx tsx scripts/migrate.ts --from-sheets    # Migrate from Google Sheets
 *   npx tsx scripts/migrate.ts --from-excel <file.xlsx>  # Migrate from Excel
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

// --- Prisma setup ---
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("ERROR: DATABASE_URL not set. Copy .env.example to .env.local and fill in your Supabase URL.");
  process.exit(1);
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// --- Original seed data from index.original.html ---
const seedContacts = [
  { name: "Masood Azhar", type: "Investor", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "971504505183", email: "", priority: "MEDIUM" },
  { name: "Sameer Joshi", type: "Personal Use", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "971506568894", email: "", priority: "MEDIUM" },
  { name: "Sasan", type: "Personal Use", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "971508773870", email: "", priority: "MEDIUM" },
  { name: "Sadia", type: "Investor", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "971504418916", email: "", priority: "MEDIUM" },
  { name: "Hanuma", type: "Investor", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "971503417794", email: "", priority: "MEDIUM" },
  { name: "Sayed", type: "Investor", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "971501688293", email: "", priority: "MEDIUM" },
  { name: "Adita", type: "Personal Use", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "971506245876", email: "", priority: "MEDIUM" },
  { name: "Mushtaq", type: "Personal Use", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "971509106531", email: "", priority: "MEDIUM" },
  { name: "Jamal", type: "Investor", stage: "Qualified", days: 3, value: 270000, notes: "Villa owner", phone: "971506446512", email: "", priority: "MEDIUM" },
  { name: "Kamal Naaman", type: "Seller", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "971506241668", email: "", priority: "MEDIUM" },
  { name: "Hicham", type: "Personal Use", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "971529118751", email: "", priority: "MEDIUM" },
  { name: "Ghazal", type: "Investor", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "971506434579", email: "", priority: "MEDIUM" },
  { name: "Jan", type: "Personal Use", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "971506564349", email: "", priority: "MEDIUM" },
  { name: "Syed", type: "Investor", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "971554560212", email: "", priority: "MEDIUM" },
  { name: "Sujatha", type: "Investor", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "971504559169", email: "", priority: "MEDIUM" },
  { name: "Suleman", type: "Investor", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "447910065366", email: "", priority: "MEDIUM" },
  { name: "Venkatesh", type: "Investor", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "971566820716", email: "", priority: "MEDIUM" },
  { name: "Nikita", type: "Personal Use", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "971567054789", email: "", priority: "MEDIUM" },
  { name: "Manik", type: "Investor", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "971506404690", email: "", priority: "MEDIUM" },
  { name: "Marc", type: "Seller", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "971502860454", email: "", priority: "MEDIUM" },
  { name: "Manuel", type: "Personal Use", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "971502132288", email: "", priority: "MEDIUM" },
  { name: "Maha", type: "Personal Use", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "971504528619", email: "", priority: "MEDIUM" },
  { name: "Nmesoma", type: "Investor", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "2348033017310", email: "", priority: "MEDIUM" },
  { name: "Niva", type: "Investor", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "", email: "", priority: "MEDIUM" },
  { name: "Nouria", type: "Seller", stage: "Qualified", days: 3, value: 0, notes: "Villa owner", phone: "33664944289", email: "", priority: "MEDIUM" },
];

const seedPipeline = [
  { name: "Masood Azhar", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "" },
  { name: "Sameer Joshi", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "" },
  { name: "Sasan", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "" },
  { name: "Sadia", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "" },
  { name: "Hanuma", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "" },
  { name: "Sayed", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "" },
  { name: "Adita", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "" },
  { name: "Mushtaq", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "" },
  { name: "Jamal", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "Qualify budget" },
  { name: "Kamal Naaman", stage: "Qualified", value: 270000, comm: 0.05, days: 7, notes: "" },
  { name: "Hicham", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "" },
  { name: "Ghazal", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "" },
  { name: "Jan", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "" },
  { name: "Syed", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "" },
  { name: "Sujatha", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "" },
  { name: "Suleman", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "" },
  { name: "Venkatesh", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "" },
  { name: "Nikita", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "" },
  { name: "Manik", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "" },
  { name: "Marc", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "" },
  { name: "Manuel", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "" },
  { name: "Maha", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "" },
  { name: "Nmesoma", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "" },
  { name: "Niva", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "" },
  { name: "Nouria", stage: "Qualified", value: 0, comm: 0.02, days: 0, notes: "" },
];

const seedListings = [
  { name: "2BR Palm Jumeirah", type: "Villa", price: 3200000, days: 14, views: 48, status: "Active", beds: "2", address: "Palm Jumeirah, Frond M, Villa 12", notes: "Pool view unit" },
  { name: "3BR Downtown Dubai", type: "Apartment", price: 4800000, days: 32, views: 21, status: "Active", beds: "3", address: "Downtown Dubai, Burj Vista Tower 1, 24F", notes: "Needs price drop" },
  { name: "Studio JVC", type: "Apartment", price: 850000, days: 7, views: 62, status: "Active", beds: "0", address: "JVC District 10, Belgravia Sq, Unit 304", notes: "High demand area" },
  { name: "4BR Emirates Hills", type: "Villa", price: 12500000, days: 45, views: 18, status: "Under Offer", beds: "4", address: "Emirates Hills, Sector E, Villa 7", notes: "Serious buyer viewing" },
  { name: "1BR Dubai Marina", type: "Apartment", price: 1200000, days: 55, views: 9, status: "Active", beds: "1", address: "Dubai Marina, Marina Gate 2, Unit 1802", notes: "No interest — review" },
];

// --- Map "Personal Use" type to valid DB type ---
function mapContactType(type: string): string {
  const typeMap: Record<string, string> = {
    "Personal Use": "Buyer",
    "Investor": "Investor",
    "Seller": "Seller",
    "Buyer": "Buyer",
    "Tenant": "Tenant",
    "Landlord": "Landlord",
  };
  return typeMap[type] || "Buyer";
}

// --- Probability lookup matching original SP object ---
const stageProbability: Record<string, number> = {
  Lead: 10,
  Qualified: 30,
  "Viewing Done": 50,
  "Offer Made": 70,
  "Under Offer": 90,
  Closed: 100,
  Lost: 0,
};

// --- Excel parser (matches original parseXL function) ---
function parseExcel(filePath: string) {
  const buf = fs.readFileSync(filePath);
  const wb = XLSX.read(buf, { type: "buffer" });

  function parseSheet(sheetName: string) {
    const sheetKey = wb.SheetNames.find((n) => n.toLowerCase().includes(sheetName.toLowerCase()));
    if (!sheetKey) return [];
    const sh = wb.Sheets[sheetKey];
    const raw = XLSX.utils.sheet_to_json(sh, { header: 1, defval: "" }) as unknown[][];
    if (raw.length < 3) return [];
    const headers = raw[1] as string[];
    return raw.slice(2).filter((r) => r[0]).map((r) => {
      const obj: Record<string, unknown> = {};
      headers.forEach((h, i) => { if (h) obj[h] = r[i] !== undefined ? r[i] : ""; });
      return obj;
    });
  }

  const contacts = parseSheet("Contact").map((r: Record<string, unknown>) => ({
    name: String(r["Name"] || ""),
    type: mapContactType(String(r["Type"] || "Buyer")),
    stage: String(r["Stage"] || "Lead"),
    days: parseInt(String(r["Last Contact (days ago)"])) || 0,
    value: parseFloat(String(r["Deal Value (AED)"])) || 0,
    notes: String(r["Notes"] || ""),
    phone: String(r["Phone / WhatsApp"] || ""),
    email: String(r["Email"] || ""),
    priority: String(r["Priority"] || "MEDIUM"),
  }));

  const pipeline = parseSheet("Pipeline").map((r: Record<string, unknown>) => {
    const cp = parseFloat(String(r["Commission %"])) || 2;
    return {
      name: String(r["Deal Name"] || ""),
      stage: String(r["Stage"] || "Lead"),
      value: parseFloat(String(r["Property Value (AED)"])) || 0,
      comm: cp > 1 ? cp / 100 : cp,
      days: parseInt(String(r["Days Open"])) || 0,
      notes: String(r["Next Action"] || ""),
    };
  });

  const listings = parseSheet("Listing").map((r: Record<string, unknown>) => ({
    name: String(r["Property Name"] || ""),
    type: String(r["Type (Exclusive/Shared)"] || "Villa"),
    price: parseFloat(String(r["Price (AED)"])) || 0,
    days: parseInt(String(r["Days on Market"])) || 0,
    views: parseInt(String(r["Portal Views"])) || 0,
    status: String(r["Status"] || "Active"),
    beds: String(r["Bedrooms"] || ""),
    address: String(r["Address"] || ""),
    notes: String(r["Notes"] || ""),
  }));

  return { contacts, pipeline, listings };
}

// --- Google Sheets fetcher ---
async function fetchFromGoogleSheets(): Promise<{ contacts: typeof seedContacts; pipeline: typeof seedPipeline; listings: typeof seedListings } | null> {
  const gsUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!gsUrl) {
    console.error("GOOGLE_APPS_SCRIPT_URL not set. Skipping Google Sheets import.");
    return null;
  }

  try {
    console.log("Fetching from Google Sheets...");
    const res = await fetch(gsUrl + "?action=loadAll", { method: "GET" });
    const data = await res.json();
    console.log(`Fetched: ${data.contacts?.length || 0} contacts, ${data.pipeline?.length || 0} deals, ${data.listings?.length || 0} listings`);
    return data;
  } catch (err) {
    console.error("Failed to fetch from Google Sheets:", err);
    return null;
  }
}

// --- Main migration ---
async function migrate(source: "seed" | "sheets" | "excel", excelPath?: string) {
  console.log("\n========================================");
  console.log("  Elite Broker OS — Data Migration");
  console.log("========================================\n");

  let contacts = seedContacts;
  let pipeline = seedPipeline;
  let listings = seedListings;

  if (source === "excel" && excelPath) {
    console.log(`Reading Excel file: ${excelPath}`);
    const data = parseExcel(excelPath);
    contacts = data.contacts as typeof seedContacts;
    pipeline = data.pipeline as typeof seedPipeline;
    listings = data.listings as typeof seedListings;
  } else if (source === "sheets") {
    const data = await fetchFromGoogleSheets();
    if (data) {
      contacts = data.contacts || seedContacts;
      pipeline = data.pipeline || seedPipeline;
      listings = data.listings || seedListings;
    }
  }

  console.log(`Source: ${source}`);
  console.log(`Contacts: ${contacts.length}`);
  console.log(`Pipeline: ${pipeline.length}`);
  console.log(`Listings: ${listings.length}`);
  console.log("");

  // 1. Create or find the migration user
  const email = process.env.MIGRATION_USER_EMAIL || "broker@elitebroker.ae";
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: "Elite Broker",
        updatedAt: new Date(),
      },
    });
    console.log(`Created user: ${user.email} (${user.id})`);
  } else {
    console.log(`Using existing user: ${user.email} (${user.id})`);
  }

  // 2. Migrate contacts
  console.log("\nMigrating contacts...");
  let contactCount = 0;
  const contactMap = new Map<string, string>(); // name -> id

  for (const c of contacts) {
    const lastContactDate = new Date();
    lastContactDate.setDate(lastContactDate.getDate() - (c.days || 0));

    const contact = await prisma.contact.create({
      data: {
        userId: user.id,
        name: c.name,
        phone: c.phone || "",
        email: c.email || undefined,
        type: mapContactType(c.type),
        stage: c.stage || "Lead",
        priority: c.priority || "MEDIUM",
        value: c.value || 0,
        notes: c.notes || undefined,
        lastContactedAt: lastContactDate,
        updatedAt: new Date(),
      },
    });
    contactMap.set(c.name, contact.id);
    contactCount++;
  }
  console.log(`  Migrated ${contactCount} contacts`);

  // 3. Migrate pipeline deals (linked to contacts by name)
  console.log("Migrating pipeline deals...");
  let dealCount = 0;

  for (const d of pipeline) {
    const contactId = contactMap.get(d.name) || undefined;
    const prob = stageProbability[d.stage] ?? 30;

    await prisma.deal.create({
      data: {
        userId: user.id,
        contactId: contactId || null,
        name: d.name,
        stage: d.stage || "Lead",
        value: d.value || 0,
        commission: d.comm || 0.02,
        probability: prob,
        notes: d.notes || undefined,
        updatedAt: new Date(),
      },
    });
    dealCount++;
  }
  console.log(`  Migrated ${dealCount} deals`);

  // 4. Migrate listings
  console.log("Migrating listings...");
  let listingCount = 0;

  for (const l of listings) {
    const listedAt = new Date();
    listedAt.setDate(listedAt.getDate() - (l.days || 0));

    await prisma.listing.create({
      data: {
        userId: user.id,
        name: l.name,
        type: l.type === "Exclusive" || l.type === "Shared" ? "Villa" : l.type,
        price: l.price || 0,
        address: l.address || undefined,
        bedrooms: l.beds || undefined,
        views: l.views || 0,
        status: ["Active", "Under Offer", "Sold", "Draft"].includes(l.status) ? l.status : "Active",
        listedAt,
        stepDocs: true,
        stepPhotos: l.views > 0,
        stepPrice: true,
        stepPortal: l.views > 20,
        stepLive: l.status === "Active",
        updatedAt: new Date(),
      },
    });
    listingCount++;
  }
  console.log(`  Migrated ${listingCount} listings`);

  // 5. Summary
  console.log("\n========================================");
  console.log("  Migration Complete!");
  console.log("========================================");
  console.log(`  User:     ${user.email}`);
  console.log(`  Contacts: ${contactCount}`);
  console.log(`  Deals:    ${dealCount}`);
  console.log(`  Listings: ${listingCount}`);
  console.log("========================================\n");
}

// --- CLI ---
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--from-sheets")) {
    await migrate("sheets");
  } else if (args.includes("--from-excel")) {
    const idx = args.indexOf("--from-excel");
    const filePath = args[idx + 1];
    if (!filePath) {
      console.error("Usage: npx tsx scripts/migrate.ts --from-excel <file.xlsx>");
      process.exit(1);
    }
    await migrate("excel", path.resolve(filePath));
  } else {
    await migrate("seed");
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  prisma.$disconnect();
  process.exit(1);
});
