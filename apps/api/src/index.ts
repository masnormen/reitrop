import { serve } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";

import { createV1App } from "@/app/v1.factory";
import { env } from "@/env";
import { setupCatchError } from "@/lib/error";
import { pinoInstance } from "@/lib/logger";
import { setupOpenAPI } from "@/lib/openapi";
import applicationsRoutes from "@/modules/applications/index";
import { authRoutes } from "@/modules/auth/index";
import { miscRoutes } from "@/modules/misc/index";

const v1App = createV1App()
  .route("/auth", authRoutes)
  .route("/misc", miscRoutes)
  .route("/applications", applicationsRoutes);

export const app = new OpenAPIHono().basePath("/api").route("/v1", v1App);

/**
 * Setup OpenAPI and API Documentation
 */
setupCatchError(app);
await setupOpenAPI(app);

const port = Number(env.API_PORT || env.PORT || 4200);
const server = serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    pinoInstance.info(`✅ Server started on -> http://localhost:${info.port}`);
    pinoInstance.info(`✅ API docs -> http://localhost:${info.port}/api/docs`);
  },
);

const gracefulShutdown = () => {
  server.close((err: unknown) => {
    if (err) {
      pinoInstance.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
};

process.on("SIGINT", () => gracefulShutdown());
process.on("SIGTERM", () => gracefulShutdown());

export type BackendApp = typeof app;
