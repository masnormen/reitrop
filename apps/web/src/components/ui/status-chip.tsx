import type { Integration } from "@repo/sdk/types";

import { clsx, type ClassValue } from "clsx";

type IntegrationStatus = Integration["status"];

const statusConfig: Record<IntegrationStatus, { label: string; className: ClassValue }> = {
  synced: {
    label: "Synced",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  syncing: {
    label: "Syncing",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  conflict: {
    label: "Conflict",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  error: {
    label: "Error",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

export function StatusChip({ status }: { status: IntegrationStatus }) {
  const config = statusConfig[status];

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
