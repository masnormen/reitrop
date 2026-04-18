import { createRoute, z } from "@hono/zod-openapi";
import { jsonContentRequired } from "stoker/openapi/helpers";

import { createV1RouteApp } from "@/app/v1.factory";
import { HttpStatusCodes } from "@/lib/status-code";
import { SyncErrorResponse, SyncResponse } from "@/schema/data-sync";

const EXTERNAL_API_URL = "https://portier-takehometest.onrender.com/api/v1/data/sync";

const SyncQuerySchema = z.object({
  application_id: z.enum(["salesforce", "hubspot", "stripe", "slack", "zendesk", "intercom"]),
});

const dataRoutes = createV1RouteApp()
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

export default dataRoutes;
