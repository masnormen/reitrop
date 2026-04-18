import type { SyncStatus } from "@repo/sdk/types";

interface StatusBadgeProps {
  status: SyncStatus;
}

const statusConfig = {
  synced: {
    label: "Synced",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  },
  syncing: {
    label: "Syncing",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  },
  conflict: {
    label: "Conflict",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  },
  error: {
    label: "Error",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.error;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
