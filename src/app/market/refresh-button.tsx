"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function RefreshMarketButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/market/refresh");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Refresh failed");
      toast.success(`Refreshed: ${data.seeded} communities, ${data.ingested} data points`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={refresh} disabled={loading} size="md" variant="secondary">
      <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
      {loading ? "Refreshing..." : "Refresh Now"}
    </Button>
  );
}
