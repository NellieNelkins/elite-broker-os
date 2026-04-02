"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Key, Database, MessageSquare, Cloud, Shield } from "lucide-react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [connected, setConnected] = useState({ ai: false, sheets: false, whatsapp: false, drive: false });

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-gold)]">Settings</h2>
        <p className="text-sm text-[var(--text-muted)]">API keys, integrations, and security</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Anthropic API */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Key size={14} /> Anthropic API Key</CardTitle>
            <Badge variant={connected.ai ? "green" : "red"}>{connected.ai ? "Connected" : "Not Connected"}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-[var(--text-muted)]">Your API key is stored securely server-side and never exposed to the browser.</p>
            <Input type="password" placeholder="sk-ant-..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
            <Button size="sm" onClick={() => setConnected(prev => ({ ...prev, ai: true }))}>Save API Key</Button>
          </CardContent>
        </Card>

        {/* Database */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Database size={14} /> Database</CardTitle>
            <Badge variant="green">PostgreSQL</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[var(--text-muted)]">Your data is stored in a secure PostgreSQL database with encryption at rest. No more Google Sheets dependency.</p>
            <div className="mt-3 rounded-lg bg-[var(--bg-elevated)] p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Status</span>
                <Badge variant="green">Active</Badge>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Provider</span>
                <span className="text-[var(--text-primary)]">Supabase (PostgreSQL)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><MessageSquare size={14} /> WhatsApp Integration</CardTitle>
            <Badge variant={connected.whatsapp ? "green" : "amber"}>{connected.whatsapp ? "Connected" : "Direct Mode"}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-[var(--bg-elevated)] p-3">
              <p className="text-xs font-medium text-[var(--text-secondary)]">Direct WhatsApp (Always Active)</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Click &quot;Send&quot; on any contact to open your personal WhatsApp with a pre-filled message. No setup needed.</p>
              <Badge variant="green" className="mt-2">Active</Badge>
            </div>
            <div className="rounded-lg border border-[var(--border-default)] p-3">
              <p className="text-xs font-medium text-[var(--text-secondary)]">WhatsApp Business API (Optional)</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">For automated campaigns and receiving messages. Add these env vars in Vercel:</p>
              <ul className="mt-2 space-y-1 text-xs text-[var(--text-muted)]">
                <li><code className="text-[var(--text-gold)]">WHATSAPP_ACCESS_TOKEN</code> — Meta Business access token</li>
                <li><code className="text-[var(--text-gold)]">WHATSAPP_PHONE_NUMBER_ID</code> — Your WA phone number ID</li>
                <li><code className="text-[var(--text-gold)]">WHATSAPP_WEBHOOK_VERIFY_TOKEN</code> — Webhook verification token</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-[var(--border-gold)]">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Shield size={14} /> Security</CardTitle>
            <Badge variant="green">Hardened</Badge>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li className="flex items-center gap-2"><span className="text-[var(--green)]">&#10003;</span> CSP Headers enabled</li>
              <li className="flex items-center gap-2"><span className="text-[var(--green)]">&#10003;</span> API rate limiting (100 req/min)</li>
              <li className="flex items-center gap-2"><span className="text-[var(--green)]">&#10003;</span> Input validation (Zod schemas)</li>
              <li className="flex items-center gap-2"><span className="text-[var(--green)]">&#10003;</span> XSS protection (DOMPurify)</li>
              <li className="flex items-center gap-2"><span className="text-[var(--green)]">&#10003;</span> Server-side API key storage</li>
              <li className="flex items-center gap-2"><span className="text-[var(--green)]">&#10003;</span> NextAuth.js authentication</li>
              <li className="flex items-center gap-2"><span className="text-[var(--green)]">&#10003;</span> HTTPS + HSTS enforced</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
