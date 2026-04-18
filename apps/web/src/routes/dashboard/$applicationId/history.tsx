"use client";

import type { ApplicationId, SyncEvent } from "@repo/sdk/types";

import { getApiV1AuthMeOptions, getApiV1DataByApplicationIdHistoryOptions } from "@repo/sdk/query";
import { zApplicationId } from "@repo/sdk/zod";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { clsx } from "clsx";
import { sortBy } from "es-toolkit";
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/dashboard/$applicationId/history")({
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
  component: HistoryPage,
});

function HistoryPage() {
  const { applicationId } = Route.useParams();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-row items-center">
        <Link to="/dashboard/$applicationId" params={{ applicationId }}>
          <ArrowLeft className="mr-4 size-8" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Sync History</h1>
          <p className="text-muted-foreground">
            Version history and sync events for {applicationId} integration
          </p>
        </div>
      </div>

      <HistoryContent applicationId={applicationId} />
    </div>
  );
}

function HistoryContent({ applicationId }: { applicationId: ApplicationId }) {
  const { data: history, isLoading } = useQuery({
    ...getApiV1DataByApplicationIdHistoryOptions({
      path: { application_id: applicationId },
    }),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const events = sortBy(history?.data || [], [(event) => -new Date(event.timestamp).getTime()]);

  if (isLoading) {
    return <HistorySkeleton />;
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

      <div className="flex flex-col gap-6">
        {events.map((event) => (
          <HistoryEventRow key={`${event.syncId}-${event.id}`} event={event} />
        ))}
      </div>
    </div>
  );
}

interface HistoryEventRowProps {
  event: SyncEvent;
}

function HistoryEventRow({ event }: HistoryEventRowProps) {
  const [entity, field] = event.field_name.split(".");
  const statusConfig = {
    pending: {
      icon: Clock,
      label: "Pending",
      className: "bg-gray-100 text-gray-700 border-gray-200",
    },
    approved: {
      icon: CheckCircle,
      label: "Approved",
      className: "bg-green-100 text-green-700 border-green-200",
    },
    rejected: {
      icon: XCircle,
      label: "Rejected",
      className: "bg-red-100 text-red-700 border-red-200",
    },
    failed: {
      icon: AlertCircle,
      label: "Failed",
      className: "bg-orange-100 text-orange-700 border-orange-200",
    },
  };

  const config = statusConfig[event.status];
  const StatusIcon = config.icon;

  return (
    <Card className="group gap-0 pb-0!">
      <div className="flex items-center justify-between border-b px-3 pb-3">
        <div className="flex items-center gap-2">
          <StatusIcon className="size-3.5 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            {entity}.{field}
          </span>
          <span
            className={clsx(
              "rounded px-1.5 py-0.5 text-[10px] font-medium uppercase",
              config.className,
            )}
          >
            {config.label}
          </span>
          <span className="ml-2 rounded bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            v{event.version}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(event.timestamp).toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t px-3 py-4 text-xs">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Sync ID</p>
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
            {event.syncId.slice(0, 8)}...
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Resolved By</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{event.resolvedBy}</p>
        </div>

        {event.change_type === "ADD" && (
          <>
            <div className="col-span-2 mt-2">
              <p className="text-xs font-medium text-green-700">Added Value</p>
              <p className="mt-0.5 font-mono text-[11px] text-green-900">{event.new_value}</p>
            </div>
          </>
        )}

        {event.change_type === "DELETE" && (
          <>
            <div className="col-span-2 mt-2">
              <p className="text-xs font-medium text-red-700">Deleted Value</p>
              <p className="mt-0.5 font-mono text-[11px] text-red-900">{event.current_value}</p>
            </div>
          </>
        )}

        {event.change_type === "UPDATE" && (
          <>
            <div className="mt-2">
              <p className="text-xs font-medium text-orange-700">Previous</p>
              <p className="mt-0.5 font-mono text-[11px] text-orange-900">{event.current_value}</p>
            </div>
            <div className="mt-2">
              <p className="text-xs font-medium text-blue-700">New</p>
              <p className="mt-0.5 font-mono text-[11px] text-blue-900">{event.new_value}</p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-6">
      <Card className="gap-0 border-muted">
        <CardContent>
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="group gap-0 pb-0!">
            <div className="flex items-center justify-between border-b px-3 pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-3.5" />
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <Skeleton className="h-3 w-24" />
            </div>

            <div className="grid grid-cols-2 gap-4 border-t px-3 py-4">
              <div>
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-1 h-3 w-24" />
              </div>
              <div>
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-1 h-3 w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
