import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-fade-in">
      <div className="text-6xl font-bold text-[var(--text-gold)] opacity-30">404</div>
      <h2 className="mt-4 text-xl font-semibold text-[var(--text-primary)]">Page Not Found</h2>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/dashboard" className="mt-6">
        <Button variant="primary" size="md">Back to Dashboard</Button>
      </Link>
    </div>
  );
}
