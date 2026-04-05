"use client";

import { useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Upload,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  CheckSquare,
  Square,
  Pencil,
  Save,
  MapPin,
  List,
} from "lucide-react";
import { saveSmartList } from "@/lib/smart-lists";
import { toast } from "sonner";

type ImportStep = "upload" | "map" | "preview" | "result";

interface ImportResult {
  imported: number;
  skipped: number;
  total: number;
  errors: string[];
  importedIds: string[];
}

const contactFields = [
  { key: "name", label: "Name", required: true },
  { key: "phone", label: "Phone", required: true },
  { key: "email", label: "Email", required: false },
  { key: "type", label: "Type (Buyer/Seller/...)", required: false },
  { key: "stage", label: "Stage (Lead/Qualified/...)", required: false },
  { key: "priority", label: "Priority (HIGH/MEDIUM/LOW)", required: false },
  { key: "value", label: "Value (AED)", required: false },
  { key: "community", label: "Community / Area", required: false },
  { key: "property", label: "Property / Building", required: false },
  { key: "propType", label: "Property Type", required: false },
  { key: "bedrooms", label: "Bedrooms", required: false },
  { key: "nationality", label: "Nationality", required: false },
  { key: "source", label: "Source", required: false },
  { key: "notes", label: "Notes", required: false },
  { key: "location", label: "Location / Address", required: false },
  { key: "city", label: "City", required: false },
  { key: "country", label: "Country", required: false },
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
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [showListName, setShowListName] = useState(false);
  const [listName, setListName] = useState("");

  const parseCSV = useCallback((text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return { headers: [] as string[], rows: [] as Record<string, string>[] };

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

  const autoMap = useCallback((hdrs: string[]) => {
    const map: Record<string, string> = {};
    const aliases: Record<string, string[]> = {
      name: ["name", "fullname", "full_name", "contactname", "contact"],
      phone: ["phone", "mobile", "cell", "telephone", "tel", "phonenumber", "phone1"],
      email: ["email", "mail", "emailaddress"],
      type: ["type", "contacttype", "category"],
      stage: ["stage", "status", "dealstage"],
      priority: ["priority", "urgency", "level"],
      value: ["value", "budget", "amount", "dealvalue", "price"],
      community: ["community", "area", "district", "zone", "neighborhood", "neighbourhood"],
      property: ["property", "building", "project", "tower", "propertyname"],
      propType: ["proptype", "propertytype", "unittype"],
      bedrooms: ["bedrooms", "beds", "br", "bedroom"],
      nationality: ["nationality", "nation", "country_of_origin"],
      source: ["source", "leadsource", "origin", "channel"],
      notes: ["notes", "comments", "remarks", "description"],
      location: ["location", "address", "fulladdress", "streetaddress", "street"],
      city: ["city", "town", "emirate"],
      country: ["country", "countryname"],
    };

    for (const field of contactFields) {
      const fieldAliases = aliases[field.key] || [field.key];
      const match = hdrs.find((h) => {
        const normalized = h.toLowerCase().replace(/[_\s\-.]/g, "");
        return fieldAliases.some((a) => normalized === a || normalized.includes(a));
      });
      if (match) map[field.key] = match;
    }
    return map;
  }, []);

  const processFileData = useCallback(
    (hdrs: string[], data: Record<string, string>[]) => {
      setHeaders(hdrs);
      setRows(data);
      setMapping(autoMap(hdrs));
      // Select all rows by default
      setSelected(new Set(data.map((_, i) => i)));
      setStep("map");
    },
    [autoMap]
  );

  const handleFile = useCallback(
    async (file: File) => {
      setFileName(file.name);
      const ext = file.name.split(".").pop()?.toLowerCase();

      if (ext === "xlsx" || ext === "xls") {
        // Dynamic import xlsx to keep bundle small
        const XLSX = await import("xlsx");
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
          defval: "",
          raw: false,
        });

        if (jsonData.length === 0) return;
        const hdrs = Object.keys(jsonData[0]);
        processFileData(hdrs, jsonData);
      } else {
        // CSV / TXT
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const { headers: hdrs, rows: data } = parseCSV(text);
          processFileData(hdrs, data);
        };
        reader.readAsText(file);
      }
    },
    [parseCSV, processFileData]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (
        file &&
        (file.name.endsWith(".csv") ||
          file.name.endsWith(".txt") ||
          file.name.endsWith(".xlsx") ||
          file.name.endsWith(".xls"))
      ) {
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

  // Select all / deselect all
  const toggleSelectAll = () => {
    if (selected.size === rows.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((_, i) => i)));
    }
  };

  const toggleSelect = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Inline editing
  const startEdit = (index: number) => {
    const row = rows[index];
    const vals: Record<string, string> = {};
    for (const field of contactFields) {
      if (mapping[field.key]) {
        vals[field.key] = row[mapping[field.key]] || "";
      }
    }
    setEditValues(vals);
    setEditingRow(index);
  };

  const saveEdit = () => {
    if (editingRow === null) return;
    setRows((prev) => {
      const updated = [...prev];
      const row = { ...updated[editingRow] };
      for (const field of contactFields) {
        if (mapping[field.key] && editValues[field.key] !== undefined) {
          row[mapping[field.key]] = editValues[field.key];
        }
      }
      updated[editingRow] = row;
      return updated;
    });
    setEditingRow(null);
    setEditValues({});
  };

  const cancelEdit = () => {
    setEditingRow(null);
    setEditValues({});
  };

  const runImport = async () => {
    if (!mapping.name || !mapping.phone) return;

    // Only import selected rows
    const selectedRows = rows.filter((_, i) => selected.has(i));
    if (selectedRows.length === 0) return;

    setImporting(true);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: selectedRows, mapping, type: "contacts" }),
      });
      const data = await res.json();
      setResult(data);
      setStep("result");
    } catch {
      setResult({
        imported: 0,
        skipped: 0,
        total: selectedRows.length,
        errors: ["Network error — please try again"],
        importedIds: [],
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
    setSelected(new Set());
    setEditingRow(null);
    setEditValues({});
  };

  const handleSaveSmartList = () => {
    if (!listName.trim() || !result?.importedIds?.length) return;
    saveSmartList({ name: listName.trim(), contactIds: result.importedIds });
    toast.success(`Smart list "${listName.trim()}" created with ${result.importedIds.length} contacts`);
    setShowListName(false);
    setListName("");
  };

  // Get mapped fields that have a column assigned (for preview table)
  const mappedFields = contactFields.filter((f) => mapping[f.key]);

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-gold)]">
          Import Data
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Import contacts from CSV or Excel files
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
        {(["upload", "map", "preview", "result"] as ImportStep[]).map(
          (s, i) => (
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
          )
        )}
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
                Drag & drop your file here
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Supports CSV and Excel (.xlsx) files
              </p>
              <label className="mt-4 cursor-pointer">
                <input
                  type="file"
                  accept=".csv,.txt,.xlsx,.xls"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-gradient-to-r from-[var(--gold-600)] to-[var(--gold-500)] px-4 py-2 text-sm font-medium text-[var(--bg-deepest)] transition-all hover:shadow-lg">
                  <Upload size={16} /> Choose File
                </span>
              </label>
              <div className="mt-4 flex items-center gap-4 text-[10px] text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <FileSpreadsheet size={10} /> .csv
                </span>
                <span className="flex items-center gap-1">
                  <FileSpreadsheet size={10} /> .xlsx
                </span>
                <span className="flex items-center gap-1">
                  <FileSpreadsheet size={10} /> .xls
                </span>
              </div>
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
              required. Location fields map to your contact&apos;s area info.
            </p>

            {/* Contact fields */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Contact Info
              </p>
              <div className="grid grid-cols-2 gap-3">
                {contactFields
                  .filter((f) => !["location", "city", "country"].includes(f.key))
                  .map((field) => (
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
                      <ArrowRight
                        size={12}
                        className="text-[var(--text-muted)]"
                      />
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
            </div>

            {/* Location fields */}
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                <MapPin size={12} /> Location
              </p>
              <div className="grid grid-cols-2 gap-3">
                {contactFields
                  .filter((f) => ["location", "city", "country"].includes(f.key))
                  .map((field) => (
                    <div
                      key={field.key}
                      className="flex items-center gap-3 rounded-lg bg-[var(--bg-elevated)] px-4 py-3"
                    >
                      <div className="min-w-[140px]">
                        <span className="text-sm text-[var(--text-primary)]">
                          {field.label}
                        </span>
                      </div>
                      <ArrowRight
                        size={12}
                        className="text-[var(--text-muted)]"
                      />
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
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="text-xs text-[var(--text-muted)]">
                {mapping.name && mapping.phone ? (
                  <span className="text-[var(--green)]">
                    Required fields mapped &middot;{" "}
                    {Object.values(mapping).filter(Boolean).length} fields total
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
            <div className="flex items-center gap-3">
              <CardTitle>Preview — {rows.length} rows</CardTitle>
              <Badge variant="green">{selected.size} selected</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStep("map")}
              >
                Back
              </Button>
              <Button variant="secondary" size="sm" onClick={reset}>
                <X size={14} /> Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Select All bar */}
            <div className="mb-3 flex items-center justify-between rounded-lg bg-[var(--bg-elevated)] px-4 py-2">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                {selected.size === rows.length ? (
                  <CheckSquare
                    size={16}
                    className="text-[var(--text-gold)]"
                  />
                ) : (
                  <Square size={16} />
                )}
                {selected.size === rows.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
              <span className="text-xs text-[var(--text-muted)]">
                {selected.size} of {rows.length} rows selected for import
              </span>
            </div>

            <div className="max-h-[500px] overflow-auto rounded-lg border border-[var(--border-default)]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-[var(--bg-surface)]">
                  <tr className="border-b border-[var(--border-default)]">
                    <th className="w-10 px-3 py-2 text-left text-xs font-medium text-[var(--text-muted)]">
                      #
                    </th>
                    {mappedFields.map((f) => (
                      <th
                        key={f.key}
                        className="px-3 py-2 text-left text-xs font-medium text-[var(--text-muted)]"
                      >
                        <span className="flex items-center gap-1">
                          {["location", "city", "country"].includes(f.key) && (
                            <MapPin size={10} />
                          )}
                          {f.label}
                        </span>
                      </th>
                    ))}
                    <th className="w-20 px-3 py-2 text-right text-xs font-medium text-[var(--text-muted)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const isSelected = selected.has(i);
                    const isEditing = editingRow === i;

                    return (
                      <tr
                        key={i}
                        className={`border-b border-[var(--border-default)]/50 transition-colors ${
                          isSelected
                            ? "bg-[var(--bg-surface)]"
                            : "bg-[var(--bg-deep)] opacity-50"
                        } ${isEditing ? "ring-1 ring-[var(--gold-500)]" : ""}`}
                      >
                        <td className="px-3 py-2">
                          <button
                            onClick={() => toggleSelect(i)}
                            className="text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                          >
                            {isSelected ? (
                              <CheckSquare
                                size={14}
                                className="text-[var(--text-gold)]"
                              />
                            ) : (
                              <Square size={14} />
                            )}
                          </button>
                        </td>
                        {mappedFields.map((f) => (
                          <td
                            key={f.key}
                            className="px-3 py-2 text-[var(--text-primary)]"
                          >
                            {isEditing ? (
                              <Input
                                value={editValues[f.key] || ""}
                                onChange={(e) =>
                                  setEditValues((prev) => ({
                                    ...prev,
                                    [f.key]: e.target.value,
                                  }))
                                }
                                className="h-7 text-xs"
                              />
                            ) : (
                              <span className="text-xs">
                                {row[mapping[f.key]] || "—"}
                              </span>
                            )}
                          </td>
                        ))}
                        <td className="px-3 py-2 text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={saveEdit}
                              >
                                <Save size={12} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={cancelEdit}
                              >
                                <X size={12} />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(i)}
                            >
                              <Pencil size={12} />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-[var(--text-muted)]">
                {selected.size} rows selected for import. Duplicates (same
                phone) will be skipped.
              </p>
              <Button
                size="md"
                onClick={runImport}
                disabled={importing || selected.size === 0}
              >
                {importing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Importing...
                  </>
                ) : (
                  <>
                    <Upload size={16} /> Import {selected.size} Contacts
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

            {result.imported > 0 && (
              <div className="flex items-center justify-center gap-2">
                {!showListName ? (
                  <Button variant="secondary" size="sm" onClick={() => setShowListName(true)}>
                    <List size={14} /> Save as Smart List
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input placeholder="List name" value={listName} onChange={(e) => setListName(e.target.value)} className="h-8 w-48" />
                    <Button size="sm" onClick={handleSaveSmartList}>Save</Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
