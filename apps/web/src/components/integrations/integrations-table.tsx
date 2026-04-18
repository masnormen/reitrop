import type { Integration } from "@repo/sdk/types";
import type { ColumnDef } from "@tanstack/react-table";

import { getApiV1DataListOptions } from "@repo/sdk/query";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useDebounce } from "ahooks";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";

interface IntegrationsTableProps {
  initialSearch?: string;
}

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

const columns: ColumnDef<Integration>[] = [
  {
    accessorKey: "name",
    header: "Service",
    size: 40,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <img
          src={`https://fav.farm/${encodeURIComponent(row.original.emoji)}`}
          alt=""
          className="h-8 w-8 rounded"
        />
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">ID: {row.original.id}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "lastSyncedAt",
    header: "Last Synced",
    size: 25,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatLastSynced(row.original.lastSyncedAt)}
      </span>
    ),
  },
  {
    accessorKey: "version",
    header: "Version",
    size: 25,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.version}</span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <Link
          type="button"
          className="text-sm font-medium text-primary hover:underline"
          to="/dashboard/$applicationId"
          params={{ applicationId: row.original.id }}
        >
          <Button>View Details</Button>
        </Link>
      </div>
    ),
  },
];

export function IntegrationsTable({ initialSearch }: IntegrationsTableProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(initialSearch ?? "");
  const debouncedSearchQuery = useDebounce(searchQuery, { wait: 500 });

  const { data: response, isLoading } = useQuery({
    ...getApiV1DataListOptions({
      query: {
        search: debouncedSearchQuery || undefined,
      },
    }),
  });

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

      <DataTable
        columns={columns}
        data={response?.data || []}
        isLoading={isLoading}
        bodyRowOptions={{
          onClick: (integration) => {
            void navigate({
              to: "/dashboard/$applicationId",
              params: { applicationId: integration.id },
            });
          },
          className: "cursor-pointer",
        }}
      />
    </div>
  );
}
