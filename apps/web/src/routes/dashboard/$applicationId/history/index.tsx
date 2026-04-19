import {
  getApiV1AuthMeOptions,
  getApiV1DataByApplicationIdHistoryOptions,
  getApiV1DataByApplicationIdOptions,
} from "@repo/sdk/query";
import { zApplicationId } from "@repo/sdk/zod";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { sortBy } from "es-toolkit";

import { ErrorCard } from "@/components/error-card";
import { HistoryListContent } from "@/components/history/history-list";
import { HistoryListSkeleton } from "@/components/history/history-list.skeleton";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

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

  const {
    data: history,
    status,
    error,
  } = useQuery({
    ...getApiV1DataByApplicationIdHistoryOptions({
      path: { application_id: applicationId },
    }),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const events = sortBy(history?.data || [], [(event) => -new Date(event.createdAt).getTime()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title={<>{integration?.data.name || applicationId} / Version History</>}
        description={`Version history for ${integration?.data.name || applicationId} integration`}
        backLinkProps={{
          to: "/dashboard/$applicationId",
          params: { applicationId },
        }}
      />

      {status === "pending" ? (
        <HistoryListSkeleton />
      ) : status === "error" ? (
        <ErrorCard error={error} />
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">No sync history available.</p>
          </CardContent>
        </Card>
      ) : (
        <HistoryListContent events={events} applicationId={applicationId} />
      )}
    </div>
  );
}
