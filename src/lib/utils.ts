import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "AED"): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-AE").format(num);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("971")) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
}

export function daysAgo(dateStr: string | Date): number {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    Lead: "badge-blue",
    Qualified: "badge-violet",
    "Viewing Done": "badge-amber",
    "Offer Made": "badge-amber",
    "Under Offer": "badge-green",
    Closed: "badge-green",
    Lost: "badge-red",
  };
  return colors[stage] || "badge-blue";
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    HIGH: "badge-red",
    MEDIUM: "badge-amber",
    LOW: "badge-green",
  };
  return colors[priority] || "badge-blue";
}
