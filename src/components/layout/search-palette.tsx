"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, TrendingUp, Building2, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SearchResult {
  contacts: Array<{
    id: string;
    name: string;
    phone: string;
    type: string;
    stage: string;
    priority: string;
    community: string | null;
  }>;
  deals: Array<{
    id: string;
    name: string;
    stage: string;
    value: number;
    commission: number;
    community: string | null;
  }>;
  listings: Array<{
    id: string;
    name: string;
    type: string;
    price: number;
    community: string | null;
    status: string;
  }>;
}

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults(null);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch {
        setResults(null);
      }
      setLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const navigate = useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router]
  );

  const totalResults =
    (results?.contacts.length || 0) +
    (results?.deals.length || 0) +
    (results?.listings.length || 0);

  return (
    <>
      {/* Trigger button in header */}
      <button
        onClick={() => setOpen(true)}
        className="relative flex h-8 w-72 items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--bg-surface)] px-3 text-xs text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)]"
      >
        <Search size={14} />
        <span>Search contacts, deals, listings...</span>
        <kbd className="ml-auto rounded border border-[var(--border-default)] bg-[var(--bg-elevated)] px-1.5 py-0.5 font-mono text-[10px]">
          ⌘K
        </kbd>
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[15vh]"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-deep)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-[var(--border-default)] px-4">
              <Search size={16} className="text-[var(--text-muted)]" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search contacts, deals, listings..."
                className="flex-1 bg-transparent py-4 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-[400px] overflow-y-auto">
              {loading && (
                <div className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">
                  Searching...
                </div>
              )}

              {!loading && query.length >= 2 && totalResults === 0 && (
                <div className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">
                  No results for &quot;{query}&quot;
                </div>
              )}

              {!loading && results && totalResults > 0 && (
                <div className="py-2">
                  {/* Contacts */}
                  {results.contacts.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                        <Users size={12} /> Contacts ({results.contacts.length})
                      </div>
                      {results.contacts.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => navigate("/contacts")}
                          className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-[var(--bg-hover)]"
                        >
                          <div>
                            <p className="text-sm text-[var(--text-primary)]">
                              {c.name}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                              {c.phone}
                              {c.community && ` · ${c.community}`}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <span className="rounded bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
                              {c.type}
                            </span>
                            <span className="rounded bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
                              {c.stage}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Deals */}
                  {results.deals.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                        <TrendingUp size={12} /> Deals ({results.deals.length})
                      </div>
                      {results.deals.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => navigate("/pipeline")}
                          className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-[var(--bg-hover)]"
                        >
                          <div>
                            <p className="text-sm text-[var(--text-primary)]">
                              {d.name}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                              {formatCurrency(d.value)}
                              {d.community && ` · ${d.community}`}
                            </p>
                          </div>
                          <span className="rounded bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
                            {d.stage}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Listings */}
                  {results.listings.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                        <Building2 size={12} /> Listings (
                        {results.listings.length})
                      </div>
                      {results.listings.map((l) => (
                        <button
                          key={l.id}
                          onClick={() => navigate("/listings")}
                          className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-[var(--bg-hover)]"
                        >
                          <div>
                            <p className="text-sm text-[var(--text-primary)]">
                              {l.name}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                              {formatCurrency(l.price)} · {l.type}
                              {l.community && ` · ${l.community}`}
                            </p>
                          </div>
                          <span className="rounded bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
                            {l.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Empty state */}
              {!loading && query.length < 2 && (
                <div className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">
                  Type 2+ characters to search
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[var(--border-default)] px-4 py-2 text-[10px] text-[var(--text-muted)]">
              <span>
                <kbd className="rounded border border-[var(--border-default)] px-1">↑↓</kbd>{" "}
                navigate{" "}
                <kbd className="rounded border border-[var(--border-default)] px-1">↵</kbd>{" "}
                select{" "}
                <kbd className="rounded border border-[var(--border-default)] px-1">esc</kbd>{" "}
                close
              </span>
              {totalResults > 0 && <span>{totalResults} results</span>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
