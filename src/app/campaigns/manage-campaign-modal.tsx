"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Play, Pause, Check, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CampaignData {
  id: string;
  name: string;
  type: string;
  status: string;
  contactCount: number;
  sentCount: number;
  replyCount: number;
  createdAt: string;
}

interface ManageCampaignModalProps {
  campaign: CampaignData;
  onClose: () => void;
  onChanged: () => void;
}

const labelClass = "text-xs font-medium text-[var(--text-secondary)]";
const selectClass =
  "flex h-9 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1 text-sm text-[var(--text-primary)] outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-500)]";

export function ManageCampaignModal({ campaign, onClose, onChanged }: ManageCampaignModalProps) {
  const [name, setName] = useState(campaign.name);
  const [type, setType] = useState(campaign.type);
  const [status, setStatus] = useState(campaign.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function patch(body: Record<string, unknown>) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: campaign.id, ...body }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed (${res.status})`);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const ok = await patch({ name, type, status });
    if (ok) {
      toast.success("Campaign updated");
      onChanged();
    }
  }

  async function handleAction(action: string, label: string) {
    const ok = await patch({ action });
    if (ok) {
      toast.success(`Campaign ${label}`);
      onChanged();
    }
  }

  async function handleDuplicate() {
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${name} (Copy)`, type }),
      });
      if (!res.ok) throw new Error("Duplicate failed");
      toast.success("Campaign duplicated");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns?id=${campaign.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Campaign deleted");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[var(--text-gold)]">Manage Campaign</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={18} />
          </button>
        </div>

        {/* Quick stats */}
        <div className="mb-5 grid grid-cols-3 gap-3 rounded-lg bg-[var(--bg-elevated)] p-3">
          <div><p className="text-xs text-[var(--text-muted)]">Contacts</p><p className="font-mono text-lg font-semibold text-[var(--text-primary)]">{campaign.contactCount}</p></div>
          <div><p className="text-xs text-[var(--text-muted)]">Sent</p><p className="font-mono text-lg font-semibold text-[var(--blue)]">{campaign.sentCount}</p></div>
          <div><p className="text-xs text-[var(--text-muted)]">Replies</p><p className="font-mono text-lg font-semibold text-[var(--green)]">{campaign.replyCount}</p></div>
        </div>

        {/* Action buttons */}
        <div className="mb-5 flex flex-wrap gap-2">
          {status === "draft" && (
            <Button size="sm" onClick={() => handleAction("launch", "launched")} disabled={loading}>
              <Play size={14} /> Launch
            </Button>
          )}
          {status === "in_progress" && (
            <>
              <Button size="sm" variant="secondary" onClick={() => handleAction("pause", "paused")} disabled={loading}>
                <Pause size={14} /> Pause
              </Button>
              <Button size="sm" onClick={() => handleAction("complete", "completed")} disabled={loading}>
                <Check size={14} /> Complete
              </Button>
            </>
          )}
          {status === "paused" && (
            <Button size="sm" onClick={() => handleAction("resume", "resumed")} disabled={loading}>
              <Play size={14} /> Resume
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={handleDuplicate} disabled={loading}>
            <Copy size={14} /> Duplicate
          </Button>
          <Button size="sm" variant="secondary" onClick={handleDelete} disabled={loading} className="ml-auto text-[var(--red)]">
            <Trash2 size={14} /> Delete
          </Button>
        </div>

        {/* Edit form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Name</label>
            <Input required value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Type</label>
              <select className={selectClass} value={type} onChange={e => setType(e.target.value)}>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="newsletter">Newsletter</option>
                <option value="blast">Blast</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Status</label>
              <select className={selectClass} value={status} onChange={e => setStatus(e.target.value)}>
                <option value="draft">Draft</option>
                <option value="in_progress">In Progress</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          {error && <p className="rounded-lg bg-[var(--red)]/10 px-3 py-2 text-xs text-[var(--red)]">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
