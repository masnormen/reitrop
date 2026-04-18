import type { QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  CatchBoundary,
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { Navbar } from "@/components/navbar";
import appCss from "@/styles/app.css?url";

import "./-setup";
import { normalizeCssUrl } from "@/utils/normalize-css-url";

export interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [{ title: "Reitrop" }],
    links: [
      {
        rel: "stylesheet",
        href: normalizeCssUrl(appCss),
        suppressHydrationWarning: true,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "icon", href: "/favicon.png" },
      ...(import.meta.env.VITE_GA_ID || import.meta.env.VITE_GTM_ID
        ? [{ rel: "preconnect", href: "https://www.googletagmanager.com" }]
        : []),
    ],
  }),
  component: RootComponent,
  notFoundComponent: () => <div>Not Found</div>,
});

function RootComponent() {
  return (
    <RootDocument>
      <CatchBoundary getResetKey={() => "reset"}>
        <Navbar />
        <main className="bg-background mx-auto block min-h-screen w-full max-w-5xl pb-16">
          <Outlet />
        </main>

        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        {import.meta.env.DEV && <TanStackRouterDevtools initialIsOpen={false} />}
      </CatchBoundary>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div id="_top_" className="invisible h-0 w-0" />
        {children}
        <Scripts />
      </body>
    </html>
  );
}
