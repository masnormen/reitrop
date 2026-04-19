import type { ApplicationId, SyncChange } from "@repo/sdk/types";

import {
  getApiV1AuthMeOptions,
  getApiV1DataByApplicationIdHistoryByVersionOptions,
  getApiV1DataByApplicationIdOptions,
} from "@repo/sdk/query";
import { zApplicationId } from "@repo/sdk/zod";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { Check, X, ArrowLeft, Minus, Plus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/dashboard/$applicationId/history/$version")({
  ssr: false,
  params: {
    parse: ({ applicationId, version }) => {
      const parseResult = zApplicationId.safeParse(applicationId);
      if (!parseResult.success) {
        throw notFound();
      }
      return { applicationId: parseResult.data, version };
    },
  },
  loader: async ({ context }) => {
    try {
      await context.queryClient.fetchQuery({ ...getApiV1AuthMeOptions(), retry: false });
    } catch {
      return redirect({ to: "/" });
    }
  },
  component: HistoryDetailPage,
});

function HistoryDetailPage() {
  const { applicationId, version } = Route.useParams();

  const { data: integration } = useQuery(
    getApiV1DataByApplicationIdOptions({ path: { application_id: applicationId } }),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-row items-center">
        <Link to="/dashboard/$applicationId/history" params={{ applicationId }}>
          <ArrowLeft className="mr-4 size-8" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {integration?.data?.name || applicationId} / {version}
          </h1>
          <p className="text-muted-foreground">
            Version {version} for {integration?.data?.name || applicationId} integration
          </p>
        </div>
      </div>

      <HistoryDetailContent applicationId={applicationId} version={version} />
    </div>
  );
}

function HistoryDetailContent({
  applicationId,
  version,
}: {
  applicationId: ApplicationId;
  version: string;
}) {
  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    ...getApiV1DataByApplicationIdHistoryByVersionOptions({
      path: { application_id: applicationId, version },
    }),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });

  if (isLoading) {
    return <HistoryDetailSkeleton />;
  }

  if (error || !event?.data) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Event not found.</p>
        </CardContent>
      </Card>
    );
  }

  const acceptedChanges = event.data.actions
    .filter((a) => a.action === "accept")
    .map((a) => a.syncChange);
  const discardedChanges = event.data.actions
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
              <div className="font-mono text-sm font-medium">{event.data.version}</div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Created</span>
              <div className="text-sm font-medium">
                {dayjs(event.data.createdAt).format("MMM DD, YYYY HH:mm")}
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">By</span>
              <div className="text-sm font-medium">{event.data.createdBy}</div>
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

interface ChangeDetailRowProps {
  change: SyncChange;
  isDiscarded: boolean;
}

function ChangeDetailRow({ change, isDiscarded }: ChangeDetailRowProps) {
  const [entity, field] = change.field_name.split(".");
  const isAddition = change.change_type === "ADD";
  const isDeletion = change.change_type === "DELETE";

  return (
    <Card className={clsx("gap-0 pb-0!", isDiscarded && "border-red-200 bg-red-50/30")}>
      <div className="flex items-center justify-between border-b px-3 pb-3">
        <div className="flex items-center gap-2">
          {isDiscarded ? (
            <X className="size-4 text-red-700" />
          ) : (
            <Check className="size-4 text-green-700" />
          )}
          <span className="text-sm font-medium text-muted-foreground">
            {entity}.{field}
          </span>
          <span
            className={clsx(
              "rounded px-1.5 py-0.5 text-[10px] font-medium uppercase",
              isAddition && "bg-green-100 text-green-700",
              isDeletion && "bg-red-100 text-red-700",
              !isAddition && !isDeletion && "bg-amber-100 text-amber-700",
            )}
          >
            {change.change_type}
          </span>
        </div>
        {isDiscarded && (
          <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
            Discarded
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 text-xs">
        {isAddition ? (
          <>
            <div className="border-r border-dashed bg-muted/20 px-3 py-4 text-muted-foreground/50">
              <span className="text-muted-foreground/50">—</span>
            </div>
            <div className="bg-green-500/10 px-3 py-4">
              <div className="flex items-center gap-1.5 text-blue-700">
                <Plus className="h-3 w-3" />
                <span className="font-medium">new</span>
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-green-900">{change.new_value}</div>
            </div>
          </>
        ) : isDeletion ? (
          <>
            <div className="border-r bg-red-500/10 px-3 py-4">
              <div className="flex items-center gap-1.5 text-red-700">
                <Minus className="h-3 w-3" />
                <span className="font-medium">current</span>
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-red-900">
                {change.current_value}
              </div>
            </div>
            <div className="border-l border-dashed bg-muted/20 px-3 py-4 text-muted-foreground/50">
              <span className="text-muted-foreground/50">—</span>
            </div>
          </>
        ) : (
          <>
            <div className="border-r bg-red-500/10 px-3 py-4">
              <div className="flex items-center gap-1.5 text-red-700">
                <Minus className="h-3 w-3" />
                <span className="font-medium">current</span>
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-orange-900">
                {change.current_value}
              </div>
            </div>
            <div className="bg-green-500/10 px-3 py-4">
              <div className="flex items-center gap-1.5 text-blue-700">
                <Plus className="h-3 w-3" />
                <span className="font-medium">incoming</span>
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-green-900">{change.new_value}</div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

function HistoryDetailSkeleton() {
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
