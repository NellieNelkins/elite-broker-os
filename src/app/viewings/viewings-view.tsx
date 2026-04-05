"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MapPin, Clock, CheckCircle2, XCircle, Star, Edit } from "lucide-react";
import { toast } from "sonner";

interface Viewing {
  id: string;
  scheduledAt: Date | string;
  duration: number;
  status: string;
  location: string | null;
  notes: string | null;
  feedback: string | null;
  rating: number | null;
  contactId: string | null;
  listingId: string | null;
}
interface Contact { id: string; name: string; phone: string; }
interface Listing { id: string; name: string; community: string | null; price: number; }

const labelClass = "text-xs font-medium text-[var(--text-secondary)]";
const selectClass = "flex h-9 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1 text-sm text-[var(--text-primary)] outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-500)]";

function statusVariant(s: string): "green" | "amber" | "default" {
  return s === "completed" ? "green" : s === "scheduled" ? "amber" : "default";
}

export function ViewingsView({ viewings, contacts, listings }: { viewings: Viewing[]; contacts: Contact[]; listings: Listing[] }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Viewing | null>(null);

  const upcoming = viewings.filter(v => v.status === "scheduled" && new Date(v.scheduledAt) >= new Date());
  const today = upcoming.filter(v => {
    const d = new Date(v.scheduledAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const past = viewings.filter(v => v.status !== "scheduled" || new Date(v.scheduledAt) < new Date());

  function contactName(id: string | null) {
    return contacts.find(c => c.id === id)?.name || "—";
  }
  function listingName(id: string | null) {
    const l = listings.find(l => l.id === id);
    return l ? l.name : "—";
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-gold)]">Viewings</h1>
          <p className="text-sm text-[var(--text-muted)]">Schedule property viewings, capture feedback, track outcomes</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus size={16} /> Schedule Viewing</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-4"><p className="text-xs text-[var(--text-muted)]">Today</p><p className="mt-1 font-mono text-2xl font-semibold text-[var(--text-gold)]">{today.length}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-[var(--text-muted)]">Upcoming</p><p className="mt-1 font-mono text-2xl font-semibold text-[var(--blue)]">{upcoming.length}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-[var(--text-muted)]">Completed</p><p className="mt-1 font-mono text-2xl font-semibold text-[var(--green)]">{viewings.filter(v => v.status === "completed").length}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-[var(--text-muted)]">Avg Rating</p><p className="mt-1 font-mono text-2xl font-semibold text-[var(--amber)]">{(() => {
          const rated = viewings.filter(v => v.rating);
          return rated.length ? (rated.reduce((s, v) => s + (v.rating || 0), 0) / rated.length).toFixed(1) : "—";
        })()}</p></CardContent></Card>
      </div>

      {upcoming.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Upcoming</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcoming.map(v => (
                <div key={v.id} className="flex items-center gap-4 rounded-lg border border-[var(--border-default)] p-3 hover:border-[var(--border-gold)]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-elevated)]">
                    <Calendar size={16} className="text-[var(--text-gold)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{contactName(v.contactId)} → {listingName(v.listingId)}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      <Clock size={11} className="inline mr-1" />{new Date(v.scheduledAt).toLocaleString("en-AE", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} ({v.duration}min)
                      {v.location && <><MapPin size={11} className="inline ml-2 mr-1" />{v.location}</>}
                    </p>
                  </div>
                  <Badge variant={statusVariant(v.status)}>{v.status}</Badge>
                  <Button size="sm" variant="secondary" onClick={() => setEditing(v)}><Edit size={13} /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {past.length > 0 && (
        <Card>
          <CardHeader><CardTitle>History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {past.slice(0, 20).map(v => (
                <div key={v.id} className="flex items-center gap-4 rounded-lg border border-[var(--border-subtle)] p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-elevated)]">
                    {v.status === "completed" ? <CheckCircle2 size={14} className="text-[var(--green)]" /> : <XCircle size={14} className="text-[var(--text-muted)]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)]">{contactName(v.contactId)} → {listingName(v.listingId)}</p>
                    <p className="text-xs text-[var(--text-muted)]">{new Date(v.scheduledAt).toLocaleDateString("en-AE", { month: "short", day: "numeric", year: "numeric" })}{v.feedback ? ` · ${v.feedback.slice(0, 60)}${v.feedback.length > 60 ? "…" : ""}` : ""}</p>
                  </div>
                  {v.rating && (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < (v.rating || 0) ? "fill-[var(--amber)] text-[var(--amber)]" : "text-[var(--bg-elevated)]"} />
                      ))}
                    </div>
                  )}
                  <Badge variant={statusVariant(v.status)}>{v.status}</Badge>
                  <Button size="sm" variant="secondary" onClick={() => setEditing(v)}><Edit size={13} /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {viewings.length === 0 && (
        <Card><CardContent className="py-12 text-center text-sm text-[var(--text-muted)]">No viewings yet. Click Schedule Viewing to add your first.</CardContent></Card>
      )}

      {showCreate && <ViewingModal mode="create" contacts={contacts} listings={listings} onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); router.refresh(); }} />}
      {editing && <ViewingModal mode="edit" viewing={editing} contacts={contacts} listings={listings} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); router.refresh(); }} />}
    </div>
  );
}

