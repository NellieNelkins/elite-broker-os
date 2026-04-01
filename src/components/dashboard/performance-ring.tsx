"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { PerformanceTier } from "@/types";

interface PerformanceRingProps {
  score: number;
  tier: PerformanceTier;
}

const tierColors: Record<PerformanceTier, string> = {
  Elite: "var(--gold-400)",
  "Top 10%": "var(--green)",
  Building: "var(--amber)",
  "Below Target": "var(--red)",
};

export function PerformanceRing({ score, tier }: PerformanceRingProps) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = tierColors[tier];

  return (
    <Card className="glow-gold">
      <CardContent className="flex flex-col items-center py-6">
        <svg width="140" height="140" viewBox="0 0 140 140" className="drop-shadow-lg">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="var(--bg-elevated)"
            strokeWidth="8"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 70 70)"
            className="transition-all duration-1000"
          />
          <text
            x="70"
            y="65"
            textAnchor="middle"
            fill="var(--text-primary)"
            fontSize="28"
            fontWeight="700"
            fontFamily="Outfit, sans-serif"
          >
            {score}
          </text>
          <text
            x="70"
            y="85"
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize="11"
            fontFamily="Inter, sans-serif"
          >
            / 100
          </text>
        </svg>
        <div className="mt-3 text-center">
          <p className="text-lg font-semibold" style={{ color }}>
            {tier}
          </p>
          <p className="text-xs text-[var(--text-muted)]">Performance Score</p>
        </div>
      </CardContent>
    </Card>
  );
}
