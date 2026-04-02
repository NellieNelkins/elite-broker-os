"use client";

import { useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";

type ImportStep = "upload" | "map" | "preview" | "result";

interface ImportResult {
  imported: number;
  skipped: number;
  total: number;
  errors: string[];
}

const contactFields = [
  { key: "name", label: "Name", required: true },
  { key: "phone", label: "Phone", required: true },
  { key: "email", label: "Email", required: false },
  { key: "type", label: "Type (Buyer/Seller/...)", required: false },
  { key: "stage", label: "Stage (Lead/Qualified/...)", required: false },
  { key: "priority", label: "Priority (HIGH/MEDIUM/LOW)", required: false },
  { key: "value", label: "Value (AED)", required: false },
  { key: "community", label: "Community", required: false },
  { key: "propType", label: "Property Type", required: false },
  { key: "bedrooms", label: "Bedrooms", required: false },
  { key: "nationality", label: "Nationality", required: false },
  { key: "source", label: "Source", required: false },
  { key: "notes", label: "Notes", required: false },
];

export default function ImportPage() {
  const [step, setStep] = useState<ImportStep>("upload");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const parseCSV = useCallback((text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return { headers: [], rows: [] };

    // Simple CSV parser (handles quoted fields)
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const hdrs = parseLine(lines[0]);
    const data = lines.slice(1).map((line) => {
      const vals = parseLine(line);
      const obj: Record<string, string> = {};
      hdrs.forEach((h, i) => {
        obj[h] = vals[i] || "";
      });
      return obj;
    });

    return { headers: hdrs, rows: data };
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const { headers: hdrs, rows: data } = parseCSV(text);
        setHeaders(hdrs);
        setRows(data);

        // Auto-map columns by name similarity
        const autoMap: Record<string, string> = {};
        for (const field of contactFields) {
          const match = hdrs.find(
            (h) =>
              h.toLowerCase().replace(/[_\s-]/g, "") ===
              field.key.toLowerCase().replace(/[_\s-]/g, "")
          ) || hdrs.find(
            (h) =>
              h.toLowerCase().includes(field.key.toLowerCase()) ||
              field.key.toLowerCase().includes(h.toLowerCase().replace(/[_\s-]/g, ""))
          );
          if (match) autoMap[field.key] = match;
        }
        setMapping(autoMap);
        setStep("map");
      };
      reader.readAsText(file);
    },
    [parseCSV]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".csv") || file.name.endsWith(".txt"))) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const runImport = async () => {
    if (!mapping.name || !mapping.phone) return;

    setImporting(true);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows, mapping, type: "contacts" }),
      });
      const data = await res.json();
      setResult(data);
      setStep("result");
    } catch {
      setResult({
        imported: 0,
        skipped: 0,
        total: rows.length,
        errors: ["Network error — please try again"],
      });
      setStep("result");
    }
    setImporting(false);
  };

  const reset = () => {
    setStep("upload");
    setFileName("");
    setHeaders([]);
    setRows([]);
    setMapping({});
    setResult(null);
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-gold)]">
          Import Data
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Import contacts from CSV or Excel exports
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
        {(["upload", "map", "preview", "result"] as ImportStep[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <ArrowRight size={12} />}
            <span
              className={
                step === s
                  ? "font-medium text-[var(--text-gold)]"
                  : "text-[var(--text-muted)]"
              }
            >
              {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
          </div>
        ))}
      </div>

      {/* Upload step */}
      {step === "upload" && (
        <Card>
          <CardContent className="py-8">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
                dragOver
                  ? "border-[var(--gold-500)] bg-[var(--gold-500)]/5"
                  : "border-[var(--border-default)]"
              }`}
            >
              <FileSpreadsheet
                size={48}
                className="mb-4 text-[var(--text-muted)] opacity-50"
              />
              <p className="text-sm text-[var(--text-primary)]">
                Drag & drop your CSV file here
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                or click to browse
              </p>
              <label className="mt-4 cursor-pointer">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-gradient-to-r from-[var(--gold-600)] to-[var(--gold-500)] px-4 py-2 text-sm font-medium text-[var(--bg-deepest)] transition-all hover:shadow-lg">
                  <Upload size={16} /> Choose File
                </span>
              </label>
              <p className="mt-4 text-[10px] text-[var(--text-muted)]">
                Supports CSV files. For Excel (.xlsx), save as CSV first.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map columns step */}
      {step === "map" && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>
              Map Columns — {fileName} ({rows.length} rows)
            </CardTitle>
            <Button variant="secondary" size="sm" onClick={reset}>
              <X size={14} /> Start Over
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-[var(--text-muted)]">
              Match your file columns to contact fields. Name and Phone are
              required.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {contactFields.map((field) => (
                <div
                  key={field.key}
                  className="flex items-center gap-3 rounded-lg bg-[var(--bg-elevated)] px-4 py-3"
                >
                  <div className="min-w-[140px]">
                    <span className="text-sm text-[var(--text-primary)]">
                      {field.label}
                    </span>
                    {field.required && (
                      <span className="ml-1 text-[var(--red)]">*</span>
                    )}
                  </div>
                  <ArrowRight size={12} className="text-[var(--text-muted)]" />
                  <select
                    value={mapping[field.key] || ""}
                    onChange={(e) =>
                      setMapping((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    className="flex-1 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-1.5 text-sm text-[var(--text-primary)] outline-none"
                  >
                    <option value="">— Skip —</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="text-xs text-[var(--text-muted)]">
                {mapping.name && mapping.phone ? (
                  <span className="text-[var(--green)]">
                    Required fields mapped
                  </span>
                ) : (
                  <span className="text-[var(--red)]">
                    Map Name and Phone to continue
                  </span>
                )}
              </div>
              <Button
                size="md"
                disabled={!mapping.name || !mapping.phone}
                onClick={() => setStep("preview")}
              >
                Preview <ArrowRight size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview step */}
      {step === "preview" && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Preview — First 5 rows</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStep("map")}
              >
                Back
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={reset}
              >
                <X size={14} /> Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-default)]">
                    {contactFields
                      .filter((f) => mapping[f.key])
                      .map((f) => (
                        <th
                          key={f.key}
                          className="px-3 py-2 text-left text-xs font-medium text-[var(--text-muted)]"
                        >
                          {f.label}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-[var(--border-default)]/50"
                    >
                      {contactFields
                        .filter((f) => mapping[f.key])
                        .map((f) => (
                          <td
                            key={f.key}
                            className="px-3 py-2 text-[var(--text-primary)]"
                          >
                            {row[mapping[f.key]] || "—"}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-[var(--text-muted)]">
                {rows.length} total rows will be imported. Duplicates (same
                phone) will be skipped.
              </p>
              <Button size="md" onClick={runImport} disabled={importing}>
                {importing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Importing...
                  </>
                ) : (
                  <>
                    <Upload size={16} /> Import {rows.length} Contacts
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result step */}
      {step === "result" && result && (
        <Card>
          <CardContent className="space-y-4 py-8 text-center">
            {result.imported > 0 ? (
              <CheckCircle2
                size={48}
                className="mx-auto text-[var(--green)]"
              />
            ) : (
              <AlertTriangle
                size={48}
                className="mx-auto text-[var(--amber)]"
              />
            )}

            <div>
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                Import Complete
              </p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {result.imported} imported, {result.skipped} skipped, out of{" "}
                {result.total} rows
              </p>
            </div>

            <div className="mx-auto flex max-w-xs justify-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-semibold text-[var(--green)]">
                  {result.imported}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Imported</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-[var(--amber)]">
                  {result.skipped}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Skipped</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="mx-auto max-w-md rounded-lg border border-[var(--red)]/20 bg-[var(--red)]/5 p-3 text-left text-xs text-[var(--red)]">
                {result.errors.map((err, i) => (
                  <p key={i}>{err}</p>
                ))}
              </div>
            )}

            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={reset}>
                Import More
              </Button>
              <Button
                onClick={() => (window.location.href = "/contacts")}
              >
                View Contacts
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
