import { createRouter } from "@tanstack/react-router";

import { routeTree } from "@/routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultStaleTime: Infinity,
    defaultHashScrollIntoView: true,
    scrollRestoration: true,
    scrollRestorationBehavior: "instant",
  });
}
