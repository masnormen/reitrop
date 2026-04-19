import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function HistoryDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="gap-0 border-muted">
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="gap-0 pb-0!">
            <div className="flex items-center justify-between border-b px-3 pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-3.5" />
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
              <Skeleton className="h-4 w-16 rounded" />
            </div>

            <div className="grid grid-cols-2">
              <div className="border-r px-3 py-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-1 h-3 w-full" />
              </div>
              <div className="px-3 py-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-1 h-3 w-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
