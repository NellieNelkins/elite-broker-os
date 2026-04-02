"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Eye,
  FileText,
  MessageSquare,
  StickyNote,
  TrendingUp,
  Clock,
  Users,
  Filter,
} from "lucide-react";

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  contact: { id: string; name: string; phone: string } | null;
  deal: { id: string; name: string; stage: string; value: number } | null;
}

const typeConfig: Record<
  string,
  { icon: typeof Phone; label: string; color: string }
> = {
  call: { icon: Phone, label: "Call", color: "var(--blue)" },
  viewing: { icon: Eye, label: "Viewing", color: "var(--amber)" },
  offer: { icon: FileText, label: "Offer", color: "var(--green)" },
  message: { icon: MessageSquare, label: "Message", color: "var(--text-gold)" },
  note: { icon: StickyNote, label: "Note", color: "var(--text-secondary)" },
  deal_update: { icon: TrendingUp, label: "Deal Update", color: "var(--green)" },
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const time = d.toLocaleTimeString("en-AE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (d.toDateString() === today.toDateString()) return `Today ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday ${time}`;

  return `${d.toLocaleDateString("en-AE", {
    month: "short",
    day: "numeric",
  })} ${time}`;
}

function groupByDate(activities: Activity[]): Record<string, Activity[]> {
  const groups: Record<string, Activity[]> = {};
  for (const a of activities) {
    const d = new Date(a.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let key: string;
    if (d.toDateString() === today.toDateString()) key = "Today";
    else if (d.toDateString() === yesterday.toDateString()) key = "Yesterday";
    else
      key = d.toLocaleDateString("en-AE", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });

    if (!groups[key]) groups[key] = [];
    groups[key].push(a);
  }
  return groups;
}

const allTypes = ["call", "viewing", "offer", "message", "note", "deal_update"];

export default function ActivityView({
  activities,
  total,
}: {
  activities: Activity[];
  total: number;
}) {
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = filter
    ? activities.filter((a) => a.type === filter)
    : activities;
  const groups = groupByDate(filtered);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-gold)]">
            Activity Feed
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            {total} total activities logged
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[var(--text-muted)]" />
          <Button
            variant={filter === null ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilter(null)}
          >
            All
          </Button>
          {allTypes.map((t) => {
            const cfg = typeConfig[t];
            return (
              <Button
                key={t}
                variant={filter === t ? "primary" : "secondary"}
                size="sm"
                onClick={() => setFilter(filter === t ? null : t)}
              >
                {cfg.label}
              </Button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-[var(--text-muted)]">
            <Clock size={32} className="mx-auto mb-3 opacity-30" />
            <p>No activities yet</p>
            <p className="mt-1 text-xs">
              Activities are logged automatically when you send messages, update
              deals, or make calls.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([date, items]) => (
            <div key={date}>
              <div className="mb-3 flex items-center gap-3">
                <h3 className="text-sm font-medium text-[var(--text-secondary)]">
                  {date}
                </h3>
                <div className="h-px flex-1 bg-[var(--border-default)]" />
                <span className="text-xs text-[var(--text-muted)]">
                  {items.length} activities
                </span>
              </div>

              <div className="space-y-2">
                {items.map((a) => {
                  const cfg = typeConfig[a.type] || typeConfig.note;
                  const Icon = cfg.icon;

                  return (
                    <Card
                      key={a.id}
                      className="transition-all hover:border-[var(--border-gold)]"
                    >
                      <CardContent className="flex items-start gap-4 py-3">
                        <div
                          className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${cfg.color}15` }}
                        >
                          <Icon size={14} style={{ color: cfg.color }} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm text-[var(--text-primary)]">
                                {a.description}
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                {a.contact && (
                                  <span className="flex items-center gap-1">
                                    <Users size={10} />
                                    {a.contact.name}
                                  </span>
                                )}
                                {a.deal && (
                                  <span className="flex items-center gap-1">
                                    <TrendingUp size={10} />
                                    {a.deal.name} ({a.deal.stage})
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="default">{cfg.label}</Badge>
                              <span className="text-[10px] text-[var(--text-muted)]">
                                {formatDateTime(a.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
