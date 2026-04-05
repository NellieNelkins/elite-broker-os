"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, Trash2, AlertTriangle, FileImage, File as FileIcon } from "lucide-react";
import { toast } from "sonner";

interface Doc {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  mimeType: string | null;
  contactId: string | null;
  dealId: string | null;
  listingId: string | null;
  createdAt: Date | string;
}
interface Ref { id: string; name: string }

const TYPES = [
  { value: "passport", label: "Passport" },
  { value: "emirates_id", label: "Emirates ID" },
  { value: "title_deed", label: "Title Deed" },
  { value: "ejari", label: "Ejari" },
  { value: "mou", label: "MOU / Form F" },
  { value: "form_a", label: "Form A" },
  { value: "noc", label: "Developer NOC" },
  { value: "other", label: "Other" },
];

const labelClass = "text-xs font-medium text-[var(--text-secondary)]";
const selectClass = "flex h-9 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)] outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-500)]";

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function iconFor(mime: string | null) {
  if (mime?.startsWith("image/")) return FileImage;
  if (mime === "application/pdf") return FileText;
  return FileIcon;
}

function typeLabel(t: string): string {
  return TYPES.find(x => x.value === t)?.label || t;
}

export function DocumentsView({ docs, contacts, deals, listings, hasBlobConfig }: { docs: Doc[]; contacts: Ref[]; deals: Ref[]; listings: Ref[]; hasBlobConfig: boolean }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [type, setType] = useState("passport");
  const [contactId, setContactId] = useState("");
  const [dealId, setDealId] = useState("");
  const [listingId, setListingId] = useState("");
  const [filterType, setFilterType] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      if (contactId) formData.append("contactId", contactId);
      if (dealId) formData.append("dealId", dealId);
      if (listingId) formData.append("listingId", listingId);

      const res = await fetch("/api/documents", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      toast.success(`${file.name} uploaded`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Document deleted");
      router.refresh();
    } catch {
      toast.error("Delete failed");
    }
  }

  const filtered = filterType ? docs.filter(d => d.type === filterType) : docs;

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-gold)]">Document Vault</h1>
        <p className="text-sm text-[var(--text-muted)]">Passports, Emirates IDs, Title Deeds, MOUs, NOCs — stored encrypted on Vercel Blob</p>
      </div>

      {!hasBlobConfig && (
        <Card>
          <CardContent className="flex items-start gap-3 py-4">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[var(--amber)]" />
            <div className="text-xs">
              <p className="font-semibold text-[var(--text-primary)]">Vercel Blob not configured</p>
              <p className="text-[var(--text-muted)]">Add a Blob store in your Vercel project and set <code className="rounded bg-[var(--bg-elevated)] px-1">BLOB_READ_WRITE_TOKEN</code> in env. Metadata view works without it, but uploads will fail.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Upload Document</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div><label className={labelClass}>Type *</label>
              <select className={selectClass + " h-9 mt-1"} value={type} onChange={e => setType(e.target.value)}>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Link to Contact</label>
              <select className={selectClass + " h-9 mt-1"} value={contactId} onChange={e => setContactId(e.target.value)}>
                <option value="">—</option>{contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Link to Deal</label>
              <select className={selectClass + " h-9 mt-1"} value={dealId} onChange={e => setDealId(e.target.value)}>
                <option value="">—</option>{deals.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Link to Listing</label>
              <select className={selectClass + " h-9 mt-1"} value={listingId} onChange={e => setListingId(e.target.value)}>
                <option value="">—</option>{listings.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>
          <input ref={fileInput} type="file" onChange={handleUpload} accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.doc,.docx" className="hidden" />
          <Button onClick={() => fileInput.current?.click()} disabled={uploading || !hasBlobConfig}>
            <Upload size={14} /> {uploading ? "Uploading..." : "Choose File (max 10MB)"}
          </Button>
          <p className="text-xs text-[var(--text-muted)]">Accepted: PDF, JPG, PNG, WebP, HEIC, DOC, DOCX</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Documents ({filtered.length})</CardTitle>
            <select className={selectClass + " w-40 h-8"} value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">All types</option>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--text-muted)]">No documents yet.</p>
          ) : (
            <div className="space-y-2">
              {filtered.map(d => {
                const Icon = iconFor(d.mimeType);
                return (
                  <div key={d.id} className="flex items-center gap-3 rounded-lg border border-[var(--border-default)] p-3 hover:border-[var(--border-gold)]">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-elevated)]">
                      <Icon size={16} className="text-[var(--text-gold)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--text-primary)]">{d.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {fmtSize(d.size)} · {new Date(d.createdAt).toLocaleDateString("en-AE", { dateStyle: "medium" })}
                      </p>
                    </div>
                    <Badge variant="default">{typeLabel(d.type)}</Badge>
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]" title="Open / Download">
                      <Download size={14} />
                    </a>
                    <button onClick={() => handleDelete(d.id, d.name)} className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--red)]" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
