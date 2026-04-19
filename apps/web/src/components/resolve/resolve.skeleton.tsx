import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ResolveSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="gap-0 border-muted">
        <CardContent className="flex items-center justify-between px-4">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="group gap-0 pb-0!">
            <div className="flex items-center justify-between border-b px-3 pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-3.5" />
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
              <Skeleton className="h-6 w-20" />
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

      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="flex items-center justify-between p-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  );
}
