"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Shortcuts:
//   g then c  →  /contacts
//   g then p  →  /pipeline
//   g then l  →  /listings
//   g then d  →  /dashboard
//   g then v  →  /viewings
//   g then f  →  /forms
//   g then m  →  /market
//   n         →  quick new (opens create modal via custom event)
//   ?         →  show shortcut help toast

const GOTO_MAP: Record<string, string> = {
  c: "/contacts",
  p: "/pipeline",
  l: "/listings",
  d: "/dashboard",
  v: "/viewings",
  f: "/forms",
  m: "/market",
  o: "/documents",
};

export function KeyboardShortcuts() {
  const router = useRouter();
  const lastKeyRef = useRef<{ key: string; at: number } | null>(null);

  useEffect(() => {
    function isTyping(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable
      );
    }

    function handler(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping(e.target)) return;

      const key = e.key.toLowerCase();

      // chord: g + <letter>
      const last = lastKeyRef.current;
      if (last && last.key === "g" && Date.now() - last.at < 1200) {
        const dest = GOTO_MAP[key];
        lastKeyRef.current = null;
        if (dest) {
          e.preventDefault();
          router.push(dest);
        }
        return;
      }

      if (key === "g") {
        lastKeyRef.current = { key: "g", at: Date.now() };
        return;
      }

      if (key === "n") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("quick-new"));
      }

      if (key === "?") {
        e.preventDefault();
        toast.message("Keyboard shortcuts", {
          description:
            "⌘K search · g then c/p/l/d/v/f/m/o go to page · n new · ? help",
          duration: 6000,
        });
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  return null;
}
