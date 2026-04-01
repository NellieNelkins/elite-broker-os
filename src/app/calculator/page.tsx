"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator as CalcIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const presets = [
  { label: "2BR Palm Jumeirah", price: 4500000, commission: 2, yield: 5.5 },
  { label: "5BR The Springs", price: 3200000, commission: 2, yield: 6.8 },
  { label: "4BR Emirates Hills", price: 18000000, commission: 2, yield: 3.2 },
  { label: "3BR Arabian Ranches", price: 5100000, commission: 2, yield: 5.1 },
];

export default function CalculatorPage() {
  const [price, setPrice] = useState(3200000);
  const [commRate, setCommRate] = useState(2);
  const [yieldRate, setYieldRate] = useState(6.8);

  const commission = price * (commRate / 100);
  const annualRental = price * (yieldRate / 100);
  const monthlyRental = annualRental / 12;
  const dldFee = price * 0.04;
  const totalCost = price + dldFee;

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-gold)]">Investment Calculator</h2>
        <p className="text-sm text-[var(--text-muted)]">ROI, commission, and yield calculations</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Input */}
        <Card>
          <CardHeader><CardTitle>Property Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Property Price (AED)</label>
              <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Commission Rate (%)</label>
              <Input type="number" step="0.1" value={commRate} onChange={(e) => setCommRate(Number(e.target.value))} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Rental Yield (%)</label>
              <Input type="number" step="0.1" value={yieldRate} onChange={(e) => setYieldRate(Number(e.target.value))} />
            </div>
            <div className="border-t border-[var(--border-default)] pt-3">
              <p className="mb-2 text-xs text-[var(--text-muted)]">Quick Presets</p>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((p) => (
                  <Button key={p.label} variant="secondary" size="sm" onClick={() => { setPrice(p.price); setCommRate(p.commission); setYieldRate(p.yield); }}>
                    {p.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="col-span-2 glow-gold">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Calculation Results</CardTitle>
            <CalcIcon size={16} className="text-[var(--text-gold)]" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-[var(--bg-elevated)] p-4">
                <p className="text-xs text-[var(--text-muted)]">Your Commission</p>
                <p className="mt-1 font-mono text-2xl font-semibold text-[var(--text-gold)]">{formatCurrency(commission)}</p>
                <p className="text-xs text-[var(--text-muted)]">{commRate}% of {formatCurrency(price)}</p>
              </div>
              <div className="rounded-lg bg-[var(--bg-elevated)] p-4">
                <p className="text-xs text-[var(--text-muted)]">Annual Rental Income</p>
                <p className="mt-1 font-mono text-2xl font-semibold text-[var(--green)]">{formatCurrency(annualRental)}</p>
                <p className="text-xs text-[var(--text-muted)]">{yieldRate}% yield</p>
              </div>
              <div className="rounded-lg bg-[var(--bg-elevated)] p-4">
                <p className="text-xs text-[var(--text-muted)]">Monthly Rental</p>
                <p className="mt-1 font-mono text-2xl font-semibold text-[var(--blue)]">{formatCurrency(monthlyRental)}</p>
              </div>
              <div className="rounded-lg bg-[var(--bg-elevated)] p-4">
                <p className="text-xs text-[var(--text-muted)]">DLD Transfer Fee (4%)</p>
                <p className="mt-1 font-mono text-2xl font-semibold text-[var(--amber)]">{formatCurrency(dldFee)}</p>
              </div>
              <div className="col-span-2 rounded-lg border border-[var(--border-gold)] bg-[var(--bg-surface)] p-4">
                <p className="text-xs text-[var(--text-muted)]">Total Acquisition Cost (Price + DLD)</p>
                <p className="mt-1 font-mono text-3xl font-bold text-[var(--text-gold)]">{formatCurrency(totalCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
