import type { Integration } from "@repo/sdk/types";

import { useState, useMemo } from "react";

import { StatusBadge } from "./status-badge";

interface IntegrationsTableProps {
  integrations: Integration[];
}

export function IntegrationsTable({ integrations }: IntegrationsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIntegrations = useMemo(() => {
    if (!searchQuery) return integrations;
    const query = searchQuery.toLowerCase();
    return integrations.filter(
      (integration) =>
        integration.name.toLowerCase().includes(query) ||
        integration.id.toLowerCase().includes(query),
    );
  }, [integrations, searchQuery]);

  const formatLastSynced = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Integrations</h2>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-background ring-offset-background w-full rounded-md border border-input px-4 py-2 pl-10 text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          />
          <svg
            className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Integration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Last Synced
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Version
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredIntegrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    No integrations found matching "{searchQuery}"
                  </td>
                </tr>
              ) : (
                filteredIntegrations.map((integration) => (
                  <tr key={integration.id} className="transition-colors hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://fav.farm/${encodeURIComponent(integration.emoji)}`}
                          alt=""
                          className="h-8 w-8 rounded"
                        />
                        <div>
                          <div className="font-medium">{integration.name}</div>
                          <div className="text-xs text-muted-foreground">{integration.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={integration.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatLastSynced(integration.lastSyncedAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {integration.version}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredIntegrations.length} of {integrations.length} integration
        {integrations.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
