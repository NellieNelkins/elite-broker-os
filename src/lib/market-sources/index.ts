/**
 * Market data source adapters.
 *
 * Each adapter implements a common interface so we can add/remove
 * sources without touching the refresh pipeline. Production adapters
 * need credentials (API keys or partner access):
 *
 *   - PropertyMonitor: commercial API (https://www.propertymonitor.com/api)
 *   - DXB Interact:    DLD-backed public analytics (scrape respectfully)
 *   - PropertyFinder:  Partner/Agent API
 *   - Bayut:           Partner API via EMPG
 *   - DLD / Dubai REST: Official transaction data (RERA partnership)
 *
 * Without credentials, adapters return `null` and the pipeline falls
 * back to the seed baseline. Wire real adapters by implementing
 * `fetch()` in each file and adding env vars in Vercel.
 */

export interface SourceDataPoint {
  communitySlug: string;
  bedrooms?: string;
  propertyType: string;
  pricePerSqft: number;
  avgPrice: number;
  rentalYield: number;
  transactions: number;
}

export interface MarketSource {
  id: string;
  name: string;
  fetch: (communitySlug: string) => Promise<SourceDataPoint[] | null>;
}

import { propertyMonitorSource } from "./property-monitor";
import { dxbInteractSource } from "./dxb-interact";
import { propertyFinderSource } from "./property-finder";
import { bayutSource } from "./bayut";
import { dldSource } from "./dld";

export const SOURCES: MarketSource[] = [
  propertyMonitorSource,
  dxbInteractSource,
  propertyFinderSource,
  bayutSource,
  dldSource,
];

export interface TaggedDataPoint extends SourceDataPoint {
  source: string;
}

export async function fetchAllSources(communitySlug: string): Promise<TaggedDataPoint[]> {
  const results = await Promise.allSettled(
    SOURCES.map(async s => {
      const data = await s.fetch(communitySlug);
      return (data ?? []).map(d => ({ ...d, source: s.id }));
    })
  );
  const out: TaggedDataPoint[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") out.push(...r.value);
  }
  return out;
}
