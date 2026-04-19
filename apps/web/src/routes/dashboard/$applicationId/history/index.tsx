import type { ApplicationId } from "@repo/sdk/types";

import {
  getApiV1AuthMeOptions,
  getApiV1DataByApplicationIdHistoryOptions,
  getApiV1DataByApplicationIdOptions,
} from "@repo/sdk/query";
import { zApplicationId } from "@repo/sdk/zod";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import dayjs from "dayjs";
import { sortBy } from "es-toolkit";
import { Clock, ArrowLeft, ChevronRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/dashboard/$applicationId/history/")({
  ssr: false,
  params: {
    parse: ({ applicationId }) => {
      const parseResult = zApplicationId.safeParse(applicationId);
      if (!parseResult.success) {
        throw notFound();
      }
      return { applicationId: parseResult.data };
    },
  },
  loader: async ({ context }) => {
    try {
      await context.queryClient.fetchQuery({ ...getApiV1AuthMeOptions(), retry: false });
    } catch {
      return redirect({ to: "/" });
    }
  },
  component: HistoryListPage,
});

function HistoryListPage() {
  const { applicationId } = Route.useParams();
  const { data: integration } = useQuery(
    getApiV1DataByApplicationIdOptions({ path: { application_id: applicationId } }),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-row items-center">
        <Link to="/dashboard/$applicationId" params={{ applicationId }}>
          <ArrowLeft className="mr-4 size-8" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {integration?.data.name || applicationId} / Version History
          </h1>
          <p className="text-muted-foreground">
            Version history for {integration?.data.name || applicationId} integration
          </p>
        </div>
      </div>

      <HistoryListContent applicationId={applicationId} />
    </div>
  );
}

function HistoryListContent({ applicationId }: { applicationId: ApplicationId }) {
  const { data: history, isLoading } = useQuery({
    ...getApiV1DataByApplicationIdHistoryOptions({
      path: { application_id: applicationId },
    }),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const events = sortBy(history?.data || [], [(event) => -new Date(event.createdAt).getTime()]);

  if (isLoading) {
    return <HistoryListSkeleton />;
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">No sync history available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="gap-0 border-muted">
        <CardContent>
          {events.length} event{events.length !== 1 ? "s" : ""} recorded
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {events.map((event) => {
          const totalChanges = event.added + event.updated + event.deleted;

          return (
            <Link
              key={event.version}
              to="/dashboard/$applicationId/history/$version"
              params={{ applicationId, version: event.version }}
            >
              <Card className="group gap-0 hover:border-primary/50">
                <div className="flex items-center justify-between border-b px-3 pb-3 transition-colors">
                  <div className="flex items-center gap-2">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Version {event.version}
                    </span>
                    <span className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {totalChanges} change{totalChanges !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{dayjs(event.createdAt).format("MMM DD, YYYY HH:mm")}</span>
                    <span>·</span>
                    <span>by {event.createdBy}</span>
                    <ChevronRight className="size-3" />
                  </div>
                </div>

                <div className="p-3">
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {event.added > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium text-green-700">{event.added}</span> added
                      </span>
                    )}
                    {event.updated > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium text-amber-700">{event.updated}</span> updated
                      </span>
                    )}
                    {event.deleted > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium text-red-700">{event.deleted}</span> deleted
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function HistoryListSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="gap-0 border-muted">
        <CardContent>
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="group gap-0">
            <div className="flex items-center justify-between border-b px-3 pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-3.5" />
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
              <Skeleton className="h-3 w-40" />
            </div>

            <div className="p-3">
              <Skeleton className="h-4 w-48" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
