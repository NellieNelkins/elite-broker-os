"use client";

import { Card, CardHeader, CardTitle, CardContent, CardValue } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Building2, MapPin } from "lucide-react";

const communities = [
  { name: "The Springs", avg: 2800000, change: 5.2, transactions: 34, type: "Villa/TH" },
  { name: "The Meadows", avg: 4200000, change: 3.8, transactions: 18, type: "Villa" },
  { name: "Arabian Ranches", avg: 5500000, change: 7.1, transactions: 26, type: "Villa" },
  { name: "Emirates Hills", avg: 18000000, change: -1.2, transactions: 8, type: "Villa" },
  { name: "Palm Jumeirah", avg: 8500000, change: 4.5, transactions: 42, type: "Apt/Villa" },
  { name: "Dubai Marina", avg: 3200000, change: 6.3, transactions: 58, type: "Apartment" },
  { name: "Downtown Dubai", avg: 4800000, change: 2.9, transactions: 45, type: "Apartment" },
  { name: "JBR", avg: 3800000, change: -0.5, transactions: 22, type: "Apartment" },
];

export default function MarketPage() {
  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-gold)]">Market Insights</h2>
        <p className="text-sm text-[var(--text-muted)]">Dubai real estate market data — Emirates Living & key communities</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader><CardTitle>Avg. Price (Villas)</CardTitle></CardHeader><CardContent><CardValue className="text-[var(--text-gold)]">AED 5.2M</CardValue><p className="mt-1 text-xs text-[var(--green)]">+4.8% YoY</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Avg. Price (Apts)</CardTitle></CardHeader><CardContent><CardValue className="text-[var(--blue)]">AED 3.1M</CardValue><p className="mt-1 text-xs text-[var(--green)]">+3.2% YoY</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Total Transactions</CardTitle></CardHeader><CardContent><CardValue className="text-[var(--violet)]">253</CardValue><p className="mt-1 text-xs text-[var(--text-muted)]">This month</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Avg. Days to Sell</CardTitle></CardHeader><CardContent><CardValue className="text-[var(--amber)]">38</CardValue><p className="mt-1 text-xs text-[var(--green)]">-5 days vs last month</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Community Performance</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-default)]">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[var(--text-muted)]">Community</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[var(--text-muted)]">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[var(--text-muted)]">Avg. Price</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[var(--text-muted)]">Change</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[var(--text-muted)]">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {communities.map((c) => (
                  <tr key={c.name} className="border-b border-[var(--border-subtle)] transition-colors hover:bg-[var(--bg-hover)]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-[var(--text-gold)]" />
                        <span className="text-sm font-medium text-[var(--text-primary)]">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="default">{c.type}</Badge></td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-[var(--text-gold)]">AED {(c.avg / 1000000).toFixed(1)}M</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${c.change >= 0 ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
                        {c.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {c.change >= 0 ? "+" : ""}{c.change}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-[var(--text-secondary)]">{c.transactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
