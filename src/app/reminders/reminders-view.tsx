"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Clock,
  Phone,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { waLink } from "@/lib/whatsapp";

interface Reminder {
  id: string;
  name: string;
  phone: string;
  type: string;
  stage: string;
  priority: string;
  community: string | null;
  daysSinceContact: number;
  lastContactedAt: string | null;
  urgency: "overdue" | "due_today" | "upcoming" | "ok";
  deal: {
    id: string;
    name: string;
    stage: string;
    value: number;
  } | null;
}

const urgencyConfig = {
  overdue: {
    label: "Overdue (14+ days)",
    color: "red" as const,
    icon: AlertTriangle,
    bg: "var(--red)",
  },
  due_today: {
    label: "Follow up soon (7-13 days)",
    color: "amber" as const,
    icon: Clock,
    bg: "var(--amber)",
  },
  upcoming: {
    label: "Coming up (5-6 days)",
    color: "default" as const,
    icon: Clock,
    bg: "var(--text-muted)",
  },
};

export default function RemindersView({
  reminders,
}: {
  reminders: Reminder[];
}) {
  const overdue = reminders.filter((r) => r.urgency === "overdue");
  const dueToday = reminders.filter((r) => r.urgency === "due_today");
  const upcoming = reminders.filter((r) => r.urgency === "upcoming");

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-gold)]">
            Follow-up Reminders
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            {reminders.length} contacts need attention
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={overdue.length > 0 ? "border-[var(--red)]/30" : ""}>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Overdue</CardTitle>
            <AlertTriangle
              size={16}
              className={overdue.length > 0 ? "text-[var(--red)]" : "text-[var(--text-muted)]"}
            />
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-semibold ${
                overdue.length > 0 ? "text-[var(--red)]" : "text-[var(--text-muted)]"
              }`}
            >
              {overdue.length}
            </p>
            <p className="text-xs text-[var(--text-muted)]">14+ days no contact</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Due Soon</CardTitle>
            <Clock size={16} className="text-[var(--amber)]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-[var(--amber)]">
              {dueToday.length}
            </p>
            <p className="text-xs text-[var(--text-muted)]">7-13 days since contact</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Upcoming</CardTitle>
            <CheckCircle2 size={16} className="text-[var(--green)]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-[var(--text-secondary)]">
              {upcoming.length}
            </p>
            <p className="text-xs text-[var(--text-muted)]">5-6 days since contact</p>
          </CardContent>
        </Card>
      </div>

      {reminders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-[var(--text-muted)]">
            <CheckCircle2 size={32} className="mx-auto mb-3 text-[var(--green)] opacity-50" />
            <p>All caught up! No follow-ups needed right now.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {[
            { items: overdue, config: urgencyConfig.overdue },
            { items: dueToday, config: urgencyConfig.due_today },
            { items: upcoming, config: urgencyConfig.upcoming },
          ]
            .filter(({ items }) => items.length > 0)
            .map(({ items, config }) => (
              <div key={config.label}>
                <div className="mb-3 flex items-center gap-2">
                  <config.icon size={14} style={{ color: config.bg }} />
                  <h3 className="text-sm font-medium text-[var(--text-secondary)]">
                    {config.label}
                  </h3>
                  <div className="h-px flex-1 bg-[var(--border-default)]" />
                  <Badge variant={config.color}>{items.length}</Badge>
                </div>

                <div className="space-y-2">
                  {items.map((r) => (
                    <Card
                      key={r.id}
                      className="transition-all hover:border-[var(--border-gold)]"
                    >
                      <CardContent className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-4">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-medium"
                            style={{ backgroundColor: `${config.bg}15`, color: config.bg }}
                          >
                            {r.daysSinceContact}d
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">
                              {r.name}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                              {r.phone}
                              {r.community && ` · ${r.community}`}
                              {r.deal && (
                                <>
                                  {" "}
                                  · Deal: {r.deal.name} (
                                  {formatCurrency(r.deal.value)})
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <Badge variant={config.color}>{r.stage}</Badge>
                            <Badge
                              variant={
                                r.priority === "HIGH"
                                  ? "red"
                                  : r.priority === "MEDIUM"
                                  ? "amber"
                                  : "default"
                              }
                            >
                              {r.priority}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(`tel:${r.phone}`, "_self")
                              }
                              title="Call"
                            >
                              <Phone size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  waLink(
                                    r.phone,
                                    `Hi ${r.name.split(" ")[0]}, just checking in — how are things going?`
                                  ),
                                  "_blank"
                                )
                              }
                              title="WhatsApp"
                            >
                              <MessageSquare size={14} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
