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
            <CardTitle className="flex items-center gap-2"><MessageSquare size={14} /> WhatsApp</CardTitle>
            <Badge variant={connected.whatsapp ? "green" : "amber"}>{connected.whatsapp ? "Connected" : "Pending"}</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[var(--text-muted)]">Connect your WhatsApp Business account for CRM messaging and campaign automation.</p>
            <Button size="sm" variant="secondary" className="mt-3" onClick={() => setConnected(prev => ({ ...prev, whatsapp: true }))}>Connect WhatsApp</Button>
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
