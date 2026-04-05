"use client";

import { useState, type ReactElement } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calculator as CalcIcon,
  Percent,
  Home,
  TrendingUp,
  Landmark,
  BarChart3,
  Building2,
  Plus,
  Minus,
} from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}
function fmtPct(n: number) { return `${n.toFixed(2)}%`; }

const tabs = [
  { id: "commission", label: "Commission", icon: Percent },
  { id: "mortgage", label: "Mortgage", icon: Home },
  { id: "roi", label: "ROI & Yield", icon: TrendingUp },
  { id: "dld", label: "DLD Fees", icon: Landmark },
  { id: "compare", label: "Price Compare", icon: BarChart3 },
  { id: "rental", label: "Rental Compare", icon: Building2 },
] as const;

type TabId = (typeof tabs)[number]["id"];

const labelClass = "text-xs font-medium text-[var(--text-secondary)] mb-1 block";
const resultBox = "rounded-lg bg-[var(--bg-elevated)] p-4";

function CommissionCalc() {
  const [price, setPrice] = useState(3200000);
  const [rate, setRate] = useState(2);
  const [vat, setVat] = useState(true);
  const presets = [1, 1.5, 2, 3, 5];
  const gross = price * (rate / 100);
  const vatAmt = vat ? gross * 0.05 : 0;
  const net = gross - vatAmt;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div><label className={labelClass}>Property Price (AED)</label><Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} /></div>
        <div><label className={labelClass}>Commission Rate (%)</label><Input type="number" step="0.1" value={rate} onChange={e => setRate(Number(e.target.value))} /></div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={vat} onChange={e => setVat(e.target.checked)} className="accent-[var(--gold-500)]" id="vat-toggle" />
          <label htmlFor="vat-toggle" className="text-sm text-[var(--text-secondary)] cursor-pointer">Include 5% VAT on commission</label>
        </div>
        <div>
          <label className={labelClass}>Quick Rates</label>
          <div className="flex gap-2">{presets.map(p => <Button key={p} variant={rate === p ? "primary" : "secondary"} size="sm" onClick={() => setRate(p)}>{p}%</Button>)}</div>
        </div>
      </div>
      <div className="space-y-3">
        <div className={resultBox}><p className="text-xs text-[var(--text-muted)]">Gross Commission</p><p className="mt-1 font-mono text-2xl font-semibold text-[var(--text-gold)]">{fmt(gross)}</p></div>
        {vat && <div className={resultBox}><p className="text-xs text-[var(--text-muted)]">VAT (5%)</p><p className="mt-1 font-mono text-lg font-semibold text-[var(--amber)]">{fmt(vatAmt)}</p></div>}
        <div className={`${resultBox} border border-[var(--border-gold)]`}><p className="text-xs text-[var(--text-muted)]">Net Commission (after VAT)</p><p className="mt-1 font-mono text-2xl font-bold text-[var(--green)]">{fmt(net)}</p></div>
      </div>
    </div>
  );
}

