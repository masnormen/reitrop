import {
  getApiV1AuthMeOptions,
  getApiV1DataByApplicationIdOptions,
  getApiV1DataSyncOptions,
} from "@repo/sdk/query";
import { zApplicationId } from "@repo/sdk/zod";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { sortBy } from "es-toolkit";

import { ErrorCard } from "@/components/error-card";
import { PageHeader } from "@/components/page-header";
import { ResolveContent } from "@/components/resolve/resolve";
import { ResolveSkeleton } from "@/components/resolve/resolve.skeleton";

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
    retry: false,
  });

  const changes = sortBy(syncData?.data?.sync_approval?.changes || [], [
    "field_name",
    "change_type",
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title={<>{integration?.data.name || applicationId} / Resolve Changes</>}
        description={`Review and resolve pending changes for ${integration?.data.name || applicationId} integration`}
        backLinkProps={{ to: "/dashboard/$applicationId", params: { applicationId } }}
      />

      {syncDataStatus === "pending" || isSyncDataFetching ? (
        <ResolveSkeleton />
      ) : syncDataStatus === "error" ? (
        <ErrorCard error={syncDataError} retry={refetchSyncData} />
      ) : (
        <ResolveContent changes={changes} />
      )}
    </div>
  );
}
