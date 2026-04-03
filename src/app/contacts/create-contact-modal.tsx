"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface CreateContactModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateContactModal({ open, onClose, onCreated }: CreateContactModalProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("Buyer");
  const [priority, setPriority] = useState("MEDIUM");
  const [community, setCommunity] = useState("");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email: email || undefined,
          type,
          priority,
          community: community || undefined,
          value: value ? Number(value) : 0,
          notes: notes || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to create contact");
      onCreated();
    } catch {
      // stay open on error
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
          <h2 className="text-lg font-semibold text-[var(--text-gold)]">Add Contact</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Name *</label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Phone *</label>
              <Input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971..." />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Type</label>
              <select className={selectClass} value={type} onChange={(e) => setType(e.target.value)}>
                <option>Buyer</option>
                <option>Seller</option>
                <option>Investor</option>
                <option>Tenant</option>
                <option>Landlord</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Priority</label>
              <select className={selectClass} value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option>HIGH</option>
                <option>MEDIUM</option>
                <option>LOW</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Community</label>
              <Input value={community} onChange={(e) => setCommunity(e.target.value)} placeholder="e.g. Dubai Marina" />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Value</label>
              <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" />
            </div>
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

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Creating..." : "Create Contact"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
