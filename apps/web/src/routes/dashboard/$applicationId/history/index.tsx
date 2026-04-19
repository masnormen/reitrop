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
import { Clock, ArrowLeft, ChevronRight, Plus, Minus, Edit3 } from "lucide-react";

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

      <div className="flex flex-col gap-3">
        {events.map((event) => {
          const totalChanges = event.added + event.updated + event.deleted;

          return (
            <Link
              key={event.version}
              to="/dashboard/$applicationId/history/$version"
              params={{ applicationId, version: event.version }}
            >
              <Card className="group gap-0 transition-all hover:border-primary/50 hover:shadow-md">
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
                    <span className="text-xs text-muted-foreground">No changes recorded</span>
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

function HistoryListSkeleton() {
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
