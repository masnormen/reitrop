import { createRoute, z } from "@hono/zod-openapi";
import { jsonContentRequired } from "stoker/openapi/helpers";

import { createV1RouteApp } from "@/app/v1.factory";
import { okRes, zOkRes } from "@/lib/response";
import { HttpStatusCodes } from "@/lib/status-code";
import { INTEGRATIONS, SYNC_EVENTS } from "@/mock";
import { ApplicationId, Integration, SyncChange, SyncData, SyncEvent } from "@/schema/integrations";

const EXTERNAL_API_URL = "https://portier-takehometest.onrender.com/api/v1/data/sync";

const SyncQuerySchema = z.object({
  application_id: ApplicationId,
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

export const ResolveRequest = z.object({
  syncChange: SyncChange,
  action: z.enum(["accept", "discard"]),
});

export const ResolveResponse = SyncEvent;

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
      tags: ["Integrations"],
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
  )
  /**
   * Get Integration Details
   */
  .openapi(
    createRoute({
      tags: ["Integrations"],
      summary: "Get Integration Details",
      description: "Get detailed information about a specific integration",
      method: "get",
      path: "/{application_id}",
      request: {
        params: z.object({
          application_id: z.string(),
        }),
      },
      responses: {
        [HttpStatusCodes.OK]: jsonContentRequired(
          zOkRes(Integration),
          "Returns integration details",
        ),
        [HttpStatusCodes.NOT_FOUND]: jsonContentRequired(
          z.object({ code: z.string(), message: z.string() }),
          "Integration not found",
        ),
      },
    }),
    async (c) => {
      const { application_id } = c.req.valid("param");

      const integration = INTEGRATIONS.find((i) => i.id === application_id);

      if (!integration) {
        return c.json(
          { code: "NOT_FOUND", message: "Integration not found" },
          HttpStatusCodes.NOT_FOUND,
        );
      }

      return c.json(okRes(integration, c.var.requestId), HttpStatusCodes.OK);
    },
  )
  /**
   * Get Sync History
   */
  .openapi(
    createRoute({
      tags: ["Integrations"],
      summary: "Get Sync History",
      description: "Get historical sync events for an integration",
      method: "get",
      path: "/{application_id}/history",
      request: {
        params: z.object({
          application_id: z.string(),
        }),
      },
      responses: {
        [HttpStatusCodes.OK]: jsonContentRequired(
          zOkRes(z.array(SyncEvent)),
          "Returns sync history",
        ),
      },
    }),
    async (c) => {
      const { application_id } = c.req.valid("param");

      const events = SYNC_EVENTS[application_id] || [];

      return c.json(okRes(events, c.var.requestId), HttpStatusCodes.OK);
    },
  )
  /**
   * Resolve Sync Changes
   */
  .openapi(
    createRoute({
      tags: ["Integrations"],
      summary: "Resolve Sync Changes",
      description: "Accept or discard sync changes",
      method: "post",
      path: "/{application_id}/resolve",
      request: {
        params: z.object({
          application_id: ApplicationId,
        }),
        body: {
          content: {
            "application/json": {
              schema: ResolveRequest,
            },
          },
        },
      },
      responses: {
        [HttpStatusCodes.OK]: jsonContentRequired(
          zOkRes(ResolveResponse),
          "Returns resolution result",
        ),
      },
    }),
    async (c) => {
      const { application_id } = c.req.valid("param");
      const { syncChange, action } = c.req.valid("json");

      // Fetch current sync data to get the changes
      const externalUrl = new URL(EXTERNAL_API_URL);
      externalUrl.searchParams.set("application_id", application_id);

      // Create sync event record
      const syncId = `sync_${Date.now()}_${application_id}`;
      const integration = INTEGRATIONS.find((i) => i.id === application_id);

      const syncEvent: SyncEvent = {
        syncId,
        applicationId: application_id,
        timestamp: new Date().toISOString(),
        status: action === "accept" ? "accepted" : "discarded",
        version: integration?.version || "unknown",
        resolvedBy: c.var.session?.user.id || "",
        ...syncChange,
      };

      // Store the event
      SYNC_EVENTS[application_id] ??= [];
      SYNC_EVENTS[application_id].push(syncEvent);

      return c.json(okRes(syncEvent, c.var.requestId), HttpStatusCodes.OK);
    },
  );

export default integrationRoutes;