function ViewingModal({ mode, viewing, contacts, listings, onClose, onSaved }: {
  mode: "create" | "edit";
  viewing?: Viewing;
  contacts: Contact[];
  listings: Listing[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const now = new Date();
  const defaultDate = viewing ? new Date(viewing.scheduledAt) : new Date(now.getTime() + 3600000);
  const [scheduledAt, setScheduledAt] = useState(defaultDate.toISOString().slice(0, 16));
  const [duration, setDuration] = useState(viewing?.duration || 30);
  const [contactId, setContactId] = useState(viewing?.contactId || "");
  const [listingId, setListingId] = useState(viewing?.listingId || "");
  const [location, setLocation] = useState(viewing?.location || "");
  const [notes, setNotes] = useState(viewing?.notes || "");
  const [status, setStatus] = useState(viewing?.status || "scheduled");
  const [feedback, setFeedback] = useState(viewing?.feedback || "");
  const [rating, setRating] = useState(viewing?.rating || 0);

  async function save() {
    setLoading(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        scheduledAt: new Date(scheduledAt).toISOString(),
        duration,
        contactId: contactId || null,
        listingId: listingId || null,
        location,
        notes,
        status,
        feedback,
        rating: rating || null,
      };
      if (mode === "edit" && viewing) payload.id = viewing.id;
      const res = await fetch("/api/viewings", {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || "Failed"); }
      toast.success(mode === "create" ? "Viewing scheduled" : "Viewing updated");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!viewing || !confirm("Delete this viewing?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/viewings?id=${viewing.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Viewing deleted");
      onSaved();
    } catch {
      setError("Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-lg)]" onClick={e => e.stopPropagation()}>
        <h2 className="mb-5 text-lg font-semibold text-[var(--text-gold)]">{mode === "create" ? "Schedule Viewing" : "Edit Viewing"}</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Date & Time</label><Input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} /></div>
            <div><label className={labelClass}>Duration (min)</label><Input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} /></div>
          </div>
          <div><label className={labelClass}>Contact</label><select className={selectClass} value={contactId} onChange={e => setContactId(e.target.value)}><option value="">—</option>{contacts.map(c => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}</select></div>
          <div><label className={labelClass}>Listing</label><select className={selectClass} value={listingId} onChange={e => setListingId(e.target.value)}><option value="">—</option>{listings.map(l => <option key={l.id} value={l.id}>{l.name}{l.community ? ` · ${l.community}` : ""}</option>)}</select></div>
          <div><label className={labelClass}>Location / Meeting Point</label><Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Community gate, lobby…" /></div>
          <div><label className={labelClass}>Notes</label><textarea className="flex w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-500)] min-h-[60px] resize-none" value={notes} onChange={e => setNotes(e.target.value)} /></div>
          <div><label className={labelClass}>Status</label><select className={selectClass} value={status} onChange={e => setStatus(e.target.value)}><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="no_show">No Show</option></select></div>
          {(status === "completed" || mode === "edit") && (
            <>
              <div><label className={labelClass}>Feedback</label><textarea className="flex w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-500)] min-h-[60px] resize-none" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="What did the buyer say? Concerns? Next steps?" /></div>
              <div>
                <label className={labelClass}>Interest Rating (1-5)</label>
                <div className="mt-1 flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" onClick={() => setRating(n === rating ? 0 : n)} className="transition-transform hover:scale-110">
                      <Star size={20} className={n <= rating ? "fill-[var(--amber)] text-[var(--amber)]" : "text-[var(--bg-elevated)]"} />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          {error && <p className="rounded-lg bg-[var(--red)]/10 px-3 py-2 text-xs text-[var(--red)]">{error}</p>}
        </div>
        <div className="mt-6 flex items-center justify-between">
          {mode === "edit" && <Button variant="secondary" onClick={handleDelete} disabled={loading} className="text-[var(--red)]">Delete</Button>}
          <div className="ml-auto flex gap-3">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={save} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
