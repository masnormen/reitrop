"use client";

import { getApiV1ApplicationsListOptions, getApiV1AuthMeOptions } from "@repo/sdk/query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { IntegrationsTable } from "@/components/integrations/integrations-table";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  loader: async ({ context }) => {
    try {
      await context.queryClient.fetchQuery({ ...getApiV1AuthMeOptions(), retry: false });
    } catch {
      return redirect({ to: "/" });
    }
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { data: user } = useQuery({ ...getApiV1AuthMeOptions(), retry: false });
  const { data: integrations, isLoading: isLoadingIntegrations } = useQuery({
    ...getApiV1ApplicationsListOptions(),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.data.name}!</p>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h2 className="mb-2 text-lg font-semibold">Profile Information</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Name:</span> {user?.data.name}
            </div>
            <div>
              <span className="font-medium">Email:</span> {user?.data.email}
            </div>
            <div>
              <span className="font-medium">Role:</span> {user?.data.role}
            </div>
            <div>
              <span className="font-medium">Status:</span> {user?.data.status}
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-2 text-lg font-semibold">Sync Status</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Total Integrations:</span>{" "}
              {integrations?.data?.length ?? 0}
            </div>
            <div>
              <span className="font-medium">Synced:</span>{" "}
              {integrations?.data?.filter((i) => i.status === "synced").length}
            </div>
            <div>
              <span className="font-medium">Conflicts:</span>{" "}
              {integrations?.data?.filter((i) => i.status === "conflict").length}
            </div>
            <div>
              <span className="font-medium">Errors:</span>{" "}
              {integrations?.data?.filter((i) => i.status === "error").length}
            </div>
          </div>
        </div>
      </div>

      <IntegrationsTable
        integrations={integrations?.data ?? []}
        isLoading={isLoadingIntegrations}
      />
    </div>
  );
}
