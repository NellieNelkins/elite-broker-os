"use client";

import { useEffect, useState } from "react";
import { Bell, Search, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("en-AE", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Dubai",
        })
      );
    };
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-deep)]/80 px-6 backdrop-blur-md">
      {/* Search */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
        <Input
          placeholder="Search contacts, deals..."
          className="h-8 bg-[var(--bg-surface)] pl-9 text-xs"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Sync status */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Wifi size={12} className="text-[var(--green)]" />
          <span>Synced</span>
        </div>

        {/* Dubai time */}
        <div className="font-mono text-xs text-[var(--text-secondary)]">{time} GST</div>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell size={16} />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--red)] text-[10px] font-bold text-white">
            3
          </span>
        </Button>
      </div>
    </header>
  );
}
