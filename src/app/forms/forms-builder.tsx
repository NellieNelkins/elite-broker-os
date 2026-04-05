"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Download, Copy, Printer } from "lucide-react";
import { toast } from "sonner";
import { renderForm, type FormType, type FormData } from "@/lib/rera-forms";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  nationality: string | null;
  type: string;
  community: string | null;
  value: number;
}
interface Listing {
  id: string;
  name: string;
  type: string;
  community: string | null;
  bedrooms: string | null;
  price: number;
  address: string | null;
}

interface Props {
  contacts: Contact[];
  listings: Listing[];
  userName: string;
  userEmail: string;
}

const FORMS: { type: FormType; title: string; desc: string }[] = [
  { type: "A", title: "Form A", desc: "Listing Agreement (Seller ↔ Broker)" },
  { type: "B", title: "Form B", desc: "Buyer Agreement (Buyer ↔ Broker)" },
  { type: "F", title: "Form F", desc: "Contract F / MOU (Buyer ↔ Seller)" },
  { type: "I", title: "Form I", desc: "Unilateral Notification (Exclusive)" },
  { type: "U", title: "Form U", desc: "Termination Notice" },
];

const labelClass = "text-xs font-medium text-[var(--text-secondary)]";
const selectClass =
  "flex h-9 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1 text-sm text-[var(--text-primary)] outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-500)]";

