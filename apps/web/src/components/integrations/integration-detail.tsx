import type { Integration } from "@repo/sdk/types";

import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import { RefreshCcw, History } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";

export function IntegrationDetailContent({ integration }: { integration: Integration }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{integration.emoji}</div>
              <div>
                <CardTitle className="text-2xl">{integration.name}</CardTitle>
                <p className="text-sm text-muted-foreground">ID: {integration.id}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/dashboard/$applicationId/history"
                params={{ applicationId: integration.id }}
                className={buttonVariants({ size: "lg", variant: "secondary" })}
              >
                <History /> History
              </Link>
              <Link
                to="/dashboard/$applicationId/resolve"
                params={{
                  applicationId: integration.id,
                }}
                className={buttonVariants({ size: "lg" })}
              >
                <RefreshCcw /> Sync Now
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="mt-1">
                <StatusChip status={integration.status} />
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Version</p>
              <p className="mt-1 text-sm">{integration.version}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Synced</p>
              <p className="mt-1 text-sm">
                {typeof integration.lastSyncedAt === "string"
                  ? dayjs().to(integration.lastSyncedAt)
                  : "Never"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
