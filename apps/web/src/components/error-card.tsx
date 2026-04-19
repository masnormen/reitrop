import { isAxiosError } from "axios";
import { RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ErrorCard({ error, retry }: { error: unknown; retry?: () => void }) {
  const message = (() => {
    // 4xx
    if (isAxiosError(error) && error.status && error.status >= 400 && error.status < 500) {
      return "Failed to load sync data. This may be due to a missing configuration or an issue with the integration. Please check your integration settings and try again.";
    }
    // 502
    if (isAxiosError(error) && error.status === 502) {
      return "Failed to load sync data due to a gateway error. Integration client server may be down. Please check the integration's status and try again later.";
    }
    return "Failed to load sync data due to an error. This may be a temporary issue with our servers or the integration's servers. Please try again later.";
  })();

  return (
    <Card>
      <CardContent className="mx-auto flex max-w-lg flex-col items-center gap-2 py-8 text-center">
        <div className="flex items-center gap-2 font-semibold text-red-700">Error</div>
        <p className="text-sm text-muted-foreground">{message}</p>
        {retry && (
          <Button onClick={retry} className="min-w-0">
            <RefreshCcw />
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
