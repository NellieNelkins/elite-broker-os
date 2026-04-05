"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CreateContactModal } from "./create-contact-modal";
import { EditContactModal } from "./edit-contact-modal";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
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
  List,
  X,
  Trash2,
  Pencil,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  getSmartLists,
  saveSmartList,
  addToSmartList,
  deleteSmartList,
  type SmartList,
} from "@/lib/smart-lists";
import { toast } from "sonner";

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
  const [showCreate, setShowCreate] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [smartLists, setSmartLists] = useState<SmartList[]>([]);
  const [activeList, setActiveList] = useState<SmartList | null>(null);
  const [showCreateList, setShowCreateList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [showAddToList, setShowAddToList] = useState<string | null>(null);
  const [addToListName, setAddToListName] = useState("");
  const [editingContact, setEditingContact] = useState<ContactRow | null>(null);
  const router = useRouter();

  useEffect(() => {
    setSmartLists(getSmartLists());
  }, []);

  const refreshSmartLists = useCallback(() => {
    setSmartLists(getSmartLists());
  }, []);

  const filteredContacts = useMemo(() => {
    if (!activeList) return contacts;
    const ids = new Set(activeList.contactIds);
    return contacts.filter((c) => ids.has(c.id));
  }, [contacts, activeList]);

  const selectedContactIds = useMemo(() => {
    return Object.keys(rowSelection)
      .filter((key) => rowSelection[key])
      .map((idx) => filteredContacts[Number(idx)]?.id)
      .filter(Boolean);
  }, [rowSelection, filteredContacts]);

  const handleCreateSmartList = () => {
    if (!newListName.trim()) return;
    saveSmartList({ name: newListName.trim(), contactIds: selectedContactIds });
    refreshSmartLists();
    setShowCreateList(false);
    setNewListName("");
    setRowSelection({});
    toast.success(`Smart list "${newListName.trim()}" created with ${selectedContactIds.length} contacts`);
  };

  const handleDeleteSmartList = (id: string) => {
    deleteSmartList(id);
    refreshSmartLists();
    if (activeList?.id === id) setActiveList(null);
    toast.success("Smart list deleted");
  };

  const handleAddToListFromRow = (contactId: string, mode: "new" | "existing", listId?: string) => {
    if (mode === "new") {
      if (!addToListName.trim()) return;
      saveSmartList({ name: addToListName.trim(), contactIds: [contactId] });
      toast.success(`Smart list "${addToListName.trim()}" created`);
    } else if (listId) {
      addToSmartList(listId, [contactId]);
      const list = smartLists.find((l) => l.id === listId);
      toast.success(`Added to "${list?.name}"`);
    }
    refreshSmartLists();
    setShowAddToList(null);
    setAddToListName("");
  };

  const columns = useMemo<ColumnDef<ContactRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="h-4 w-4 rounded border-[var(--border-default)] accent-[var(--gold-500)]"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="h-4 w-4 rounded border-[var(--border-default)] accent-[var(--gold-500)]"
          />
        ),
        enableSorting: false,
      },
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
          <div className="flex items-center gap-1 relative">
            <Button variant="ghost" size="sm"><Phone size={14} /></Button>
            <Button variant="ghost" size="sm">
              <MessageSquare size={14} className={row.original.whatsappConnected ? "text-[var(--green)]" : ""} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditingContact(row.original)}>
              <Pencil size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => {
              setShowAddToList(showAddToList === row.original.id ? null : row.original.id);
              setAddToListName("");
            }}>
              <List size={14} />
            </Button>
            {showAddToList === row.original.id && (
              <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 shadow-[var(--shadow-lg)]">
                <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">Add to Smart List</p>
                <div className="space-y-1 mb-2 max-h-32 overflow-y-auto">
                  {smartLists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => handleAddToListFromRow(row.original.id, "existing", list.id)}
                      className="w-full rounded px-2 py-1 text-left text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                    >
                      {list.name} ({list.contactIds.length})
                    </button>
                  ))}
                </div>
                <div className="border-t border-[var(--border-subtle)] pt-2">
                  <p className="mb-1 text-xs text-[var(--text-muted)]">Or create new:</p>
                  <div className="flex gap-1">
                    <Input
                      placeholder="List name"
                      value={addToListName}
                      onChange={(e) => setAddToListName(e.target.value)}
                      className="h-7 text-xs"
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddToListFromRow(row.original.id, "new"); }}
                    />
                    <Button size="sm" onClick={() => handleAddToListFromRow(row.original.id, "new")} className="h-7 px-2">
                      <Plus size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showAddToList, smartLists, addToListName]
  );

  const table = useReactTable({
    data: filteredContacts,
    columns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-gold)]">Contacts</h2>
          <p className="text-sm text-[var(--text-muted)]">{total} contacts in your CRM</p>
        </div>
        <Button size="md" onClick={() => setShowCreate(true)}><Plus size={16} /> Add Contact</Button>
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

      {smartLists.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-[var(--text-muted)]">Smart Lists:</span>
          {smartLists.map((list) => (
            <button
              key={list.id}
              onClick={() => {
                setActiveList(activeList?.id === list.id ? null : list);
                setRowSelection({});
              }}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                activeList?.id === list.id
                  ? "border-[var(--border-gold)] bg-[var(--gold-900)] text-[var(--text-gold)]"
                  : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-gold)]"
              }`}
            >
              <List size={10} />
              {list.name} ({list.contactIds.length})
              {activeList?.id === list.id && (
                <X size={10} className="ml-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); setActiveList(null); setRowSelection({}); }} />
              )}
            </button>
          ))}
          {activeList && (
            <button
              onClick={() => handleDeleteSmartList(activeList.id)}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-[var(--red)] border border-[var(--border-default)] hover:border-[var(--red)] transition-colors"
            >
              <Trash2 size={10} /> Delete List
            </button>
          )}
        </div>
      )}

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
      {showCreate && (
        <CreateContactModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); router.refresh(); }}
        />
      )}
      {editingContact && (
        <EditContactModal
          open={!!editingContact}
          contact={editingContact}
          onClose={() => setEditingContact(null)}
          onSaved={() => { setEditingContact(null); router.refresh(); }}
        />
      )}

      {/* Floating action bar for selection */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-gold)] bg-[var(--bg-surface)] px-5 py-3 shadow-[var(--shadow-lg)]">
          <span className="text-sm text-[var(--text-primary)]">
            {selectedContactIds.length} selected
          </span>
          <Button size="sm" onClick={() => setShowCreateList(true)}>
            <List size={14} /> Create Smart List
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setRowSelection({})}>
            Clear
          </Button>
        </div>
      )}

      {/* Create Smart List modal */}
      {showCreateList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-lg)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Create Smart List</h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              {selectedContactIds.length} contact{selectedContactIds.length !== 1 ? "s" : ""} will be added to this list.
            </p>
            <Input
              placeholder="Enter list name..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreateSmartList(); }}
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => { setShowCreateList(false); setNewListName(""); }}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateSmartList} disabled={!newListName.trim()}>
                Create List
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
