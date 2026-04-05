import type { MarketSource } from "./index";

/**
 * PropertyFinder.ae adapter.
 * Production: Partner/Agent API. Set PROPERTY_FINDER_API_KEY.
 */
export const propertyFinderSource: MarketSource = {
  id: "propertyfinder",
  name: "PropertyFinder",
  async fetch() {
    const apiKey = process.env.PROPERTY_FINDER_API_KEY;
    if (!apiKey) return null;
    return null;
  },
};
