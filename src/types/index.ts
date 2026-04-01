// ===== Core Data Models =====

export interface Contact {
  id: string;
  name: string;
  phone: string;
  phone2?: string;
  phone3?: string;
  email?: string;
  type: ContactType;
  stage: DealStage;
  priority: Priority;
  days: number;
  value: number;
  community?: string;
  property?: string;
  bedrooms?: string;
  propType?: PropertyType;
  permitNum?: string;
  dldNum?: string;
  nationality?: string;
  motivation?: string;
  source?: ContactSource;
  notes?: string;
  addedAt: string;
  lastContactedAt?: string;
  whatsappConnected: boolean;
  replied: boolean;
}

export interface Deal {
  id: string;
  contactId?: string;
  name: string;
  stage: DealStage;
  value: number;
  commission: number;
  probability: number;
  daysInStage: number;
  nextAction?: string;
  nextDate?: string;
  community?: string;
  property?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Listing {
  id: string;
  name: string;
  type: PropertyType;
  price: number;
  address?: string;
  community?: string;
  bedrooms?: string;
  daysOnMarket: number;
  views: number;
  status: ListingStatus;
  listedAt: string;
  steps: ListingSteps;
}

export interface ListingSteps {
  docs: boolean;
  photos: boolean;
  price: boolean;
  portal: boolean;
  live: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  contacts: Contact[];
  template?: string;
  sentCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  contactId?: string;
  dealId?: string;
  timestamp: string;
}

export interface CoachSession {
  id: string;
  date: string;
  habits: HabitEntry[];
  challengesDone: string[];
  streak: number;
  score: number;
  targets: CoachTargets;
}

export interface HabitEntry {
  name: string;
  completed: boolean;
  points: number;
}

export interface CoachTargets {
  calls: number;
  viewings: number;
  offers: number;
}

// ===== KPI / Dashboard Types =====

export interface DashboardKPIs {
  totalContacts: number;
  activeDeals: number;
  weightedCommission: number;
  conversionRate: number;
  hotDeals: number;
  urgentFollowUps: number;
  totalListings: number;
  avgDaysOnMarket: number;
  performanceScore: number;
  performanceTier: PerformanceTier;
}

export interface FunnelStage {
  name: DealStage;
  count: number;
  value: number;
  percentage: number;
}

// ===== Enums =====

export type ContactType = "Buyer" | "Seller" | "Investor" | "Tenant" | "Landlord";
export type DealStage = "Lead" | "Qualified" | "Viewing Done" | "Offer Made" | "Under Offer" | "Closed" | "Lost";
export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type PropertyType = "Villa" | "Apartment" | "Townhouse" | "Penthouse" | "Plot";
export type ListingStatus = "Active" | "Under Offer" | "Sold" | "Draft";
export type ContactSource = "WhatsApp" | "DLD Import" | "Excel" | "Bayut" | "Property Finder" | "Referral" | "Walk-in" | "Manual";
export type CampaignType = "whatsapp" | "email" | "newsletter" | "blast";
export type CampaignStatus = "draft" | "in_progress" | "completed" | "paused";
export type ActivityType = "call" | "viewing" | "offer" | "message" | "note" | "deal_update";
export type PerformanceTier = "Elite" | "Top 10%" | "Building" | "Below Target";

// ===== API Types =====

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}
