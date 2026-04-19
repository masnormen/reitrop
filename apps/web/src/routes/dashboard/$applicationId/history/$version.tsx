import {
  getApiV1AuthMeOptions,
  getApiV1DataByApplicationIdHistoryByVersionOptions,
  getApiV1DataByApplicationIdOptions,
} from "@repo/sdk/query";
import { zApplicationId } from "@repo/sdk/zod";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

import { ErrorCard } from "@/components/error-card";
import { HistoryDetailContent } from "@/components/history/history-detail";
import { HistoryDetailSkeleton } from "@/components/history/history-detail.skeleton";
import { PageHeader } from "@/components/page-header";

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

  const {
    data: event,
    status,
    error,
  } = useQuery({
    ...getApiV1DataByApplicationIdHistoryByVersionOptions({
      path: { application_id: applicationId, version },
    }),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title={
          <>
            {integration?.data?.name || applicationId} / {version}
          </>
        }
        description={`Version ${version} for ${integration?.data?.name || applicationId} integration`}
        backLinkProps={{ to: "/dashboard/$applicationId/history", params: { applicationId } }}
      />

      {status === "pending" ? (
        <HistoryDetailSkeleton />
      ) : status === "error" ? (
        <ErrorCard error={error} />
      ) : !event?.data ? null : (
        <HistoryDetailContent event={event.data} />
      )}
    </div>
  );
}
