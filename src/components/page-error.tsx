"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function PageError({
  error,
  reset,
  pageName,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  pageName: string;
}) {
  const isDbError =
    error.message.includes("database") ||
    error.message.includes("P1001") ||
    error.message.includes("DatabaseNotReachable") ||
    error.message.includes("connection");

  return (
    <div className="animate-fade-in flex items-center justify-center py-20">
      <Card className="max-w-md">
        <CardContent className="space-y-4 py-8 text-center">
          <AlertTriangle size={40} className="mx-auto text-[var(--amber)]" />
          <div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">
              Unable to load {pageName}
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {isDbError
                ? "Cannot connect to the database. Check that your Supabase project is active and environment variables are configured in Vercel."
                : "Something went wrong loading this page."}
            </p>
            {error.digest && (
              <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">
                Error: {error.digest}
              </p>
            )}
          </div>
          <div className="flex justify-center gap-3">
            <Button onClick={reset}>Try Again</Button>
            <Button variant="secondary" onClick={() => window.location.href = "/settings"}>
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
