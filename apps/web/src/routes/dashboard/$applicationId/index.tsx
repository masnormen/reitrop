import { getApiV1AuthMeOptions, getApiV1DataByApplicationIdOptions } from "@repo/sdk/query";
import { zApplicationId } from "@repo/sdk/zod";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

import { ErrorCard } from "@/components/error-card";
import { IntegrationDetailContent } from "@/components/integrations/integration-detail";
import { IntegrationDetailSkeleton } from "@/components/integrations/integration-detail.skeleton";
import { PageHeader } from "@/components/page-header";

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
  const {
    data: integration,
    status,
    error,
    refetch,
  } = useQuery(getApiV1DataByApplicationIdOptions({ path: { application_id: applicationId } }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title={integration?.data.name || applicationId}
        description={`Manage your ${integration?.data.name || applicationId} integration`}
        backLinkProps={{ to: "/dashboard" }}
      />

      {status === "pending" ? (
        <IntegrationDetailSkeleton />
      ) : status === "error" ? (
        <ErrorCard error={error} retry={refetch} />
      ) : (
        <IntegrationDetailContent integration={integration.data} />
      )}
    </div>
  );
}
