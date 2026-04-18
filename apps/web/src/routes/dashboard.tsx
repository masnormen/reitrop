"use client";

import { getApiV1AuthMeOptions } from "@repo/sdk/query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  loader: async ({ context }) => {
    try {
      await context.queryClient.fetchQuery(getApiV1AuthMeOptions());
    } catch {
      return redirect({ to: "/" });
    }
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { data: user } = useQuery(getApiV1AuthMeOptions());

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.data.name}!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          <h2 className="mb-2 text-lg font-semibold">Quick Actions</h2>
          <p className="text-sm text-muted-foreground">More features coming soon...</p>
        </div>
      </div>
    </div>
  );
}
