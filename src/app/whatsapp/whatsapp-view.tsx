"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Send, Phone, Search, Wifi } from "lucide-react";
import { Input } from "@/components/ui/input";

interface WhatsAppContact {
  id: string;
  name: string;
  phone: string;
  community: string | null;
  type: string;
  stage: string;
  priority: string;
  whatsappConnected: boolean;
  replied: boolean;
  lastMsg: string | null;
  lastMsgAt: string;
  updatedAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function initials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const priorityVariant = (p: string) =>
  p === "HIGH" ? "red" : p === "MEDIUM" ? "amber" : "default";

export default function WhatsAppView({ contacts }: { contacts: WhatsAppContact[] }) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(contacts[0]?.id || null);

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const selected = contacts.find((c) => c.id === selectedId) || contacts[0];

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-gold)]">WhatsApp CRM</h2>
          <p className="text-sm text-[var(--text-muted)]">
            {contacts.length} contacts with phone numbers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="green" className="gap-1.5 py-1">
            <Wifi size={12} /> Connected
          </Badge>
          <Button size="md">
            <Send size={16} /> New Message
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Conversation list */}
        <Card className="col-span-1">
          <CardHeader>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                size={14}
              />
              <Input
                placeholder="Search conversations..."
                className="pl-9"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-1 p-2">
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-[var(--text-muted)]">
                No contacts found
              </p>
            )}
            {filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  selectedId === conv.id
                    ? "bg-[var(--bg-hover)]"
                    : "hover:bg-[var(--bg-hover)]"
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-xs font-medium text-[var(--text-secondary)]">
                  {initials(conv.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-medium text-[var(--text-primary)]">
                      {conv.name}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {timeAgo(conv.lastMsgAt)}
                    </span>
                  </div>
                  <p className="truncate text-xs text-[var(--text-muted)]">
                    {conv.lastMsg || conv.phone}
                  </p>
                </div>
                {conv.priority === "HIGH" && (
                  <span className="flex h-2 w-2 rounded-full bg-[var(--red)]" />
                )}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Chat area */}
        <Card className="col-span-2 flex flex-col" style={{ minHeight: 500 }}>
          {selected ? (
            <>
              <CardHeader className="flex-row items-center justify-between border-b border-[var(--border-default)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-xs font-medium">
                    {initials(selected.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {selected.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{selected.phone}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone size={14} />
                  </Button>
                  <Badge variant={priorityVariant(selected.priority) as "red" | "amber" | "default"}>
                    {selected.priority === "HIGH"
                      ? "Hot Lead"
                      : selected.priority === "MEDIUM"
                      ? "Warm"
                      : "Cold"}
                  </Badge>
                  {selected.community && (
                    <Badge variant="default">{selected.community}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between py-4">
                <div className="flex flex-1 items-center justify-center">
                  <div className="text-center text-sm text-[var(--text-muted)]">
                    <p>WhatsApp integration ready</p>
                    <p className="mt-1 text-xs">
                      {selected.whatsappConnected
                        ? "Connected — messages will appear here"
                        : "Not yet connected — send first message to start"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Input placeholder="Type a message..." className="flex-1" />
                  <Button size="md">
                    <Send size={16} />
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-1 items-center justify-center">
              <p className="text-sm text-[var(--text-muted)]">
                Select a contact to start messaging
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
