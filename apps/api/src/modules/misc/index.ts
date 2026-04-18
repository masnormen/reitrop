import { createRoute } from "@hono/zod-openapi";
import { jsonContentRequired } from "stoker/openapi/helpers";
import { z } from "zod";

import { createV1RouteApp } from "@/app/v1.factory";
import { okRes, zOkRes } from "@/lib/response";
import { HttpStatusCodes } from "@/lib/status-code";
import * as MOCK_DB from "@/mock";

export const miscRoutes = createV1RouteApp()
  /**
   * =============================
   */
  .openapi(
    createRoute({
      tags: ["Misc"],
      summary: "Get Debug",
      description: "Get debug info",
      method: "get",
      path: "/debug",
      responses: {
        [HttpStatusCodes.OK]: jsonContentRequired(zOkRes(z.any()), "Returns ok status"),
      },
    }),
    async (c) => {
      return c.json(
        okRes(
          {
            ...MOCK_DB,
          },
          c.var.requestId,
        ),
        200,
      );
    },
  );
