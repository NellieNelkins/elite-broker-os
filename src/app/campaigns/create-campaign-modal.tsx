"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

const TYPES = ["whatsapp", "email", "newsletter", "blast"] as const;
const AUDIENCES = ["all", "buyers", "sellers", "investors"] as const;

interface CreateCampaignModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateCampaignModal({ onClose, onCreated }: CreateCampaignModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<string>(TYPES[0]);
  const [audience, setAudience] = useState<string>(AUDIENCES[0]);
  const [template, setTemplate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), type, template: template || undefined }),
      });
      if (!res.ok) throw new Error("Failed to create campaign");
      onCreated();
    } catch {
      // Silently handle - could add error toast later
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md animate-fade-in rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-lg">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--text-gold)]">New Campaign</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Campaign Name
            </label>
            <Input
              placeholder="e.g. April Buyer Outreach"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="flex h-9 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-500)]"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Target Audience
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="flex h-9 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-500)]"
            >
              {AUDIENCES.map((a) => (
                <option key={a} value={a}>
                  {a.charAt(0).toUpperCase() + a.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Message Template
            </label>
            <textarea
              rows={4}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="Write your message template..."
              className="flex w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-500)]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="md" disabled={submitting || !name.trim()}>
              {submitting ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
