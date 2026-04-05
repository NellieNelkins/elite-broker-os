import type { MarketSource } from "./index";

/**
 * DXBInteract.com adapter — DLD-backed analytics.
 *
 * No official public API. In production: commercial scraping via
 * partner/browser-automation service (Apify/Bright Data/ScrapingBee)
 * with rate limits and respect for robots.txt / ToS.
 * Set DXB_INTERACT_SCRAPE_URL to your scrape proxy endpoint.
 */
export const dxbInteractSource: MarketSource = {
  id: "dxbinteract",
  name: "DXB Interact",
  async fetch() {
    const scrapeUrl = process.env.DXB_INTERACT_SCRAPE_URL;
    if (!scrapeUrl) return null;
    // TODO: call scrape proxy, parse, return SourceDataPoint[]
    return null;
  },
};
