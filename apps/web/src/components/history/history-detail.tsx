import type { SyncEvent } from "@repo/sdk/types";

import dayjs from "dayjs";

import { ChangeDetailRow } from "@/components/history/change-detail-row";
import { Card, CardContent } from "@/components/ui/card";

export function HistoryDetailContent({ event }: { event: SyncEvent }) {
  const acceptedChanges = event.actions
    .filter((a) => a.action === "accept")
    .map((a) => a.syncChange);
  const discardedChanges = event.actions
    .filter((a) => a.action === "discard")
    .map((a) => a.syncChange);
  const allChanges = [...acceptedChanges, ...discardedChanges];

  return (
    <div className="space-y-6">
      <Card className="gap-0 border-muted">
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-xs text-muted-foreground">Version</span>
              <div className="font-mono text-sm font-medium">{event.version}</div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Created</span>
              <div className="text-sm font-medium">
                {dayjs(event.createdAt).format("MMM DD, YYYY HH:mm")}
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">By</span>
              <div className="text-sm font-medium">{event.createdBy}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
              {acceptedChanges.length} accepted
            </span>
            <span className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
              {discardedChanges.length} discarded
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {allChanges.map((change) => {
          const isDiscarded = discardedChanges.some((c) => c.id === change.id);
          return <ChangeDetailRow key={change.id} change={change} isDiscarded={isDiscarded} />;
        })}
      </div>
    </div>
  );
}
