"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UserCheck,
  CalendarClock,
  Building2,
  TrendingUp,
  MessageSquareText,
  BarChart3,
  Bot,
  MapPin,
  Settings2,
  Sparkles,
  X,
  Save,
} from "lucide-react";
import { toast } from "sonner";

interface AgentConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  defaultActive: boolean;
  stat: string;
  settings: { label: string; key: string; type: "text" | "number" | "select"; options?: string[]; default: string }[];
}

const agents: AgentConfig[] = [
  {
    id: "lead-qualifier",
    name: "Lead Qualifier",
    description: "Auto-scores incoming leads based on budget, timeline, property preference",
    icon: UserCheck,
    defaultActive: true,
    stat: "47 leads scored",
    settings: [
      { label: "Min Budget (AED)", key: "minBudget", type: "number", default: "500000" },
      { label: "Priority Communities", key: "communities", type: "text", default: "Palm Jumeirah, Downtown Dubai, Dubai Marina" },
      { label: "Auto-assign Stage", key: "autoStage", type: "select", options: ["Lead", "Qualified"], default: "Lead" },
    ],
  },
  {
    id: "follow-up-scheduler",
    name: "Follow-up Scheduler",
    description: "Suggests optimal follow-up times based on contact history",
    icon: CalendarClock,
    defaultActive: true,
    stat: "31 follow-ups scheduled",
    settings: [
      { label: "Follow-up Interval (days)", key: "interval", type: "number", default: "7" },
      { label: "Overdue Threshold (days)", key: "overdueThreshold", type: "number", default: "14" },
      { label: "Preferred Time", key: "preferredTime", type: "select", options: ["Morning (9-12)", "Afternoon (12-5)", "Evening (5-8)"], default: "Morning (9-12)" },
    ],
  },
  {
    id: "market-matcher",
    name: "Market Matcher",
    description: "Matches buyer preferences to available listings automatically",
    icon: Building2,
    defaultActive: false,
    stat: "12 matches found",
    settings: [
      { label: "Price Tolerance (%)", key: "priceTolerance", type: "number", default: "15" },
      { label: "Match by", key: "matchBy", type: "select", options: ["Community + Budget", "Property Type + Budget", "All Criteria"], default: "Community + Budget" },
    ],
  },
  {
    id: "price-advisor",
    name: "Price Advisor",
    description: "AI-powered price recommendations based on market comps",
    icon: TrendingUp,
    defaultActive: true,
    stat: "8 valuations generated",
    settings: [
      { label: "Comp Radius (km)", key: "radius", type: "number", default: "2" },
      { label: "Comp Period (months)", key: "period", type: "number", default: "6" },
      { label: "Price Basis", key: "priceBasis", type: "select", options: ["Per sqft", "Total price", "Both"], default: "Per sqft" },
    ],
  },
  {
    id: "campaign-writer",
    name: "Campaign Writer",
    description: "Auto-generates WhatsApp campaign messages based on listing data",
    icon: MessageSquareText,
    defaultActive: false,
    stat: "23 messages drafted",
    settings: [
      { label: "Tone", key: "tone", type: "select", options: ["Professional", "Friendly", "Luxury", "Casual"], default: "Professional" },
      { label: "Language", key: "language", type: "select", options: ["English", "Arabic", "Both"], default: "English" },
      { label: "Include Price", key: "includePrice", type: "select", options: ["Yes", "No", "On Request"], default: "Yes" },
    ],
  },
  {
    id: "community-expert",
    name: "Community Expert",
    description: "Expert on Dubai villa communities — Emirates Living, Jumeirah Park, Arabian Ranches priority. Pulls daily market data from PropertyMonitor, DXBInteract, Bayut, PropertyFinder, DLD.",
    icon: MapPin,
    defaultActive: true,
    stat: "18 communities tracked",
    settings: [
      { label: "Priority Communities", key: "priorityCommunities", type: "text", default: "Emirates Living, Jumeirah Park, Arabian Ranches" },
      { label: "Data Refresh", key: "refreshFreq", type: "select", options: ["Daily", "Twice Daily", "Weekly"], default: "Daily" },
      { label: "Property Type Focus", key: "typeFocus", type: "select", options: ["Villas Only", "Villas + Townhouses", "All Types"], default: "Villas + Townhouses" },
      { label: "Primary Data Source", key: "primarySource", type: "select", options: ["DLD (Official)", "Property Monitor", "DXB Interact", "All Sources Blended"], default: "All Sources Blended" },
    ],
  },
  {
    id: "deal-analyzer",
    name: "Deal Analyzer",
    description: "Predicts deal close probability and suggests next actions",
    icon: BarChart3,
    defaultActive: false,
    stat: "15 deals analyzed",
    settings: [
      { label: "Stale Deal Threshold (days)", key: "staleThreshold", type: "number", default: "14" },
      { label: "Auto-suggest Actions", key: "autoSuggest", type: "select", options: ["Yes", "No"], default: "Yes" },
    ],
  },
];

