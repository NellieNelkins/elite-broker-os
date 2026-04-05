"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Bell, Wifi, Clock, TrendingUp, UserCheck, X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchPalette } from "./search-palette";
import { toast } from "sonner";

interface NotificationItem {
  id: string;
  type: "follow_up" | "deal" | "activity";
  title: string;
  description: string;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function typeIcon(type: string) {
  switch (type) {
    case "follow_up":
      return <UserCheck size={14} className="text-[var(--red)]" />;
    case "deal":
      return <TrendingUp size={14} className="text-[var(--text-gold)]" />;
    case "activity":
      return <Clock size={14} className="text-[var(--blue)]" />;
    default:
      return <Bell size={14} />;
  }
}

function typeBadgeVariant(type: string): "red" | "amber" | "blue" {
  switch (type) {
    case "follow_up":
      return "red";
    case "deal":
      return "amber";
    default:
      return "blue";
  }
}

export function Header() {
  const [time, setTime] = useState("");
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setCount(json.count);
          setItems(json.items);
        }
      })
      .catch(() => {
        // Silently fail — badge stays hidden
      });
  }, []);

  // Close on click outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, handleClickOutside]);

  function handleMarkAllRead() {
    setDismissed(true);
    setCount(0);
    setOpen(false);
    toast.success("All notifications marked as read");
  }

  const displayCount = dismissed ? 0 : count;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-[var(--border-default)] bg-[var(--bg-deep)]/80 px-4 backdrop-blur-md md:px-6">
      <button
        onClick={() => window.dispatchEvent(new Event("mobile-nav-open"))}
        className="rounded p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] md:hidden"
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>
      {/* Global Search */}
      <SearchPalette />

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
        <div className="relative" ref={panelRef}>
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            onClick={() => setOpen((prev) => !prev)}
          >
            <Bell size={16} />
            {displayCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--red)] text-[10px] font-bold text-white">
                {displayCount > 9 ? "9+" : displayCount}
              </span>
            )}
          </Button>

          {/* Dropdown panel */}
          {open && (
            <div
              className="absolute right-0 top-full mt-2 w-80 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-lg)]"
              style={{ zIndex: 50 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--border-default)] px-4 py-3">
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  Notifications
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Items */}
              <div className="max-h-80 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-[var(--text-muted)]">
                    No notifications
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 border-b border-[var(--border-default)] px-4 py-3 last:border-b-0 hover:bg-[var(--bg-elevated)]"
                    >
                      <div className="mt-0.5">{typeIcon(item.type)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-xs font-medium text-[var(--text-primary)]">
                            {item.title}
                          </span>
                          <Badge variant={typeBadgeVariant(item.type)} className="shrink-0 text-[9px]">
                            {item.type === "follow_up"
                              ? "Follow Up"
                              : item.type === "deal"
                                ? "Deal"
                                : "Activity"}
                          </Badge>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">
                          {item.description}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                          {timeAgo(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-[var(--border-default)] px-4 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
