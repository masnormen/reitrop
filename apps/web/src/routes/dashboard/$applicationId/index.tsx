import type { ApplicationId } from "@repo/sdk/types";

import { getApiV1AuthMeOptions, getApiV1DataByApplicationIdOptions } from "@repo/sdk/query";
import { zApplicationId } from "@repo/sdk/zod";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import dayjs from "dayjs";
import { ArrowLeft, RefreshCcw, History } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusChip } from "@/components/ui/status-chip";

export const Route = createFileRoute("/dashboard/$applicationId/")({
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
  component: IntegrationDetailPage,
});

function IntegrationDetailPage() {
  const { applicationId } = Route.useParams();
  const { data: integration } = useQuery(
    getApiV1DataByApplicationIdOptions({ path: { application_id: applicationId } }),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-row items-center">
        <Link to="/dashboard">
          <ArrowLeft className="mr-4 size-8" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Integration Details</h1>
          <p className="text-muted-foreground">
            Manage your {integration?.data.name || applicationId} integration
          </p>
        </div>
      </div>

      <IntegrationDetailContent applicationId={applicationId} />
    </div>
  );
}

function IntegrationDetailContent({ applicationId }: { applicationId: ApplicationId }) {
  const { data: integration, isLoading } = useQuery({
    ...getApiV1DataByApplicationIdOptions({
      path: { application_id: applicationId },
    }),
  });

  if (isLoading) {
    return <IntegrationDetailSkeleton />;
  }

  if (!integration?.data) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Integration not found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{integration.data.emoji}</div>
              <div>
                <CardTitle className="text-2xl">{integration.data.name}</CardTitle>
                <p className="text-sm text-muted-foreground">ID: {integration.data.id}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/dashboard/$applicationId/history"
                params={{ applicationId }}
                className={buttonVariants({ size: "lg", variant: "secondary" })}
              >
                <History /> History
              </Link>
              <Link
                to="/dashboard/$applicationId/resolve"
                params={{
                  applicationId,
                }}
                className={buttonVariants({ size: "lg" })}
              >
                <RefreshCcw /> Sync Now
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="mt-1">
                <StatusChip status={integration.data.status} />
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Version</p>
              <p className="mt-1 text-sm">{integration.data.version}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Synced</p>
              <p className="mt-1 text-sm">
                {typeof integration.data.lastSyncedAt === "string"
                  ? dayjs().to(integration.data.lastSyncedAt)
                  : "Never"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function IntegrationDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="mt-2 h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
