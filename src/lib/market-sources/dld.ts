import type { MarketSource } from "./index";

/**
 * Dubai Land Department / Dubai REST adapter.
 * Production: RERA/DLD partnership — transaction register is the gold standard.
 * Set DLD_API_TOKEN. Alternative: Dubai Pulse open-data portal.
 */
export const dldSource: MarketSource = {
  id: "dld",
  name: "DLD / Dubai REST",
  async fetch() {
    const apiToken = process.env.DLD_API_TOKEN;
    if (!apiToken) return null;
    return null;
  },
};
