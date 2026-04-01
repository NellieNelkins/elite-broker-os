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
import { formatCurrency, daysAgo } from "@/lib/utils";
import type { Contact } from "@/types";

// Demo contacts — will be replaced with API data
const demoContacts: Contact[] = Array.from({ length: 50 }, (_, i) => ({
  id: `c-${i + 1}`,
  name: [
    "Mohammed Al Mansouri", "Sarah Chen", "Ahmed Al Hashmi", "Elena Petrova",
    "Rashid Al Maktoum", "Priya Sharma", "James Wright", "Fatima Al Zaabi",
    "Carlos Rodriguez", "Nadia Abbas",
  ][i % 10],
  phone: `+9715${String(Math.floor(Math.random() * 90000000 + 10000000))}`,
  email: `contact${i + 1}@example.com`,
  type: (["Buyer", "Seller", "Investor", "Tenant"] as const)[i % 4],
  stage: (["Lead", "Qualified", "Viewing Done", "Offer Made", "Under Offer", "Closed"] as const)[i % 6],
  priority: (["HIGH", "MEDIUM", "LOW"] as const)[i % 3],
  days: Math.floor(Math.random() * 30),
  value: Math.floor(Math.random() * 5000000 + 500000),
  community: ["The Springs", "The Meadows", "Arabian Ranches", "Emirates Hills", "Palm Jumeirah"][i % 5],
  property: `Unit ${100 + i}`,
  addedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  whatsappConnected: Math.random() > 0.5,
  replied: Math.random() > 0.6,
}));

const priorityVariant = (p: string) =>
  p === "HIGH" ? "red" : p === "MEDIUM" ? "amber" : "green";

const stageVariant = (s: string) => {
  const map: Record<string, "blue" | "violet" | "amber" | "green" | "red"> = {
    Lead: "blue", Qualified: "violet", "Viewing Done": "amber",
    "Offer Made": "amber", "Under Offer": "green", Closed: "green", Lost: "red",
  };
  return map[s] || "blue";
};

export default function ContactsPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<Contact>[]>(
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
            <p className="text-xs text-[var(--text-muted)]">{row.original.community}</p>
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ getValue }) => (
          <Badge variant="default">{getValue<string>()}</Badge>
        ),
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
          <span className="font-mono text-xs text-[var(--text-secondary)]">
            {getValue<string>()}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm">
              <Phone size={14} />
            </Button>
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
    data: demoContacts,
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-gold)]">Contacts</h2>
          <p className="text-sm text-[var(--text-muted)]">
            {demoContacts.length} contacts in your CRM
          </p>
        </div>
        <Button size="md">
          <Plus size={16} />
          Add Contact
        </Button>
      </div>

      {/* Search & Filters */}
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
        <Button variant="secondary" size="sm">All Types</Button>
        <Button variant="secondary" size="sm">All Stages</Button>
        <Button variant="secondary" size="sm">All Priority</Button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-[var(--border-default)]">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[var(--border-subtle)] transition-colors hover:bg-[var(--bg-hover)]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[var(--border-default)] px-4 py-3">
          <p className="text-xs text-[var(--text-muted)]">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft size={14} />
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
