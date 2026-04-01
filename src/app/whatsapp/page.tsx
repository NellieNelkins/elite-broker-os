"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Phone, Search, Wifi, WifiOff } from "lucide-react";
import { Input } from "@/components/ui/input";

const conversations = [
  { id: 1, name: "Mohammed Al Mansouri", phone: "+971501234567", lastMsg: "Yes, I'm interested in the 5BR villa", time: "2m ago", unread: 2, status: "hot" },
  { id: 2, name: "Elena Petrova", phone: "+971509876543", lastMsg: "Can we schedule a viewing for Saturday?", time: "15m ago", unread: 1, status: "warm" },
  { id: 3, name: "Ahmed Al Hashmi", phone: "+971505551234", lastMsg: "What's the price range for Springs villas?", time: "1h ago", unread: 0, status: "warm" },
  { id: 4, name: "Sarah Chen", phone: "+971507778899", lastMsg: "Thank you for the market report!", time: "3h ago", unread: 0, status: "cold" },
  { id: 5, name: "Rashid Al Maktoum", phone: "+971502223344", lastMsg: "I'll think about it and get back to you", time: "1d ago", unread: 0, status: "cold" },
];

const statusColor = (s: string) => s === "hot" ? "red" : s === "warm" ? "amber" : "default";

export default function WhatsAppPage() {
  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-gold)]">WhatsApp CRM</h2>
          <p className="text-sm text-[var(--text-muted)]">Manage conversations and campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="green" className="gap-1.5 py-1"><Wifi size={12} /> Connected</Badge>
          <Button size="md"><Send size={16} /> New Message</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Conversation list */}
        <Card className="col-span-1">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
              <Input placeholder="Search conversations..." className="pl-9" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1 p-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[var(--bg-hover)]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-xs font-medium text-[var(--text-secondary)]">
                  {conv.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate">{conv.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{conv.time}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] truncate">{conv.lastMsg}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--green)] text-[10px] font-bold text-white">{conv.unread}</span>
                )}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Chat area placeholder */}
        <Card className="col-span-2 flex flex-col" style={{ minHeight: 500 }}>
          <CardHeader className="flex-row items-center justify-between border-b border-[var(--border-default)]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-xs font-medium">MA</div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Mohammed Al Mansouri</p>
                <p className="text-xs text-[var(--text-muted)]">+971 50 123 4567</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm"><Phone size={14} /></Button>
              <Badge variant={statusColor("hot") as "red" | "amber" | "default"}>Hot Lead</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between py-4">
            <div className="flex-1 space-y-3">
              <div className="flex justify-end">
                <div className="max-w-xs rounded-xl rounded-tr-sm bg-[var(--gold-900)] px-3 py-2 text-sm text-[var(--text-primary)]">
                  Hi Mohammed, we have some excellent 5BR villas in The Springs. Would you be interested in a viewing?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-xs rounded-xl rounded-tl-sm bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]">
                  Yes, I&apos;m interested in the 5BR villa. What&apos;s the asking price?
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Input placeholder="Type a message..." className="flex-1" />
              <Button size="md"><Send size={16} /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
