import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-2 h-4 w-32" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-4 w-24" /></CardHeader>
            <CardContent><Skeleton className="h-8 w-32" /></CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="py-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
        <Card><CardContent className="py-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
      </div>
    </div>
  );
}
