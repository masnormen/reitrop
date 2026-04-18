"use client";

import type { ApplicationId, SyncChange } from "@repo/sdk/types";

import {
  getApiV1AuthMeOptions,
  getApiV1DataByApplicationIdOptions,
  getApiV1DataSyncOptions,
  postApiV1DataByApplicationIdResolveMutation,
} from "@repo/sdk/query";
import { zApplicationId } from "@repo/sdk/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { clsx } from "clsx";
import { sortBy } from "es-toolkit";
import { Check, X, FileDiff, Plus, Minus, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/dashboard/$applicationId/resolve")({
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
  component: ResolvePage,
});

function ResolvePage() {
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
          <h1 className="text-3xl font-bold">Resolve Changes</h1>
          <p className="text-muted-foreground">
            Review and resolve pending changes for {integration?.data.name || applicationId}{" "}
            integration
          </p>
        </div>
      </div>

      <ResolveContent applicationId={applicationId} />
    </div>
  );
}

function ResolveContent({ applicationId }: { applicationId: ApplicationId }) {
  const { data: syncData, isLoading } = useQuery({
    ...getApiV1DataSyncOptions({
      query: { application_id: applicationId },
    }),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const resolveMutation = useMutation(postApiV1DataByApplicationIdResolveMutation());
  const handleResolveIndividualChange = async (
    _change: SyncChange,
    _action: "approve" | "reject",
  ) => {};

  const changes = sortBy(syncData?.data?.sync_approval?.changes || [], [
    "field_name",
    "change_type",
  ]);

  if (isLoading) {
    return <ResolveSkeleton />;
  }

  if (!changes || changes.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">No pending changes to resolve.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="gap-0 border-muted">
        <CardContent>
          {changes.length} change{changes.length !== 1 ? "s" : ""} pending review
        </CardContent>
      </Card>
      <div className="flex flex-col gap-6">
        {changes.map((change) => (
          <ChangeRow
            key={change.id}
            change={change}
            onResolve={handleResolveIndividualChange}
            isPending={resolveMutation.isPending}
          />
        ))}
      </div>
    </div>
  );
}

interface ChangeRowProps {
  change: SyncChange;
  onResolve: (change: SyncChange, action: "approve" | "reject") => void;
  isPending: boolean;
}

function ChangeRow({ change, onResolve, isPending }: ChangeRowProps) {
  const [entity, field] = change.field_name.split(".");
  const isAddition = change.change_type === "ADD";
  const isDeletion = change.change_type === "DELETE";

  return (
    <Card className="group gap-0 pb-0!">
      <div className="flex items-center justify-between border-b px-3 pb-3">
        <div className="flex items-center gap-2">
          <FileDiff className="h-3.5 w-3.5 text-muted-foreground" />
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
        <div className="flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="outline"
            size="xs"
            onClick={() => onResolve(change, "reject")}
            disabled={isPending}
            className={clsx(
              "disabled:opacity-50",
              "text-muted-foreground hover:bg-red-100 hover:text-red-700",
            )}
          >
            <X className="size-3" />
            Reject
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={() => onResolve(change, "approve")}
            disabled={isPending}
            className={clsx(
              "disabled:opacity-50",
              "text-muted-foreground hover:bg-green-100 hover:text-green-700",
            )}
          >
            <Check className="size-3" />
            Approve
          </Button>
        </div>
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

function ResolveSkeleton() {
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
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>

            <div className="grid grid-cols-2">
              <div className="border-r px-3 py-4">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="size-3" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="mt-2 h-3 w-full" />
              </div>
              <div className="px-3 py-4">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="size-3" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="mt-2 h-3 w-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
