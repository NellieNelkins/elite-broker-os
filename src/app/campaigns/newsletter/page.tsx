"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Eye, Send, Clock, BarChart3 } from "lucide-react";

const TEMPLATES = ["Market Update", "New Listing", "Price Drop", "Monthly Digest"] as const;
const AUDIENCES = ["All Contacts", "Buyers Only", "Sellers Only", "Investors"] as const;

const templatePreview: Record<string, string> = {
  "Market Update":
    "Dear {{name}},\n\nHere is your weekly Dubai real-estate market update.\n\n- Palm Jumeirah prices up 3.2%\n- Downtown Dubai new inventory: 47 units\n- Marina rental yields steady at 6.8%\n\nBest regards,\nYour Broker",
  "New Listing":
    "Dear {{name}},\n\nExciting new listing alert!\n\nWe have a stunning new property available that matches your preferences. Contact us for a private viewing.\n\nBest regards,\nYour Broker",
  "Price Drop":
    "Dear {{name}},\n\nGreat news - a property on your watchlist just had a price reduction!\n\nDon't miss this opportunity. Reach out to schedule a viewing today.\n\nBest regards,\nYour Broker",
  "Monthly Digest":
    "Dear {{name}},\n\nHere is your monthly real-estate digest for Dubai.\n\n- Top performing communities\n- Upcoming off-plan launches\n- Market forecast & trends\n\nBest regards,\nYour Broker",
};

export default function NewsletterPage() {
  const [subject, setSubject] = useState("");
  const [template, setTemplate] = useState<string>(TEMPLATES[0]);
  const [body, setBody] = useState(templatePreview[TEMPLATES[0]]);
  const [audience, setAudience] = useState<string>(AUDIENCES[0]);

  function handleTemplateChange(t: string) {
    setTemplate(t);
    setBody(templatePreview[t] ?? "");
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-gold)]">Newsletter Builder</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Compose and send newsletters to your contacts
          </p>
        </div>
        <Badge variant="blue">
          <Mail size={12} /> Newsletter
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Compose panel */}
        <Card>
          <CardHeader>
            <CardTitle>Compose</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Subject Line
              </label>
              <Input
                placeholder="e.g. Weekly Market Update - April 2026"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Template
              </label>
              <select
                value={template}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="flex h-9 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-500)]"
              >
                {TEMPLATES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="flex h-9 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-500)]"
              >
                {AUDIENCES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Body
              </label>
              <textarea
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="flex w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-500)]"
              />
            </div>

            <div className="flex gap-3">
              <Button size="md">
                <Send size={14} /> Send Now
              </Button>
              <Button variant="secondary" size="md">
                <Clock size={14} /> Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview panel */}
        <div className="space-y-5">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Preview</CardTitle>
              <Eye size={16} className="text-[var(--text-muted)]" />
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-deep)] p-4">
                <p className="mb-1 text-xs font-medium text-[var(--text-muted)]">Subject</p>
                <p className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
                  {subject || "(no subject)"}
                </p>
                <p className="mb-1 text-xs font-medium text-[var(--text-muted)]">Template</p>
                <Badge variant="blue" className="mb-4">
                  {template}
                </Badge>
                <p className="mb-1 text-xs font-medium text-[var(--text-muted)]">Audience</p>
                <Badge variant="violet" className="mb-4">
                  {audience}
                </Badge>
                <p className="mb-1 text-xs font-medium text-[var(--text-muted)]">Body</p>
                <pre className="whitespace-pre-wrap text-sm text-[var(--text-secondary)]">
                  {body}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Stats placeholder */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Newsletter Stats</CardTitle>
              <BarChart3 size={16} className="text-[var(--text-muted)]" />
            </CardHeader>
            <CardContent>
              <p className="py-6 text-center text-sm text-[var(--text-muted)]">
                No newsletters sent yet
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
