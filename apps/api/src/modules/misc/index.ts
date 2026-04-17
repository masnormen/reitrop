import { createRoute } from "@hono/zod-openapi";
import { jsonContentRequired } from "stoker/openapi/helpers";
import { z } from "zod";

import { createV1RouteApp } from "@/app/v1.factory";
import { errorContent, okRes, zOkRes } from "@/lib/response";
import { HttpStatusCodes } from "@/lib/status-code";

export const miscRoutes = createV1RouteApp()
  /**
   * =============================
   */
  .openapi(
    createRoute({
      tags: ["Misc"],
      summary: "Get Status",
      description: "Get ok status",
      method: "get",
      path: "/status",
      responses: {
        [HttpStatusCodes.OK]: jsonContentRequired(zOkRes(z.literal("ok")), "Returns ok status"),
      },
    }),
    async (c) => {
      return c.json(okRes("ok", c.var.requestId), 200);
    },
  )

  /**
   * =============================
   */
  .openapi(
    createRoute({
      tags: ["Misc"],
      summary: "Get Status with Params",
      description: "Get ok status",
      method: "get",
      path: "/status-with-params",
      request: {
        query: z.object({
          required: z.string().min(1),
          optional: z.string().min(1).optional(),
        }),
      },
      responses: {
        [HttpStatusCodes.OK]: jsonContentRequired(zOkRes(z.literal("ok")), "Returns ok status"),
        ...errorContent(["MALFORMED_INPUT"]),
      },
    }),
    async (c) => {
      return c.json(okRes("ok", c.var.requestId), HttpStatusCodes.OK);
    },
  );
