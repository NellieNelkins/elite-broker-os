"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  UserCheck,
  CalendarClock,
  Building2,
  TrendingUp,
  MessageSquareText,
  BarChart3,
  Bot,
  Settings2,
  Sparkles,
} from "lucide-react";

interface AgentConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  defaultActive: boolean;
  stat: string;
}

const agents: AgentConfig[] = [
  {
    id: "lead-qualifier",
    name: "Lead Qualifier",
    description:
      "Auto-scores incoming leads based on budget, timeline, property preference",
    icon: UserCheck,
    defaultActive: true,
    stat: "47 leads scored",
  },
  {
    id: "follow-up-scheduler",
    name: "Follow-up Scheduler",
    description:
      "Suggests optimal follow-up times based on contact history",
    icon: CalendarClock,
    defaultActive: true,
    stat: "31 follow-ups scheduled",
  },
  {
    id: "market-matcher",
    name: "Market Matcher",
    description:
      "Matches buyer preferences to available listings automatically",
    icon: Building2,
    defaultActive: false,
    stat: "12 matches found",
  },
  {
    id: "price-advisor",
    name: "Price Advisor",
    description:
      "AI-powered price recommendations based on market comps",
    icon: TrendingUp,
    defaultActive: true,
    stat: "8 valuations generated",
  },
  {
    id: "campaign-writer",
    name: "Campaign Writer",
    description:
      "Auto-generates WhatsApp campaign messages based on listing data",
    icon: MessageSquareText,
    defaultActive: false,
    stat: "23 messages drafted",
  },
  {
    id: "deal-analyzer",
    name: "Deal Analyzer",
    description:
      "Predicts deal close probability and suggests next actions",
    icon: BarChart3,
    defaultActive: false,
    stat: "15 deals analyzed",
  },
];

export default function AgentsPage() {
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(agents.map((a) => [a.id, a.defaultActive]))
  );

  const activeCount = Object.values(activeStates).filter(Boolean).length;

  function toggleAgent(id: string) {
    setActiveStates((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Bot size={22} className="text-[var(--text-gold)]" />
          <h1 className="text-xl font-semibold text-[var(--text-gold)]">
            6 AI Agents
          </h1>
        </div>
        <Badge variant="green">{activeCount} Active</Badge>
        <Badge variant="amber">
          <Sparkles size={12} />
          Coming Soon: Premium Agents
        </Badge>
      </div>

      {/* Agent grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const isActive = activeStates[agent.id];

          return (
            <Card key={agent.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] p-2">
                      <Icon
                        size={18}
                        className={
                          isActive
                            ? "text-[var(--text-gold)]"
                            : "text-[var(--text-muted)]"
                        }
                      />
                    </div>
                    <CardTitle className="text-[var(--text-primary)]">
                      {agent.name}
                    </CardTitle>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isActive}
                    onClick={() => toggleAgent(agent.id)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                      isActive
                        ? "bg-[var(--green)]"
                        : "bg-[var(--bg-elevated)]"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                        isActive ? "translate-x-[18px]" : "translate-x-[3px]"
                      }`}
                    />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                  {agent.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    {agent.stat}
                  </span>
                  <Badge variant={isActive ? "green" : "default"}>
                    {isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <Button variant="secondary" size="sm" className="w-full">
                  <Settings2 size={14} />
                  Configure
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
