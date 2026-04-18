import { createRoute, z } from "@hono/zod-openapi";
import { jsonContentRequired } from "stoker/openapi/helpers";

import { createV1RouteApp } from "@/app/v1.factory";
import { okRes, zOkRes } from "@/lib/response";
import { HttpStatusCodes } from "@/lib/status-code";
import { INTEGRATIONS } from "@/mock";
import { Integration, SyncData } from "@/schema/integrations";

const EXTERNAL_API_URL = "https://portier-takehometest.onrender.com/api/v1/data/sync";

const SyncQuerySchema = z.object({
  application_id: z.enum(["salesforce", "hubspot", "stripe", "slack", "zendesk", "intercom"]),
});

const SyncResponse = z.object({
  code: z.string(),
  message: z.string(),
  data: SyncData,
});

const SyncErrorResponse = z.object({
  code: z.string(),
  message: z.string(),
  error: z.string(),
});

const IntegrationListResponseSchema = z.array(Integration);

const integrationRoutes = createV1RouteApp()
  /**
   * Get Applications List
   */
  .openapi(
    createRoute({
      tags: ["Integrations"],
      summary: "Get Integrations List",
      description: "Get list of all integrations with their sync status",
      method: "get",
      path: "/list",
      request: {
        query: z.object({
          search: z.string().optional(),
        }),
      },
      responses: {
        [HttpStatusCodes.OK]: jsonContentRequired(
          zOkRes(IntegrationListResponseSchema),
          "Returns list of integrations",
        ),
      },
    }),
    async (c) => {
      const { search } = c.req.valid("query");

      let filteredIntegrations = INTEGRATIONS;
      if (search) {
        const query = search.toLowerCase();
        filteredIntegrations = INTEGRATIONS.filter(
          (integration) =>
            integration.name.toLowerCase().includes(query) ||
            integration.id.toLowerCase().includes(query),
        );
      }

      return c.json(okRes(filteredIntegrations, c.var.requestId), HttpStatusCodes.OK);
    },
  )
  /**
   * Get Data Sync
   */
  .openapi(
    createRoute({
      tags: ["Data"],
      summary: "[EXTERNAL] Get Data Sync",
      description: "Proxy to external API to get sync approval data for an application",
      method: "get",
      path: "/sync",
      request: {
        query: SyncQuerySchema,
      },
      responses: {
        [HttpStatusCodes.OK]: jsonContentRequired(
          SyncResponse,
          "Returns sync approval data from external API",
        ),
        [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContentRequired(
          SyncErrorResponse,
          "External API error response",
        ),
      },
    }),
    async (c) => {
      const { application_id } = c.req.valid("query");

      const externalUrl = new URL(EXTERNAL_API_URL);
      externalUrl.searchParams.set("application_id", application_id);

      const response = await fetch(externalUrl.toString());

      const data = await response.json();

      const parsedData = z.union([SyncResponse, SyncErrorResponse]).safeParse(data);
      if (!parsedData.success) {
        return c.json(data, 500);
      }

      if ("error" in parsedData.data) {
        return c.json(parsedData.data, HttpStatusCodes.INTERNAL_SERVER_ERROR);
      }

      return c.json(parsedData.data, HttpStatusCodes.OK);
    },
  );

export default integrationRoutes;