export default function AgentsPage() {
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>(
    () => Object.fromEntries(agents.map((a) => [a.id, a.defaultActive]))
  );
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, Record<string, string>>>(() => {
    const defaults: Record<string, Record<string, string>> = {};
    agents.forEach((a) => {
      defaults[a.id] = {};
      a.settings.forEach((s) => {
        defaults[a.id][s.key] = s.default;
      });
    });
    return defaults;
  });

  const activeCount = Object.values(activeStates).filter(Boolean).length;
  const configuringAgent = agents.find((a) => a.id === configuring);

  function toggleAgent(id: string) {
    setActiveStates((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      toast.success(`${agents.find((a) => a.id === id)?.name} ${next[id] ? "activated" : "deactivated"}`);
      return next;
    });
  }

  function saveConfig() {
    if (configuring) {
      toast.success(`${configuringAgent?.name} configuration saved`);
      setConfiguring(null);
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Bot size={22} className="text-[var(--text-gold)]" />
          <h1 className="text-xl font-semibold text-[var(--text-gold)]">
            7 AI Agents
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
                      isActive ? "bg-[var(--green)]" : "bg-[var(--bg-elevated)]"
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

                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => setConfiguring(agent.id)}
                >
                  <Settings2 size={14} />
                  Configure
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configure Modal */}
      {configuring && configuringAgent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setConfiguring(null)}
        >
          <div
            className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <configuringAgent.icon size={18} className="text-[var(--text-gold)]" />
                <h2 className="text-lg font-semibold text-[var(--text-gold)]">
                  {configuringAgent.name}
                </h2>
              </div>
              <button
                onClick={() => setConfiguring(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mb-4 text-sm text-[var(--text-muted)]">
              {configuringAgent.description}
            </p>

            <div className="space-y-4">
              {configuringAgent.settings.map((setting) => (
                <div key={setting.key} className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">
                    {setting.label}
                  </label>
                  {setting.type === "select" ? (
                    <select
                      value={configValues[configuring]?.[setting.key] || setting.default}
                      onChange={(e) =>
                        setConfigValues((prev) => ({
                          ...prev,
                          [configuring]: {
                            ...prev[configuring],
                            [setting.key]: e.target.value,
                          },
                        }))
                      }
                      className="flex h-9 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1 text-sm text-[var(--text-primary)] outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-500)]"
                    >
                      {setting.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      type={setting.type}
                      value={configValues[configuring]?.[setting.key] || setting.default}
                      onChange={(e) =>
                        setConfigValues((prev) => ({
                          ...prev,
                          [configuring]: {
                            ...prev[configuring],
                            [setting.key]: e.target.value,
                          },
                        }))
                      }
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setConfiguring(null)}>
                Cancel
              </Button>
              <Button onClick={saveConfig}>
                <Save size={14} /> Save Configuration
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
