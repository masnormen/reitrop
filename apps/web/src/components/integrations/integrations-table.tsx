import type { Integration } from "@repo/sdk/types";
import type { ColumnDef } from "@tanstack/react-table";

import { getApiV1DataListOptions } from "@repo/sdk/query";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useDebounce } from "ahooks";
import dayjs from "dayjs";
import { Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { StatusChip } from "@/components/ui/status-chip";

interface IntegrationsTableProps {
  initialSearch?: string;
}

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
    accessorKey: "status",
    header: "Status",
    size: 20,
    cell: ({ row }) => <StatusChip status={row.original.status} />,
  },
  {
    accessorKey: "lastSyncedAt",
    header: "Last Synced",
    size: 25,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {typeof row.original.lastSyncedAt === "string"
          ? dayjs().to(row.original.lastSyncedAt)
          : "Never"}
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
          <IntegrationsTableSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
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

const IntegrationsTableSearch = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) => {
  return (
    <div className="relative w-64">
      <InputGroup>
        <InputGroupInput
          placeholder="Search integrations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <InputGroupAddon align="inline-end">
          <Search />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};
