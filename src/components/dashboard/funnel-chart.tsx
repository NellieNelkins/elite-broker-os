"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { FunnelStage } from "@/types";

const stageColors: Record<string, string> = {
  Lead: "var(--blue)",
  Qualified: "var(--violet)",
  "Viewing Done": "var(--amber)",
  "Offer Made": "var(--amber)",
  "Under Offer": "var(--green)",
  Closed: "var(--green)",
};

interface FunnelChartProps {
  stages: FunnelStage[];
}

export function FunnelChart({ stages }: FunnelChartProps) {
  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stages.map((stage) => (
          <div key={stage.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-secondary)]">{stage.name}</span>
              <span className="font-mono text-[var(--text-primary)]">
                {stage.count}{" "}
                <span className="text-[var(--text-muted)]">({stage.percentage}%)</span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(stage.count / maxCount) * 100}%`,
                  backgroundColor: stageColors[stage.name] || "var(--blue)",
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
