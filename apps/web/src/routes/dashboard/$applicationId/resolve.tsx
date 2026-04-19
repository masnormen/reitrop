import type { SyncChange } from "@repo/sdk/types";
import type { AxiosError } from "axios";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  getApiV1AuthMeOptions,
  getApiV1DataByApplicationIdHistoryOptions,
  getApiV1DataByApplicationIdOptions,
  getApiV1DataListOptions,
  getApiV1DataSyncOptions,
  postApiV1DataByApplicationIdResolveMutation,
} from "@repo/sdk/query";
import { zApplicationId, zSyncChange } from "@repo/sdk/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { clsx } from "clsx";
import { sortBy } from "es-toolkit";
import { Check, X, FileDiff, Plus, Minus, ArrowLeft, Trash2, RefreshCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { confirm } from "@/components/ui/confirm";
import { Skeleton } from "@/components/ui/skeleton";

const ResolveChange = zSyncChange
  .pick({
    id: true,
    change_type: true,
    field_name: true,
    current_value: true,
    new_value: true,
  })
  .extend({
    action: z
      .enum(["accept", "discard"])
      .nullable()
      .refine((action) => (action != null) as boolean, {
        message: "Action is required",
      }),
  });
type ResolveChange = z.infer<typeof ResolveChange>;

const ResolveFormSchema = z.record(z.string(), ResolveChange);
type ResolveFormSchema = z.infer<typeof ResolveFormSchema>;

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

  const {
    data: syncData,
    status: syncDataStatus,
    error: syncDataError,
    isFetching: isSyncDataFetching,
    refetch: refetchSyncData,
  } = useQuery({
    ...getApiV1DataSyncOptions({
      query: { application_id: applicationId },
    }),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });

  const changes = sortBy(syncData?.data?.sync_approval?.changes || [], [
    "field_name",
    "change_type",
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-row items-center">
        <Link to="/dashboard/$applicationId" params={{ applicationId }}>
          <ArrowLeft className="mr-4 size-8" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {integration?.data.name || applicationId} / Resolve Changes
          </h1>
          <p className="text-muted-foreground">
            Review and resolve pending changes for {integration?.data.name || applicationId}{" "}
            integration
          </p>
        </div>
      </div>

      {syncDataStatus === "pending" || isSyncDataFetching ? (
        <ResolveSkeleton />
      ) : syncDataStatus === "error" ? (
        <ResolveError error={syncDataError} retry={refetchSyncData} />
      ) : (
        <ResolveContent changes={changes} />
      )}
    </div>
  );
}

function ResolveError({
  error,
  retry,
}: {
  error: AxiosError<{
    code: string;
    message: string;
    error: string;
  }>;
  retry?: () => void;
}) {
  const message = (() => {
    // 4xx
    if (error?.response && error?.response?.status >= 400 && error?.response?.status < 500) {
      return "Failed to load sync data. This may be due to a missing configuration or an issue with the integration. Please check your integration settings and try again.";
    }
    // 502
    if (error?.response && error?.response?.status === 502) {
      return "Failed to load sync data due to a gateway error. Integration client server may be down. Please check the integration's status and try again later.";
    }
    return "Failed to load sync data due to an error. This may be a temporary issue with our servers or the integration's servers. Please try again later.";
  })();

  return (
    <Card>
      <CardContent className="mx-auto flex max-w-lg flex-col items-center gap-2 py-8 text-center">
        <div className="flex items-center gap-2 font-semibold text-red-700">Error</div>
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button onClick={retry} className="min-w-0">
          <RefreshCcw />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

function ResolveContent({ changes }: { changes: SyncChange[] }) {
  const { applicationId } = Route.useParams();
  const navigate = Route.useNavigate();

  const {
    handleSubmit,
    setValue,
    control,
    formState: { isSubmitting },
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(ResolveFormSchema),
    defaultValues: changes.reduce(
      (acc, change) => {
        acc[change.id] = {
          id: change.id,
          change_type: change.change_type,
          field_name: change.field_name,
          current_value: change.current_value,
          new_value: change.new_value,
          action: null,
        };
        return acc;
      },
      {} as Record<string, ResolveChange>,
    ),
  });

  const resolveMutation = useMutation({
    ...postApiV1DataByApplicationIdResolveMutation(),
    onSuccess: async (_data, _var, _, context) => {
      // Invalidate history queries
      await context.client.invalidateQueries({
        queryKey: getApiV1DataByApplicationIdHistoryOptions({
          path: { application_id: applicationId },
        }).queryKey,
      });
      // Invalidate integration details query to update last synced at
      await context.client.invalidateQueries({
        queryKey: getApiV1DataByApplicationIdOptions({
          path: { application_id: applicationId },
        }).queryKey,
      });
      // Invalidate application list
      await context.client.invalidateQueries({
        queryKey: getApiV1DataListOptions().queryKey,
      });
    },
  });

  const watchedValues = useWatch({
    control,
  });

  const renderedChanges = changes.map((change) => ({
    ...change,
    action: watchedValues[change.id]?.action || null,
  }));

  const onSubmit = async (data: Record<string, ResolveChange>) => {
    // Validate that all changes have an action selected
    if (Object.values(data).some((v) => v.action == null)) {
      await confirm({
        title: "Unresolved Changes",
        content:
          "Some changes do not have an action selected. Please choose an action for all changes before submitting.",
      });
      return;
    }

    const confirmed = await confirm({
      title: "Submit Resolutions",
      content: "Are you sure you want to submit your resolutions?",
    });
    if (!confirmed) return;

    await resolveMutation.mutateAsync({
      path: { application_id: applicationId },
      body: {
        syncActions: Object.values(data).map(({ action, ...change }) => ({
          syncChange: change,
          action: action!,
        })),
      },
    });

    await confirm({
      title: "Resolutions Submitted",
      content: "Your resolutions have been submitted successfully.",
    });
    await navigate({ to: "/dashboard/$applicationId/history", params: { applicationId } });
  };

  const onError = () => {
    void confirm({
      title: "Error",
      content: "Please choose an action for all changes before submitting.",
    });
  };

  const handleAcceptAll = () => {
    changes.forEach((change) => {
      setValue(`${change.id}.action`, "accept");
    });
  };

  const handleDiscardAll = () => {
    changes.forEach((change) => {
      setValue(`${change.id}.action`, "discard");
    });
  };

  if (!changes || changes.length === 0) {
    return (
      <Card>
        <CardContent className="px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">No pending changes to resolve.</p>
        </CardContent>
      </Card>
    );
  }

  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  // detect when headerRef is on top of the viewport (stickying)
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [isFooterSticky, setIsFooterSticky] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const { top } = headerRef.current.getBoundingClientRect();
        setIsHeaderSticky(top <= 0);
      }
      if (footerRef.current) {
        const { bottom } = footerRef.current.getBoundingClientRect();
        setIsFooterSticky(bottom >= window.innerHeight);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="relative space-y-6">
      <Card
        ref={headerRef}
        className={clsx(
          "sticky top-0 gap-0 border-muted",
          isHeaderSticky && "rounded-t-none! shadow-lg",
        )}
      >
        <CardContent className="flex items-center justify-between px-4">
          <span>
            {changes.length} change{changes.length !== 1 ? "s" : ""} pending review
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDiscardAll}
              className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
            >
              <X className="mr-2 size-4" />
              Discard All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAcceptAll}
              className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
            >
              <Check className="mr-2 size-4" />
              Accept All
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        {renderedChanges.map((change) => (
          <ChangeRow
            key={change.id}
            change={change}
            value={change.action}
            onActionChange={(action) => setValue(`${change.id}.action`, action)}
          />
        ))}
      </div>

      <Card
        ref={footerRef}
        className={clsx(
          "sticky bottom-0 border-primary/50 bg-taupe-50",
          isFooterSticky && "rounded-b-none! shadow-lg",
        )}
      >
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="font-medium">Summary:</p>
            <p className="text-sm text-muted-foreground">
              {Object.values(watchedValues).filter((v) => v?.action === "accept").length} accepted,{" "}
              {Object.values(watchedValues).filter((v) => v?.action === "discard").length}{" "}
              discarded, from {changes.length} total changes.
            </p>
          </div>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            Submit Resolutions
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

interface ChangeRowProps {
  change: SyncChange;
  value: "accept" | "discard" | null;
  onActionChange: (action: "accept" | "discard" | null) => void;
}

function ChangeRow({ change, value, onActionChange }: ChangeRowProps) {
  const [entity, field] = change.field_name.split(".");
  const isAddition = change.change_type === "ADD";
  const isDeletion = change.change_type === "DELETE";

  return (
    <Card className="group gap-0 pb-0!">
      <div className="flex items-center justify-between border-b px-3 pb-3">
        <div className="flex items-center gap-2">
          {value == null ? (
            <FileDiff className="size-4 text-muted-foreground" />
          ) : value === "accept" ? (
            <Check className="size-4 text-green-700" />
          ) : (
            <Trash2 className="size-4 text-red-700" />
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

        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => onActionChange(value === "discard" ? null : "discard")}
            className={clsx(
              "flex h-6 items-center gap-1 rounded px-2 text-[10px] font-medium transition-all",
              "border",
              value === "discard"
                ? "border-red-500 bg-red-500 text-white"
                : "border-transparent bg-muted/50 text-muted-foreground hover:bg-red-100 hover:text-red-700",
            )}
          >
            <X className="size-3" />
            Discard
          </button>
          <button
            type="button"
            onClick={() => onActionChange(value === "accept" ? null : "accept")}
            className={clsx(
              "flex h-6 items-center gap-1 rounded px-2 text-[10px] font-medium transition-all",
              "border",
              value === "accept"
                ? "border-green-500 bg-green-500 text-white"
                : "border-transparent bg-muted/50 text-muted-foreground hover:bg-green-100 hover:text-green-700",
            )}
          >
            <Check className="size-3" />
            Accept
          </button>
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
        <CardContent className="flex items-center justify-between p-4">
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
