import { cn } from "@/lib/utils";
import { type HTMLAttributes, forwardRef } from "react";

type BadgeVariant = "green" | "red" | "blue" | "violet" | "amber" | "gold" | "default";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  green: "badge-green",
  red: "badge-red",
  blue: "badge-blue",
  violet: "badge-violet",
  amber: "badge-amber",
  gold: "bg-[var(--gold-900)] text-[var(--text-gold)] border border-[var(--border-gold)]",
  default: "bg-[var(--bg-elevated)] text-[var(--text-secondary)]",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";
