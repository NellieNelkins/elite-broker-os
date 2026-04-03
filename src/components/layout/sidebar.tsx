"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Building2,
  Target,
  BarChart3,
  MessageSquare,
  Brain,
  Megaphone,
  Newspaper,
  Zap,
  Bot,
  Briefcase,
  Calculator,
  Settings,
  LogOut,
  Clock,
  Bell,
  Upload,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Pipeline", href: "/pipeline", icon: TrendingUp },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Listings", href: "/listings", icon: Building2 },
  { label: "Discipline", href: "/coach", icon: Target },
  { label: "Forecast", href: "/dashboard/forecast", icon: BarChart3 },
  { label: "WhatsApp", href: "/whatsapp", icon: MessageSquare },
  { label: "Reminders", href: "/reminders", icon: Bell },
  { label: "Activity", href: "/activity", icon: Clock },
  { label: "Market", href: "/market", icon: Briefcase },
];

const toolItems = [
  { label: "Campaigns", href: "/campaigns", icon: Megaphone },
  { label: "Newsletter", href: "/campaigns/newsletter", icon: Newspaper },
  { label: "Listings Blast", href: "/campaigns/blast", icon: Zap },
  { label: "AI Agents", href: "/dashboard/agents", icon: Bot },
  { label: "Coach", href: "/coach", icon: Brain },
  { label: "Calculator", href: "/calculator", icon: Calculator },
  { label: "Import Data", href: "/import", icon: Upload },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-[var(--border-default)] bg-[var(--bg-deep)]">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-[var(--border-default)] px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--gold-500)] to-[var(--gold-700)]">
          <span className="text-sm font-bold text-[var(--bg-deepest)]">EB</span>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-[var(--text-gold)]">Elite Broker</h1>
          <p className="text-[10px] text-[var(--text-muted)]">OS v3 — Dubai 2026</p>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Sales
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-all duration-150",
                    isActive
                      ? "bg-[var(--bg-active)] text-[var(--text-gold)] shadow-[var(--shadow-sm)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <item.icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mb-2 mt-6 px-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Tools
        </p>
        <ul className="space-y-0.5">
          {toolItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-all duration-150",
                    isActive
                      ? "bg-[var(--bg-active)] text-[var(--text-gold)] shadow-[var(--shadow-sm)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <item.icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--border-default)] p-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
        >
          <Settings size={16} strokeWidth={1.5} />
          Settings
        </Link>
        <button
          onClick={() => {
            window.location.href = "/api/auth/signout";
          }}
          className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--red)]"
        >
          <LogOut size={16} strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
