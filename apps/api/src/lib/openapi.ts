import type { OpenAPIHono } from "@hono/zod-openapi";

import { Scalar } from "@scalar/hono-api-reference";
import z from "zod";
import { createSchema } from "zod-openapi";

import { ErrorSchema, zOkRes } from "@/lib/response";
import * as Schemas from "@/schema";

// oxlint-disable-next-line typescript/no-explicit-any
export function setupOpenAPI(app: OpenAPIHono<any>) {
  app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
    type: "http",
    scheme: "bearer",
  });

  app.openAPIRegistry.registerComponent(
    "schemas",
    "OkResponse",
    createSchema(zOkRes(z.any())).schema,
  );

  for (const [name, schema] of Object.entries(Schemas)) {
    app.openAPIRegistry.registerComponent("schemas", name, createSchema(schema).schema);
  }

  app.openAPIRegistry.registerComponent(
    "schemas",
    "ErrorResponse",
    createSchema(ErrorSchema).schema,
  );

  app
    .doc("/openapi.json", {
      openapi: "3.0.0",
      info: {
        title: "Starter API",
        description: "Starter API",
        version: "1.0.0",
      },
    })
    .get(
      "/docs",
      Scalar({
        pageTitle: "API Documentation",
        sources: [
          { url: "/api/openapi.json", title: "Main", default: true },
          { url: "/api/v1/auth/open-api/generate-schema", title: "Auth" },
        ],
        telemetry: false,
        theme: "elysiajs",
        orderRequiredPropertiesFirst: true,
        orderSchemaPropertiesBy: "preserve",
        operationsSorter: (
          a: { method: string; path: string },
          b: { method: string; path: string },
        ) => {
          if (a.path === b.path) {
            const methodOrder = ["get", "post", "put", "delete"];
            return (
              methodOrder.indexOf(a.method.toLowerCase()) -
              methodOrder.indexOf(b.method.toLowerCase())
            );
          }
          return a.path.localeCompare(b.path);
        },
      }),
    );
}
