"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Phone,
  MessageSquare,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ContactRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: string;
  stage: string;
  priority: string;
  value: number;
  community: string;
  whatsappConnected: boolean;
  days: number;
}

const priorityVariant = (p: string) =>
  p === "HIGH" ? "red" as const : p === "MEDIUM" ? "amber" as const : "green" as const;

const stageVariant = (s: string) => {
  const map: Record<string, "blue" | "violet" | "amber" | "green" | "red"> = {
    Lead: "blue", Qualified: "violet", "Viewing Done": "amber",
    "Offer Made": "amber", "Under Offer": "green", Closed: "green", Lost: "red",
  };
  return map[s] || "blue";
};

interface ContactsViewProps {
  contacts: ContactRow[];
  total: number;
}

export function ContactsView({ contacts, total }: ContactsViewProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<ContactRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button className="flex items-center gap-1" onClick={() => column.toggleSorting()}>
            Name <ArrowUpDown size={12} />
          </button>
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-[var(--text-primary)]">{row.original.name}</p>
            <p className="text-xs text-[var(--text-muted)]">{row.original.community || "—"}</p>
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ getValue }) => <Badge variant="default">{getValue<string>()}</Badge>,
      },
      {
        accessorKey: "stage",
        header: "Stage",
        cell: ({ getValue }) => {
          const stage = getValue<string>();
          return <Badge variant={stageVariant(stage)}>{stage}</Badge>;
        },
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ getValue }) => {
          const p = getValue<string>();
          return <Badge variant={priorityVariant(p)}>{p}</Badge>;
        },
      },
      {
        accessorKey: "value",
        header: ({ column }) => (
          <button className="flex items-center gap-1" onClick={() => column.toggleSorting()}>
            Value <ArrowUpDown size={12} />
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="font-mono text-sm text-[var(--text-gold)]">
            {formatCurrency(getValue<number>())}
          </span>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-[var(--text-secondary)]">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "days",
        header: "Last Contact",
        cell: ({ getValue }) => {
          const d = getValue<number>();
          const variant = d >= 14 ? "red" as const : d >= 7 ? "amber" as const : "green" as const;
          return <Badge variant={variant}>{d >= 999 ? "Never" : `${d}d ago`}</Badge>;
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm"><Phone size={14} /></Button>
            <Button variant="ghost" size="sm">
              <MessageSquare size={14} className={row.original.whatsappConnected ? "text-[var(--green)]" : ""} />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: contacts,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-gold)]">Contacts</h2>
          <p className="text-sm text-[var(--text-muted)]">{total} contacts in your CRM</p>
        </div>
        <Button size="md"><Plus size={16} /> Add Contact</Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
          <Input
            placeholder="Search by name, phone, community..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-[var(--border-default)]">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-[var(--text-muted)]">
                    No contacts yet. Run <code className="rounded bg-[var(--bg-elevated)] px-1.5 py-0.5 text-xs">pnpm db:seed</code> to load your data, or click Add Contact.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border-subtle)] transition-colors hover:bg-[var(--bg-hover)]">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--border-default)] px-4 py-3">
          <p className="text-xs text-[var(--text-muted)]">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronLeft size={14} /> Previous
            </Button>
            <Button variant="ghost" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