function MortgageCalc() {
  const [price, setPrice] = useState(3200000);
  const [downPct, setDownPct] = useState(20);
  const [interestRate, setInterestRate] = useState(4.5);
  const [termYears, setTermYears] = useState(25);
  const [isResident, setIsResident] = useState(true);

  const loan = price * (1 - downPct / 100);
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = termYears * 12;
  const monthly = monthlyRate > 0
    ? (loan * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    : loan / numPayments;
  const totalCost = monthly * numPayments;
  const totalInterest = totalCost - loan;

  // Amortization year breakdown (first 5 years)
  const amortization: { year: number; principal: number; interest: number; balance: number }[] = [];
  let balance = loan;
  for (let y = 1; y <= Math.min(5, termYears); y++) {
    let yearPrincipal = 0, yearInterest = 0;
    for (let m = 0; m < 12; m++) {
      const intPayment = balance * monthlyRate;
      const princPayment = monthly - intPayment;
      yearInterest += intPayment;
      yearPrincipal += princPayment;
      balance -= princPayment;
    }
    amortization.push({ year: y, principal: yearPrincipal, interest: yearInterest, balance: Math.max(0, balance) });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div><label className={labelClass}>Property Price (AED)</label><Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} /></div>
        <div>
          <label className={labelClass}>Down Payment (%)</label>
          <Input type="number" value={downPct} onChange={e => setDownPct(Number(e.target.value))} />
          <div className="mt-1 flex gap-2">
            <Button size="sm" variant={isResident ? "primary" : "secondary"} onClick={() => { setIsResident(true); setDownPct(20); }}>Resident (20%)</Button>
            <Button size="sm" variant={!isResident ? "primary" : "secondary"} onClick={() => { setIsResident(false); setDownPct(25); }}>Non-Res (25%)</Button>
          </div>
        </div>
        <div><label className={labelClass}>Interest Rate (%)</label><Input type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} /></div>
        <div><label className={labelClass}>Term (Years)</label><Input type="number" value={termYears} onChange={e => setTermYears(Number(e.target.value))} /></div>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <div className={resultBox}><p className="text-xs text-[var(--text-muted)]">Monthly Payment</p><p className="mt-1 font-mono text-xl font-semibold text-[var(--text-gold)]">{fmt(monthly)}</p></div>
        <div className={resultBox}><p className="text-xs text-[var(--text-muted)]">Loan Amount</p><p className="mt-1 font-mono text-xl font-semibold text-[var(--blue)]">{fmt(loan)}</p></div>
        <div className={resultBox}><p className="text-xs text-[var(--text-muted)]">Total Interest</p><p className="mt-1 font-mono text-xl font-semibold text-[var(--amber)]">{fmt(totalInterest)}</p></div>
        <div className={resultBox}><p className="text-xs text-[var(--text-muted)]">Total Cost</p><p className="mt-1 font-mono text-xl font-semibold text-[var(--green)]">{fmt(totalCost)}</p></div>
      </div>
      <div>
        <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Amortization (Years 1-5)</h4>
        <div className="overflow-x-auto rounded-lg border border-[var(--border-default)]">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[var(--border-default)] bg-[var(--bg-elevated)]">
              <th className="px-3 py-2 text-left text-xs font-medium text-[var(--text-muted)]">Year</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-[var(--text-muted)]">Principal</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-[var(--text-muted)]">Interest</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-[var(--text-muted)]">Balance</th>
            </tr></thead>
            <tbody>{amortization.map(row => (
              <tr key={row.year} className="border-b border-[var(--border-subtle)]">
                <td className="px-3 py-2 text-[var(--text-primary)]">Year {row.year}</td>
                <td className="px-3 py-2 text-right font-mono text-[var(--green)]">{fmt(row.principal)}</td>
                <td className="px-3 py-2 text-right font-mono text-[var(--amber)]">{fmt(row.interest)}</td>
                <td className="px-3 py-2 text-right font-mono text-[var(--text-secondary)]">{fmt(row.balance)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RoiCalc() {
  const [price, setPrice] = useState(3200000);
  const [annualRent, setAnnualRent] = useState(180000);
  const [serviceCharges, setServiceCharges] = useState(18000);
  const [maintenance, setMaintenance] = useState(5000);

  const grossYield = (annualRent / price) * 100;
  const netIncome = annualRent - serviceCharges - maintenance;
  const netYield = (netIncome / price) * 100;
  const capRate = netYield;
  const payback = netIncome > 0 ? price / netIncome : 0;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div><label className={labelClass}>Property Price (AED)</label><Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} /></div>
        <div><label className={labelClass}>Annual Rental Income (AED)</label><Input type="number" value={annualRent} onChange={e => setAnnualRent(Number(e.target.value))} />
          <p className="mt-1 text-xs text-[var(--text-muted)]">Monthly: {fmt(annualRent / 12)}</p>
        </div>
        <div><label className={labelClass}>Service Charges / Year (AED)</label><Input type="number" value={serviceCharges} onChange={e => setServiceCharges(Number(e.target.value))} /></div>
        <div><label className={labelClass}>Maintenance / Year (AED)</label><Input type="number" value={maintenance} onChange={e => setMaintenance(Number(e.target.value))} /></div>
      </div>
      <div className="space-y-3">
        <div className={resultBox}><p className="text-xs text-[var(--text-muted)]">Gross Yield</p><p className="mt-1 font-mono text-2xl font-semibold text-[var(--blue)]">{fmtPct(grossYield)}</p></div>
        <div className={`${resultBox} border border-[var(--border-gold)]`}><p className="text-xs text-[var(--text-muted)]">Net Yield / Cap Rate</p><p className="mt-1 font-mono text-2xl font-semibold text-[var(--text-gold)]">{fmtPct(netYield)}</p></div>
        <div className={resultBox}><p className="text-xs text-[var(--text-muted)]">Annual Net Income</p><p className="mt-1 font-mono text-xl font-semibold text-[var(--green)]">{fmt(netIncome)}</p></div>
        <div className={resultBox}><p className="text-xs text-[var(--text-muted)]">Payback Period</p><p className="mt-1 font-mono text-xl font-semibold text-[var(--amber)]">{payback > 0 ? `${payback.toFixed(1)} years` : "N/A"}</p></div>
      </div>
    </div>
  );
}

function DldCalc() {
  const [price, setPrice] = useState(3200000);
  const [propType, setPropType] = useState<"ready" | "offplan">("ready");
  const [hasMortgage, setHasMortgage] = useState(false);
  const [loanAmount, setLoanAmount] = useState(2560000);
  const [agentRate, setAgentRate] = useState(2);

  const dldFee = price * 0.04;
  const adminFee = propType === "ready" ? 580 : 40;
  const trusteeFeeBase = price > 500000 ? 4000 : 2000;
  const trusteeVat = trusteeFeeBase * 0.05;
  const trusteeFee = trusteeFeeBase + trusteeVat;
  const mortgageReg = hasMortgage ? loanAmount * 0.0025 : 0;
  const mortgageAdmin = hasMortgage ? 290 : 0;
  const agentComm = price * (agentRate / 100);
  const agentVat = agentComm * 0.05;
  const total = dldFee + adminFee + trusteeFee + mortgageReg + mortgageAdmin + agentComm + agentVat;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div><label className={labelClass}>Property Price (AED)</label><Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} /></div>
        <div>
          <label className={labelClass}>Property Type</label>
          <div className="flex gap-2 mt-1">
            <Button size="sm" variant={propType === "ready" ? "primary" : "secondary"} onClick={() => setPropType("ready")}>Ready</Button>
            <Button size="sm" variant={propType === "offplan" ? "primary" : "secondary"} onClick={() => setPropType("offplan")}>Off-Plan (Oqood)</Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={hasMortgage} onChange={e => setHasMortgage(e.target.checked)} className="accent-[var(--gold-500)]" id="mortgage-toggle" />
          <label htmlFor="mortgage-toggle" className="text-sm text-[var(--text-secondary)] cursor-pointer">With Mortgage</label>
        </div>
        {hasMortgage && <div><label className={labelClass}>Loan Amount (AED)</label><Input type="number" value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))} /></div>}
        <div><label className={labelClass}>Agent Commission (%)</label><Input type="number" step="0.1" value={agentRate} onChange={e => setAgentRate(Number(e.target.value))} /></div>
      </div>
      <div className="space-y-2">
        <div className="overflow-hidden rounded-lg border border-[var(--border-default)]">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-[var(--border-subtle)]"><td className="px-3 py-2 text-[var(--text-secondary)]">DLD Registration Fee (4%)</td><td className="px-3 py-2 text-right font-mono text-[var(--text-primary)]">{fmt(dldFee)}</td></tr>
              <tr className="border-b border-[var(--border-subtle)]"><td className="px-3 py-2 text-[var(--text-secondary)]">Admin Fee</td><td className="px-3 py-2 text-right font-mono text-[var(--text-primary)]">{fmt(adminFee)}</td></tr>
              <tr className="border-b border-[var(--border-subtle)]"><td className="px-3 py-2 text-[var(--text-secondary)]">Trustee Fee (+ 5% VAT)</td><td className="px-3 py-2 text-right font-mono text-[var(--text-primary)]">{fmt(trusteeFee)}</td></tr>
              {hasMortgage && <>
                <tr className="border-b border-[var(--border-subtle)]"><td className="px-3 py-2 text-[var(--text-secondary)]">Mortgage Registration (0.25%)</td><td className="px-3 py-2 text-right font-mono text-[var(--text-primary)]">{fmt(mortgageReg)}</td></tr>
                <tr className="border-b border-[var(--border-subtle)]"><td className="px-3 py-2 text-[var(--text-secondary)]">Mortgage Admin Fee</td><td className="px-3 py-2 text-right font-mono text-[var(--text-primary)]">{fmt(mortgageAdmin)}</td></tr>
              </>}
              <tr className="border-b border-[var(--border-subtle)]"><td className="px-3 py-2 text-[var(--text-secondary)]">Agent Commission</td><td className="px-3 py-2 text-right font-mono text-[var(--text-primary)]">{fmt(agentComm)}</td></tr>
              <tr className="border-b border-[var(--border-subtle)]"><td className="px-3 py-2 text-[var(--text-secondary)]">Agent VAT (5%)</td><td className="px-3 py-2 text-right font-mono text-[var(--text-primary)]">{fmt(agentVat)}</td></tr>
              <tr className="bg-[var(--bg-elevated)]"><td className="px-3 py-3 font-semibold text-[var(--text-primary)]">Total Acquisition Cost</td><td className="px-3 py-3 text-right font-mono text-lg font-bold text-[var(--text-gold)]">{fmt(total)}</td></tr>
            </tbody>
          </table>
        </div>
        <div className={`${resultBox} border border-[var(--border-gold)]`}>
          <p className="text-xs text-[var(--text-muted)]">Total With Property Price</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[var(--text-gold)]">{fmt(price + total)}</p>
        </div>
      </div>
    </div>
  );
}

