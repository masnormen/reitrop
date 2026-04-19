import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function HistoryListSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="gap-0 border-muted">
        <CardContent>
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="group gap-0">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-4" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <Skeleton className="h-4 w-24" />
            </div>

            <div className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-12 w-20 rounded-lg" />
              <Skeleton className="h-12 w-20 rounded-lg" />
              <Skeleton className="h-12 w-20 rounded-lg" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
