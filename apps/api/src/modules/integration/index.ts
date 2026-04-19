import { createRoute, z } from "@hono/zod-openapi";
import dayjs from "dayjs";
import { sortBy } from "es-toolkit";
import { jsonContentRequired } from "stoker/openapi/helpers";

import { createV1RouteApp } from "@/app/v1.factory";
import { ApiError } from "@/lib/error";
import { errorContent, okRes, zOkRes } from "@/lib/response";
import { HttpStatusCodes } from "@/lib/status-code";
import { INTEGRATIONS, SYNC_EVENTS } from "@/mock";
import { ApplicationId, Integration, SyncAction, SyncData, SyncEvent } from "@/schema/integrations";

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
  syncActions: z.array(SyncAction),
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
          application_id: ApplicationId,
        }),
      },
      responses: {
        [HttpStatusCodes.OK]: jsonContentRequired(
          zOkRes(
            z.array(
              SyncEvent.pick({
                version: true,
                applicationId: true,
                createdAt: true,
                createdBy: true,
              }).extend({
                added: z.number(),
                updated: z.number(),
                deleted: z.number(),
              }),
            ),
          ),
          "Returns sync history",
        ),
      },
    }),
    async (c) => {
      const { application_id } = c.req.valid("param");

      const events = (SYNC_EVENTS[application_id] || []).map((event) => ({
        version: event.version,
        applicationId: event.applicationId,
        createdAt: event.createdAt,
        createdBy: event.createdBy,
        added: event.actions.filter(
          (a) => a.action === "accept" && a.syncChange.change_type === "ADD",
        ).length,
        updated: event.actions.filter(
          (a) => a.action === "accept" && a.syncChange.change_type === "UPDATE",
        ).length,
        deleted: event.actions.filter(
          (a) => a.action === "accept" && a.syncChange.change_type === "DELETE",
        ).length,
      }));

      return c.json(okRes(events, c.var.requestId), HttpStatusCodes.OK);
    },
  )
  /**
   * Get Sync History
   */
  .openapi(
    createRoute({
      tags: ["Integrations"],
      summary: "Get Sync History Detail",
      description: "Get detailed information about a specific sync event",
      method: "get",
      path: "/{application_id}/history/{version}",
      request: {
        params: z.object({
          application_id: ApplicationId,
          version: z.string(),
        }),
      },
      responses: {
        [HttpStatusCodes.OK]: jsonContentRequired(zOkRes(SyncEvent), "Returns sync event details"),
        ...errorContent(["NOT_FOUND"]),
      },
    }),
    async (c) => {
      const { application_id, version } = c.req.valid("param");

      const event = (SYNC_EVENTS[application_id] || []).find((event) => event.version === version);
      if (!event) {
        throw ApiError.NOT_FOUND;
      }

      return c.json(okRes(event, c.var.requestId), HttpStatusCodes.OK);
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
      const { syncActions } = c.req.valid("json");

      // Fetch current sync data to get the changes
      const externalUrl = new URL(EXTERNAL_API_URL);
      externalUrl.searchParams.set("application_id", application_id);

      const lastVersion =
        sortBy(SYNC_EVENTS[application_id] ?? [], ["version"]).at(-1)?.version || null;

      const version = (() => {
        const todayString = dayjs().format("YYYYMMDD");
        if (lastVersion && lastVersion.startsWith(todayString)) {
          const lastIncrement = parseInt(lastVersion.split(".")[1]!, 10);
          return `${todayString}.${String(lastIncrement + 1).padStart(2, "0")}`;
        }
        return `${todayString}.01`;
      })();

      const syncEvent: SyncEvent = {
        version,
        applicationId: application_id,
        actions: syncActions,
        createdAt: new Date().toISOString(),
        createdBy: c.var.session?.user.id || "",
      };

      // Store the event
      SYNC_EVENTS[application_id] ??= [];
      SYNC_EVENTS[application_id].push(syncEvent);

      // Update last sync result in integration data
      const integration = INTEGRATIONS.find((i) => i.id === application_id);
      if (integration) {
        integration.lastSyncedAt = new Date().toISOString();
      }

      return c.json(okRes(syncEvent, c.var.requestId), HttpStatusCodes.OK);
    },
  );

export default integrationRoutes;
