import { getApiV1AuthMeOptions } from "@repo/sdk/query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { IntegrationsTable } from "@/components/integrations/integrations-table";
import { ProfileCard } from "@/components/profile-card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/dashboard/")({
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.data.name}!</p>
      </div>

      {user ? (
        <ProfileCard user={user.data} />
      ) : (
        <Skeleton className="mb-8 h-24 w-full rounded-lg" />
      )}

      <IntegrationsTable />
    </div>
  );
}
