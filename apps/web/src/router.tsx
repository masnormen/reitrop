import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { Loader } from "lucide-react";

import TanstackQuery from "@/lib/query-ssr";
import { routeTree } from "@/routeTree.gen";

export function getRouter() {
  const rqContext = TanstackQuery.getContext();

  const router = createRouter({
    routeTree,
    context: { ...rqContext },
    defaultPreload: "intent",
    defaultHashScrollIntoView: true,
    scrollRestoration: true,
    scrollRestorationBehavior: "instant",
    defaultPendingComponent: () => (
      <div className="p-10">
        <Loader className="mx-auto animate-spin" />
      </div>
    ),
  });

  setupRouterSsrQueryIntegration({ router, queryClient: rqContext.queryClient });

  return router;
}
