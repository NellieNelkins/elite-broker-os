import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  phone: z.string().min(5, "Phone is required").max(20),
  phone2: z.string().max(20).optional(),
  phone3: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal("")),
  type: z.enum(["Buyer", "Seller", "Investor", "Tenant", "Landlord"]).default("Buyer"),
  stage: z.enum(["Lead", "Qualified", "Viewing Done", "Offer Made", "Under Offer", "Closed", "Lost"]).default("Lead"),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  value: z.number().min(0).default(0),
  community: z.string().max(200).optional(),
  property: z.string().max(200).optional(),
  bedrooms: z.string().max(10).optional(),
  propType: z.enum(["Villa", "Apartment", "Townhouse", "Penthouse", "Plot"]).optional(),
  permitNum: z.string().max(50).optional(),
  dldNum: z.string().max(50).optional(),
  nationality: z.string().max(100).optional(),
  motivation: z.string().max(500).optional(),
  source: z.string().max(50).optional(),
  notes: z.string().max(5000).optional(),
});

export const dealSchema = z.object({
  name: z.string().min(1, "Deal name is required").max(200),
  contactId: z.string().optional(),
  stage: z.enum(["Lead", "Qualified", "Viewing Done", "Offer Made", "Under Offer", "Closed", "Lost"]).default("Lead"),
  value: z.number().min(0).default(0),
  commission: z.number().min(0).default(0),
  probability: z.number().min(0).max(100).default(0),
  community: z.string().max(200).optional(),
  property: z.string().max(200).optional(),
  nextAction: z.string().max(500).optional(),
  nextDate: z.string().optional(),
  notes: z.string().max(5000).optional(),
});

export const listingSchema = z.object({
  name: z.string().min(1, "Listing name is required").max(200),
  type: z.enum(["Villa", "Apartment", "Townhouse", "Penthouse", "Plot"]).default("Villa"),
  price: z.number().min(0).default(0),
  address: z.string().max(500).optional(),
  community: z.string().max(200).optional(),
  bedrooms: z.string().max(10).optional(),
  status: z.enum(["Active", "Under Offer", "Sold", "Draft"]).default("Active"),
});

export const aiMessageSchema = z.object({
  prompt: z.string().min(1, "Message is required").max(10000),
  context: z.string().max(50000).optional(),
  type: z.enum(["analysis", "coaching", "message_draft", "market_insight", "listing_optimize"]).default("analysis"),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type DealInput = z.infer<typeof dealSchema>;
export type ListingInput = z.infer<typeof listingSchema>;
export type AiMessageInput = z.infer<typeof aiMessageSchema>;
