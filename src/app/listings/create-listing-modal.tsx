"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface CreateListingModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateListingModal({ open, onClose, onCreated }: CreateListingModalProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("Villa");
  const [price, setPrice] = useState("");
  const [community, setCommunity] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("Active");

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          price: price ? Number(price) : 0,
          community: community || undefined,
          bedrooms: bedrooms || undefined,
          address: address || undefined,
          status,
        }),
      });
      if (!res.ok) throw new Error("Failed to create listing");
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
          <h2 className="text-lg font-semibold text-[var(--text-gold)]">Add Listing</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Property Name *</label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Property name" />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Type</label>
              <select className={selectClass} value={type} onChange={(e) => setType(e.target.value)}>
                <option>Villa</option>
                <option>Apartment</option>
                <option>Townhouse</option>
                <option>Penthouse</option>
                <option>Plot</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Price *</label>
              <Input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Bedrooms</label>
              <select className={selectClass} value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}>
                <option value="">Select...</option>
                <option>Studio</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
                <option>6+</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Community</label>
            <Input value={community} onChange={(e) => setCommunity(e.target.value)} placeholder="e.g. Downtown Dubai" />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Address</label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address" />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Status</label>
            <select className={selectClass} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Active</option>
              <option>Draft</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Creating..." : "Create Listing"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
