import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function RemindersLoading() {
  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <Skeleton className="h-7 w-36" />
        <Skeleton className="mt-2 h-4 w-24" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="ml-auto h-4 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