export function FormsBuilder({ contacts, listings, userName, userEmail }: Props) {
  const [activeForm, setActiveForm] = useState<FormType>("F");
  const [data, setData] = useState<FormData>({
    brokerName: userName,
    brokerEmail: userEmail,
    commissionPct: 2,
    listingPeriod: "3 months",
  });
  const [sellerId, setSellerId] = useState("");
  const [buyerId, setBuyerId] = useState("");
  const [listingId, setListingId] = useState("");

  // Auto-populate from selected contact/listing
  function selectSeller(id: string) {
    setSellerId(id);
    const c = contacts.find(c => c.id === id);
    if (c) setData(d => ({ ...d, sellerName: c.name, sellerPhone: c.phone, sellerEmail: c.email || "", sellerNationality: c.nationality || "" }));
  }
  function selectBuyer(id: string) {
    setBuyerId(id);
    const c = contacts.find(c => c.id === id);
    if (c) setData(d => ({ ...d, buyerName: c.name, buyerPhone: c.phone, buyerEmail: c.email || "", buyerNationality: c.nationality || "" }));
  }
  function selectListing(id: string) {
    setListingId(id);
    const l = listings.find(l => l.id === id);
    if (l) setData(d => ({
      ...d,
      propertyName: l.name,
      propertyType: l.type,
      community: l.community || "",
      bedrooms: l.bedrooms || "",
      propertyAddress: l.address || "",
      salePrice: l.price,
      commissionAmount: (d.commissionPct ? (l.price * d.commissionPct) / 100 : 0),
    }));
  }

  const rendered = useMemo(() => renderForm(activeForm, data), [activeForm, data]);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData(d => {
      const next = { ...d, [key]: value };
      if (key === "salePrice" || key === "commissionPct") {
        const price = Number(key === "salePrice" ? value : next.salePrice) || 0;
        const pct = Number(key === "commissionPct" ? value : next.commissionPct) || 0;
        next.commissionAmount = (price * pct) / 100;
      }
      return next;
    });
  }

  const sellers = contacts.filter(c => c.type === "Seller" || c.type === "Landlord");
  const buyers = contacts.filter(c => c.type === "Buyer" || c.type === "Tenant" || c.type === "Investor");

  async function copyForm() {
    await navigator.clipboard.writeText(rendered.body);
    toast.success("Form copied to clipboard");
  }

  function downloadForm() {
    const blob = new Blob([rendered.body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RERA-Form-${activeForm}-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Form downloaded");
  }

  function printForm() {
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    w.document.write(`<html><head><title>${rendered.title}</title><style>
      body { font-family: 'Courier New', monospace; font-size: 12px; padding: 40px; white-space: pre-wrap; }
      @media print { body { padding: 20px; } }
    </style></head><body>${rendered.body.replace(/</g, "&lt;")}</body></html>`);
    w.document.close();
    w.print();
  }

  const showSeller = activeForm === "A" || activeForm === "F" || activeForm === "I" || activeForm === "U";
  const showBuyer = activeForm === "B" || activeForm === "F";
  const showListing = activeForm !== "U";

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-gold)]">RERA Forms Generator</h1>
        <p className="text-sm text-[var(--text-muted)]">Auto-fill Dubai standard broker forms from your CRM data</p>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {FORMS.map(f => (
          <button
            key={f.type}
            onClick={() => setActiveForm(f.type)}
            className={`rounded-lg border px-4 py-3 text-left transition-colors min-w-[180px] ${activeForm === f.type ? "border-[var(--border-gold)] bg-[var(--bg-elevated)]" : "border-[var(--border-default)] hover:bg-[var(--bg-elevated)]"}`}
          >
            <p className="text-sm font-semibold text-[var(--text-gold)]">{f.title}</p>
            <p className="text-xs text-[var(--text-muted)]">{f.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Form inputs */}
        <Card>
          <CardHeader><CardTitle>Form Data</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Broker */}
            <div>
              <p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">Broker / Agency</p>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelClass}>Agency Name</label><Input value={data.brokerAgency || ""} onChange={e => update("brokerAgency", e.target.value)} /></div>
                <div><label className={labelClass}>ORN</label><Input value={data.brokerAgencyLicense || ""} onChange={e => update("brokerAgencyLicense", e.target.value)} /></div>
                <div><label className={labelClass}>Broker Name</label><Input value={data.brokerName || ""} onChange={e => update("brokerName", e.target.value)} /></div>
                <div><label className={labelClass}>BRN</label><Input value={data.brokerId || ""} onChange={e => update("brokerId", e.target.value)} /></div>
                <div><label className={labelClass}>Phone</label><Input value={data.brokerPhone || ""} onChange={e => update("brokerPhone", e.target.value)} /></div>
                <div><label className={labelClass}>Email</label><Input value={data.brokerEmail || ""} onChange={e => update("brokerEmail", e.target.value)} /></div>
              </div>
            </div>

            {showSeller && (
              <div>
                <p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">Seller / Owner</p>
                <select className={selectClass + " mb-2"} value={sellerId} onChange={e => selectSeller(e.target.value)}>
                  <option value="">Choose from contacts...</option>
                  {sellers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={labelClass}>Name</label><Input value={data.sellerName || ""} onChange={e => update("sellerName", e.target.value)} /></div>
                  <div><label className={labelClass}>Nationality</label><Input value={data.sellerNationality || ""} onChange={e => update("sellerNationality", e.target.value)} /></div>
                  <div><label className={labelClass}>Passport</label><Input value={data.sellerPassport || ""} onChange={e => update("sellerPassport", e.target.value)} /></div>
                  <div><label className={labelClass}>Emirates ID</label><Input value={data.sellerEmiratesId || ""} onChange={e => update("sellerEmiratesId", e.target.value)} /></div>
                </div>
              </div>
            )}

            {showBuyer && (
              <div>
                <p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">Buyer</p>
                <select className={selectClass + " mb-2"} value={buyerId} onChange={e => selectBuyer(e.target.value)}>
                  <option value="">Choose from contacts...</option>
                  {buyers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={labelClass}>Name</label><Input value={data.buyerName || ""} onChange={e => update("buyerName", e.target.value)} /></div>
                  <div><label className={labelClass}>Nationality</label><Input value={data.buyerNationality || ""} onChange={e => update("buyerNationality", e.target.value)} /></div>
                  <div><label className={labelClass}>Passport</label><Input value={data.buyerPassport || ""} onChange={e => update("buyerPassport", e.target.value)} /></div>
                  <div><label className={labelClass}>Emirates ID</label><Input value={data.buyerEmiratesId || ""} onChange={e => update("buyerEmiratesId", e.target.value)} /></div>
                </div>
              </div>
            )}

            {showListing && (
              <div>
                <p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">Property</p>
                <select className={selectClass + " mb-2"} value={listingId} onChange={e => selectListing(e.target.value)}>
                  <option value="">Choose from listings...</option>
                  {listings.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={labelClass}>Property Name</label><Input value={data.propertyName || ""} onChange={e => update("propertyName", e.target.value)} /></div>
                  <div><label className={labelClass}>Type</label><Input value={data.propertyType || ""} onChange={e => update("propertyType", e.target.value)} /></div>
                  <div><label className={labelClass}>Community</label><Input value={data.community || ""} onChange={e => update("community", e.target.value)} /></div>
                  <div><label className={labelClass}>Bedrooms</label><Input value={data.bedrooms || ""} onChange={e => update("bedrooms", e.target.value)} /></div>
                  <div><label className={labelClass}>Size (sqft)</label><Input value={data.size || ""} onChange={e => update("size", e.target.value)} /></div>
                  <div><label className={labelClass}>Title Deed No</label><Input value={data.titleDeedNumber || ""} onChange={e => update("titleDeedNumber", e.target.value)} /></div>
                  <div><label className={labelClass}>Makani No</label><Input value={data.makaniNumber || ""} onChange={e => update("makaniNumber", e.target.value)} /></div>
                  <div><label className={labelClass}>DLD Permit No</label><Input value={data.dldPermitNumber || ""} onChange={e => update("dldPermitNumber", e.target.value)} /></div>
                </div>
                <div className="mt-2"><label className={labelClass}>Address</label><Input value={data.propertyAddress || ""} onChange={e => update("propertyAddress", e.target.value)} /></div>
              </div>
            )}

            {activeForm !== "U" && (
              <div>
                <p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">Transaction</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={labelClass}>Sale Price (AED)</label><Input type="number" value={data.salePrice || ""} onChange={e => update("salePrice", Number(e.target.value))} /></div>
                  <div><label className={labelClass}>Commission %</label><Input type="number" step="0.1" value={data.commissionPct || ""} onChange={e => update("commissionPct", Number(e.target.value))} /></div>
                  {activeForm === "F" && <div><label className={labelClass}>Deposit (AED)</label><Input type="number" value={data.depositAmount || ""} onChange={e => update("depositAmount", Number(e.target.value))} /></div>}
                  {activeForm === "F" && <div><label className={labelClass}>Target Transfer Date</label><Input type="date" value={data.completionDate || ""} onChange={e => update("completionDate", e.target.value)} /></div>}
                  {(activeForm === "A" || activeForm === "I") && <div><label className={labelClass}>Listing Period</label><Input value={data.listingPeriod || ""} onChange={e => update("listingPeriod", e.target.value)} /></div>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><FileText size={16} className="text-[var(--text-gold)]" />{rendered.title}</CardTitle>
              <div className="flex gap-1">
                <Button size="sm" variant="secondary" onClick={copyForm}><Copy size={13} /></Button>
                <Button size="sm" variant="secondary" onClick={printForm}><Printer size={13} /></Button>
                <Button size="sm" variant="primary" onClick={downloadForm}><Download size={13} /> Export</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="max-h-[700px] overflow-auto whitespace-pre-wrap rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4 font-mono text-[11px] leading-relaxed text-[var(--text-primary)]">{rendered.body}</pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
