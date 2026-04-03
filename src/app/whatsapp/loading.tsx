import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function WhatsappLoading() {
  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <Skeleton className="h-7 w-36" />
        <Skeleton className="mt-2 h-4 w-24" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-1">
          <CardContent className="space-y-3 py-4">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardContent className="flex h-[400px] flex-col justify-between py-4">
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                  <Skeleton className={`h-10 ${i % 2 === 0 ? "w-48" : "w-36"}`} />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
