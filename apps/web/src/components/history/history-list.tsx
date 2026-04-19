import type { ApplicationId, GetApiV1DataByApplicationIdHistoryResponse } from "@repo/sdk/types";

import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import { Clock, ChevronRight, Plus, Minus, Edit3 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function HistoryListContent({
  events,
  applicationId,
}: {
  events: GetApiV1DataByApplicationIdHistoryResponse["data"];
  applicationId: ApplicationId;
}) {
  return (
    <div className="space-y-6">
      <Card className="gap-0 border-muted">
        <CardContent>
          {events.length} {events.length !== 1 ? "versions" : "version"} recorded
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {events.map((event) => {
          const totalChanges = event.added + event.updated + event.deleted;

          return (
            <Link
              key={event.version}
              to="/dashboard/$applicationId/history/$version"
              params={{ applicationId, version: event.version }}
            >
              <Card className="group gap-0 transition-all hover:border-primary/50 hover:bg-gray-100">
                <div className="flex items-center justify-between border-b px-4 pb-4 transition-colors">
                  <div className="flex items-center gap-3">
                    <Clock className="size-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">Version {event.version}</span>
                      <span className="text-xs text-muted-foreground">
                        {dayjs(event.createdAt).format("MMM DD, YYYY · HH:mm")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>by {event.createdBy}</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground" />
                  </div>
                </div>

                <div className="flex items-center gap-4 px-4 pt-4">
                  {event.added > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">
                      <Plus className="size-4 text-green-700" />
                      <div className="flex flex-col">
                        <span className="text-lg font-semibold text-green-700">{event.added}</span>
                        <span className="text-[10px] font-medium text-green-600 uppercase">
                          records added
                        </span>
                      </div>
                    </div>
                  )}
                  {event.updated > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2">
                      <Edit3 className="size-4 text-amber-700" />
                      <div className="flex flex-col">
                        <span className="text-lg font-semibold text-amber-700">
                          {event.updated}
                        </span>
                        <span className="text-[10px] font-medium text-amber-600 uppercase">
                          records updated
                        </span>
                      </div>
                    </div>
                  )}
                  {event.deleted > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
                      <Minus className="size-4 text-red-700" />
                      <div className="flex flex-col">
                        <span className="text-lg font-semibold text-red-700">{event.deleted}</span>
                        <span className="text-[10px] font-medium text-red-600 uppercase">
                          records deleted
                        </span>
                      </div>
                    </div>
                  )}
                  {totalChanges === 0 && (
                    <span className="text-xs text-muted-foreground">
                      No changes, but discarded changes are recorded for audit purposes. Click to
                      view details.
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
