"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface CreateDealModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateDealModal({ open, onClose, onCreated }: CreateDealModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [stage, setStage] = useState("Lead");
  const [value, setValue] = useState("");
  const [commission, setCommission] = useState("2");
  const [community, setCommunity] = useState("");
  const [notes, setNotes] = useState("");

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          stage,
          value: value ? Number(value) : 0,
          commission: commission ? Number(commission) / 100 : 0.02,
          probability: 0,
          community: community || undefined,
          notes: notes || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to create deal (${res.status})`);
      }
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create deal");
    } finally {
      setLoading(false);
    }
  }

  const labelClass = "text-xs font-medium text-[var(--text-secondary)]";
  const selectClass =
    "flex h-9 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-500)] focus-visible:border-[var(--border-gold)]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[var(--text-gold)]">Add Deal</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Deal Name *</label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Deal name" />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Contact Name</label>
              <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Contact name" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Stage</label>
            <select className={selectClass} value={stage} onChange={(e) => setStage(e.target.value)}>
              <option>Lead</option>
              <option>Qualified</option>
              <option>Viewing Done</option>
              <option>Offer Made</option>
              <option>Under Offer</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Value *</label>
              <Input type="number" required value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Commission %</label>
              <Input type="number" value={commission} onChange={(e) => setCommission(e.target.value)} placeholder="2" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Community</label>
            <Input value={community} onChange={(e) => setCommunity(e.target.value)} placeholder="e.g. Palm Jumeirah" />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Notes</label>
            <textarea
              className="flex w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-500)] focus-visible:border-[var(--border-gold)] min-h-[72px] resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
            />
          </div>

          {error && (
            <p className="rounded-lg bg-[var(--red)]/10 px-3 py-2 text-xs text-[var(--red)]">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Creating..." : "Create Deal"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
