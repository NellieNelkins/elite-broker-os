import type { MarketSource } from "./index";

/**
 * Bayut.com adapter (EMPG network).
 * Production: Partner API. Set BAYUT_API_KEY.
 */
export const bayutSource: MarketSource = {
  id: "bayut",
  name: "Bayut",
  async fetch() {
    const apiKey = process.env.BAYUT_API_KEY;
    if (!apiKey) return null;
    return null;
  },
};
