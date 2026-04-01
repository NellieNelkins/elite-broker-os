"use client";

import { Card, CardHeader, CardTitle, CardContent, CardValue } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  accent?: "gold" | "green" | "red" | "blue" | "violet" | "amber";
}

const accentColors: Record<string, string> = {
  gold: "text-[var(--text-gold)]",
  green: "text-[var(--green)]",
  red: "text-[var(--red)]",
  blue: "text-[var(--blue)]",
  violet: "text-[var(--violet)]",
  amber: "text-[var(--amber)]",
};

export function KpiCard({ title, value, subtitle, icon: Icon, trend, accent = "gold" }: KpiCardProps) {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Icon size={16} className={cn("opacity-70", accentColors[accent])} />
      </CardHeader>
      <CardContent>
        <CardValue className={accentColors[accent]}>{value}</CardValue>
        <div className="mt-1.5 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                "font-medium",
                trend.value >= 0 ? "text-[var(--green)]" : "text-[var(--red)]"
              )}
            >
              {trend.value >= 0 ? "+" : ""}
              {trend.value}%
            </span>
          )}
          {subtitle && <span className="text-[var(--text-muted)]">{subtitle}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
