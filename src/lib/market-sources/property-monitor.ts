import type { MarketSource } from "./index";

/**
 * PropertyMonitor.ae adapter.
 *
 * Production: commercial API — requires API key.
 * Set PROPERTY_MONITOR_API_KEY in env and implement fetch() below.
 * Docs: https://www.propertymonitor.com/api
 */
export const propertyMonitorSource: MarketSource = {
  id: "propertymonitor",
  name: "Property Monitor",
  async fetch() {
    const apiKey = process.env.PROPERTY_MONITOR_API_KEY;
    if (!apiKey) return null;
    // TODO: implement GET /v1/communities/{slug}/metrics
    // Expected response → transform to SourceDataPoint[]
    return null;
  },
};