interface Property {
  name: string;
  price: number;
  size: number;
  bedrooms: string;
  community: string;
}

function PriceCompare() {
  const [properties, setProperties] = useState<Property[]>([
    { name: "Property A", price: 3200000, size: 1800, bedrooms: "3", community: "Dubai Marina" },
    { name: "Property B", price: 2800000, size: 1500, bedrooms: "2", community: "Downtown Dubai" },
  ]);

  function update(idx: number, field: keyof Property, val: string | number) {
    setProperties(prev => prev.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  }
  function add() {
    if (properties.length >= 5) return;
    setProperties(prev => [...prev, { name: `Property ${String.fromCharCode(65 + prev.length)}`, price: 0, size: 0, bedrooms: "", community: "" }]);
  }
  function remove(idx: number) {
    if (properties.length <= 2) return;
    setProperties(prev => prev.filter((_, i) => i !== idx));
  }

  const bestPsf = properties.length ? Math.min(...properties.filter(p => p.size > 0).map(p => p.price / p.size)) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)]">Compare up to 5 properties side-by-side</p>
        <Button size="sm" variant="secondary" onClick={add} disabled={properties.length >= 5}><Plus size={14} /> Add</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-x-3">
          <thead><tr>
            <th className="text-left text-xs font-medium text-[var(--text-muted)] w-32">Field</th>
            {properties.map((p, i) => <th key={i} className="text-left min-w-[200px]">
              <div className="flex items-center gap-2">
                <Input value={p.name} onChange={e => update(i, "name", e.target.value)} className="font-semibold" />
                {properties.length > 2 && <button onClick={() => remove(i)} className="text-[var(--text-muted)] hover:text-[var(--red)]"><Minus size={14} /></button>}
              </div>
            </th>)}
          </tr></thead>
          <tbody>
            <tr><td className="py-2 text-[var(--text-muted)]">Price (AED)</td>{properties.map((p, i) => <td key={i} className="py-2"><Input type="number" value={p.price} onChange={e => update(i, "price", Number(e.target.value))} /></td>)}</tr>
            <tr><td className="py-2 text-[var(--text-muted)]">Size (sqft)</td>{properties.map((p, i) => <td key={i} className="py-2"><Input type="number" value={p.size} onChange={e => update(i, "size", Number(e.target.value))} /></td>)}</tr>
            <tr><td className="py-2 text-[var(--text-muted)]">Bedrooms</td>{properties.map((p, i) => <td key={i} className="py-2"><Input value={p.bedrooms} onChange={e => update(i, "bedrooms", e.target.value)} /></td>)}</tr>
            <tr><td className="py-2 text-[var(--text-muted)]">Community</td>{properties.map((p, i) => <td key={i} className="py-2"><Input value={p.community} onChange={e => update(i, "community", e.target.value)} /></td>)}</tr>
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto rounded-lg border border-[var(--border-default)]">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-[var(--border-default)] bg-[var(--bg-elevated)]">
            <th className="px-3 py-2 text-left text-xs text-[var(--text-muted)]">Metric</th>
            {properties.map((p, i) => <th key={i} className="px-3 py-2 text-right text-xs text-[var(--text-muted)]">{p.name}</th>)}
          </tr></thead>
          <tbody>
            <tr className="border-b border-[var(--border-subtle)]">
              <td className="px-3 py-2 text-[var(--text-secondary)]">Price / sqft</td>
              {properties.map((p, i) => {
                const psf = p.size > 0 ? p.price / p.size : 0;
                const isBest = psf > 0 && psf === bestPsf;
                return <td key={i} className={`px-3 py-2 text-right font-mono ${isBest ? "text-[var(--green)] font-semibold" : "text-[var(--text-primary)]"}`}>{psf > 0 ? fmt(psf) : "—"}{isBest && " ★"}</td>;
              })}
            </tr>
            <tr className="border-b border-[var(--border-subtle)]">
              <td className="px-3 py-2 text-[var(--text-secondary)]">DLD Fee (4%)</td>
              {properties.map((p, i) => <td key={i} className="px-3 py-2 text-right font-mono text-[var(--text-primary)]">{fmt(p.price * 0.04)}</td>)}
            </tr>
            <tr>
              <td className="px-3 py-2 text-[var(--text-secondary)]">Total Acquisition</td>
              {properties.map((p, i) => <td key={i} className="px-3 py-2 text-right font-mono font-semibold text-[var(--text-gold)]">{fmt(p.price * 1.04 + 4580)}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface RentalProp {
  name: string;
  price: number;
  annualRent: number;
  serviceCharge: number;
}

function RentalCompare() {
  const [props, setProps] = useState<RentalProp[]>([
    { name: "Property A", price: 3200000, annualRent: 180000, serviceCharge: 18000 },
    { name: "Property B", price: 2800000, annualRent: 160000, serviceCharge: 15000 },
  ]);

  function update(idx: number, field: keyof RentalProp, val: string | number) {
    setProps(prev => prev.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  }
  function add() {
    if (props.length >= 4) return;
    setProps(prev => [...prev, { name: `Property ${String.fromCharCode(65 + prev.length)}`, price: 0, annualRent: 0, serviceCharge: 0 }]);
  }
  function remove(idx: number) {
    if (props.length <= 2) return;
    setProps(prev => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)]">Compare rental yields across up to 4 properties</p>
        <Button size="sm" variant="secondary" onClick={add} disabled={props.length >= 4}><Plus size={14} /> Add</Button>
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${props.length}, 1fr)` }}>
        {props.map((p, i) => {
          const grossYield = p.price > 0 ? (p.annualRent / p.price) * 100 : 0;
          const netIncome = p.annualRent - p.serviceCharge;
          const netYield = p.price > 0 ? (netIncome / p.price) * 100 : 0;
          const payback = netIncome > 0 ? p.price / netIncome : 0;
          return (
            <Card key={i}>
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <Input value={p.name} onChange={e => update(i, "name", e.target.value)} className="font-semibold" />
                  {props.length > 2 && <button onClick={() => remove(i)} className="ml-2 text-[var(--text-muted)] hover:text-[var(--red)]"><Minus size={14} /></button>}
                </div>
                <div><label className={labelClass}>Price (AED)</label><Input type="number" value={p.price} onChange={e => update(i, "price", Number(e.target.value))} /></div>
                <div><label className={labelClass}>Annual Rent</label><Input type="number" value={p.annualRent} onChange={e => update(i, "annualRent", Number(e.target.value))} /></div>
                <div><label className={labelClass}>Service Charges/yr</label><Input type="number" value={p.serviceCharge} onChange={e => update(i, "serviceCharge", Number(e.target.value))} /></div>
                <div className="border-t border-[var(--border-default)] pt-3 space-y-2">
                  <div className="flex justify-between"><span className="text-xs text-[var(--text-muted)]">Gross Yield</span><span className="font-mono text-sm font-semibold text-[var(--blue)]">{fmtPct(grossYield)}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-[var(--text-muted)]">Net Yield</span><span className="font-mono text-sm font-bold text-[var(--text-gold)]">{fmtPct(netYield)}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-[var(--text-muted)]">Net Income/yr</span><span className="font-mono text-sm text-[var(--green)]">{fmt(netIncome)}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-[var(--text-muted)]">Payback</span><span className="font-mono text-sm text-[var(--amber)]">{payback > 0 ? `${payback.toFixed(1)}yr` : "—"}</span></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

const calculators: Record<TabId, () => ReactElement> = {
  commission: CommissionCalc,
  mortgage: MortgageCalc,
  roi: RoiCalc,
  dld: DldCalc,
  compare: PriceCompare,
  rental: RentalCompare,
};

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<TabId>("commission");
  const ActiveCalc = calculators[activeTab];

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-gold)]">Broker Calculator Suite</h2>
        <p className="text-sm text-[var(--text-muted)]">Commission, mortgage, ROI, DLD fees, and property comparison tools</p>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${isActive ? "bg-[var(--bg-elevated)] text-[var(--text-gold)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"}`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <Card>
        <CardContent className="pt-6">
          <ActiveCalc />
        </CardContent>
      </Card>
    </div>
  );
}
