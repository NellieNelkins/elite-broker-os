"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { toast } from "sonner";

interface ListingRow {
  id: string;
  name: string;
  type: string;
  price: number;
  community: string;
  bedrooms: string;
  views: number;
  status: string;
  days: number;
  steps: { docs: boolean; photos: boolean; price: boolean; portal: boolean; live: boolean };
}

interface EditListingModalProps {
  open: boolean;
  listing: ListingRow;
  onClose: () => void;
  onSaved: () => void;
}

export function EditListingModal({ open, listing, onClose, onSaved }: EditListingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState(listing.name);
  const [type, setType] = useState(listing.type);
  const [price, setPrice] = useState(String(listing.price));
  const [community, setCommunity] = useState(listing.community);
  const [bedrooms, setBedrooms] = useState(listing.bedrooms);
  const [status, setStatus] = useState(listing.status);
  const [stepDocs, setStepDocs] = useState(listing.steps.docs);
  const [stepPhotos, setStepPhotos] = useState(listing.steps.photos);
  const [stepPrice, setStepPrice] = useState(listing.steps.price);
  const [stepPortal, setStepPortal] = useState(listing.steps.portal);
  const [stepLive, setStepLive] = useState(listing.steps.live);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: listing.id,
          name,
          type,
          price: price ? Number(price) : 0,
          community: community || undefined,
          bedrooms: bedrooms || undefined,
          status,
          stepDocs,
          stepPhotos,
          stepPrice,
          stepPortal,
          stepLive,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to update listing (${res.status})`);
      }
      toast.success("Listing updated successfully");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update listing");
    } finally {
      setLoading(false);
    }
  }

  const labelClass = "text-xs font-medium text-[var(--text-secondary)]";
  const selectClass =
    "flex h-9 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1 text-sm text-[var(--text-primary)] outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-500)]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[var(--text-gold)]">Edit Listing</h2>
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
            <label className={labelClass}>Status</label>
            <select className={selectClass} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Active</option>
              <option>Under Offer</option>
              <option>Sold</option>
              <option>Draft</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className={labelClass}>Checklist Steps</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer">
                <input type="checkbox" checked={stepDocs} onChange={(e) => setStepDocs(e.target.checked)} className="accent-[var(--gold-500)]" />
                Docs
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer">
                <input type="checkbox" checked={stepPhotos} onChange={(e) => setStepPhotos(e.target.checked)} className="accent-[var(--gold-500)]" />
                Photos
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer">
                <input type="checkbox" checked={stepPrice} onChange={(e) => setStepPrice(e.target.checked)} className="accent-[var(--gold-500)]" />
                Price
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer">
                <input type="checkbox" checked={stepPortal} onChange={(e) => setStepPortal(e.target.checked)} className="accent-[var(--gold-500)]" />
                Portal
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer">
                <input type="checkbox" checked={stepLive} onChange={(e) => setStepLive(e.target.checked)} className="accent-[var(--gold-500)]" />
                Live
              </label>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-[var(--red)]/10 px-3 py-2 text-xs text-[var(--red)]">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
