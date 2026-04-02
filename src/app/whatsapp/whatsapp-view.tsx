"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Send,
  Phone,
  Search,
  Wifi,
  ExternalLink,
  MessageSquare,
  Copy,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { waLink, fillTemplate, defaultTemplates } from "@/lib/whatsapp";

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
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const priorityVariant = (p: string) =>
  p === "HIGH" ? "red" : p === "MEDIUM" ? "amber" : "default";

export default function WhatsAppView({
  contacts,
  hasBusinessApi,
}: {
  contacts: WhatsAppContact[];
  hasBusinessApi: boolean;
}) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    contacts[0]?.id || null
  );
  const [message, setMessage] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sentLog, setSentLog] = useState<
    Array<{ contactId: string; text: string; time: Date; via: string }>
  >([]);

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const selected = contacts.find((c) => c.id === selectedId) || contacts[0];

  const handleSendDirect = () => {
    if (!selected || !message.trim()) return;
    // Open WhatsApp with pre-filled message
    window.open(waLink(selected.phone, message), "_blank");
    // Log the message
    logMessage(selected.id, message, "direct");
    setMessage("");
  };

  const handleSendApi = async () => {
    if (!selected || !message.trim()) return;
    const res = await fetch("/api/whatsapp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: selected.id, phone: selected.phone, text: message }),
    });
    const data = await res.json();
    if (data.success) {
      logMessage(selected.id, message, "api");
      setMessage("");
    }
  };

  const logMessage = (contactId: string, text: string, via: string) => {
    setSentLog((prev) => [{ contactId, text, time: new Date(), via }, ...prev]);
    // Log to server for activity tracking
    fetch("/api/whatsapp/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId, text, via }),
    }).catch(() => {});
  };

  const applyTemplate = (templateId: string) => {
    if (!selected) return;
    const tmpl = defaultTemplates.find((t) => t.id === templateId);
    if (!tmpl) return;
    const filled = fillTemplate(tmpl.text, {
      name: selected.name.split(" ")[0],
      community: selected.community || "Dubai",
      propType: selected.type === "Buyer" ? "property" : "listing",
      agent: "your agent name",
    });
    setMessage(filled);
    setShowTemplates(false);
  };

  const copyPhone = () => {
    if (!selected) return;
    navigator.clipboard.writeText(selected.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const contactSentLog = sentLog.filter((l) => l.contactId === selected?.id);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-gold)]">
            WhatsApp CRM
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            {contacts.length} contacts &middot;{" "}
            {hasBusinessApi ? "Business API + Direct" : "Direct WhatsApp linking"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasBusinessApi && (
            <Badge variant="green" className="gap-1.5 py-1">
              <Wifi size={12} /> Business API
            </Badge>
          )}
          <Badge variant="amber" className="gap-1.5 py-1">
            <ExternalLink size={12} /> Direct Link
          </Badge>
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-[520px] space-y-1 overflow-y-auto p-2">
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-[var(--text-muted)]">
                No contacts found
              </p>
            )}
            {filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  setSelectedId(conv.id);
                  setShowTemplates(false);
                }}
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
                    <button
                      onClick={copyPhone}
                      className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      {selected.phone}
                      {copied ? (
                        <Check size={10} className="text-[var(--green)]" />
                      ) : (
                        <Copy size={10} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.open(`tel:${selected.phone}`, "_self")
                    }
                  >
                    <Phone size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.open(waLink(selected.phone), "_blank")
                    }
                    title="Open in WhatsApp"
                  >
                    <ExternalLink size={14} />
                  </Button>
                  <Badge
                    variant={
                      priorityVariant(selected.priority) as
                        | "red"
                        | "amber"
                        | "default"
                    }
                  >
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
                {/* Message log / placeholder */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {contactSentLog.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center text-sm text-[var(--text-muted)]">
                        <MessageSquare
                          size={32}
                          className="mx-auto mb-2 opacity-30"
                        />
                        <p>Send your first message to {selected.name.split(" ")[0]}</p>
                        <p className="mt-1 text-xs">
                          Messages open in your WhatsApp — type below or use a
                          template
                        </p>
                      </div>
                    </div>
                  ) : (
                    contactSentLog.map((log, i) => (
                      <div key={i} className="flex justify-end">
                        <div className="max-w-xs rounded-xl rounded-tr-sm bg-[var(--gold-900)] px-3 py-2 text-sm text-[var(--text-primary)]">
                          {log.text}
                          <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[var(--text-muted)]">
                            <span>
                              {log.time.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span>&middot;</span>
                            <span>via {log.via}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Template quick picks */}
                {showTemplates && (
                  <div className="mb-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3">
                    <p className="mb-2 text-xs font-medium text-[var(--text-secondary)]">
                      Quick Templates
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {defaultTemplates.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => applyTemplate(t.id)}
                          className="rounded-lg bg-[var(--bg-surface)] px-3 py-2 text-left text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                        >
                          <span className="font-medium">{t.name}</span>
                          <p className="mt-0.5 truncate opacity-60">
                            {t.text.slice(0, 60)}...
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message input */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowTemplates(!showTemplates)}
                    >
                      Templates
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Message ${selected.name.split(" ")[0]}...`}
                      className="flex-1"
                      value={message}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setMessage(e.target.value)
                      }
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendDirect();
                        }
                      }}
                    />
                    <Button
                      size="md"
                      onClick={handleSendDirect}
                      title="Open in your WhatsApp"
                    >
                      <ExternalLink size={16} /> Send
                    </Button>
                    {hasBusinessApi && (
                      <Button
                        size="md"
                        variant="secondary"
                        onClick={handleSendApi}
                        title="Send via Business API"
                      >
                        <Send size={16} /> API
                      </Button>
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    &quot;Send&quot; opens your WhatsApp with the message
                    pre-filled
                    {hasBusinessApi &&
                      " · \"API\" sends directly via WhatsApp Business"}
                  </p>
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
