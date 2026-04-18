import { createRoute, z } from "@hono/zod-openapi";
import { jsonContentRequired } from "stoker/openapi/helpers";

import { createV1RouteApp } from "@/app/v1.factory";
import { okRes, zOkRes } from "@/lib/response";
import { HttpStatusCodes } from "@/lib/status-code";
import { INTEGRATIONS } from "@/mock";
import { Integration } from "@/schema/integrations";

const ApplicationListResponseSchema = z.array(Integration);

const applicationsRoutes = createV1RouteApp()
  /**
   * Get Applications List
   */
  .openapi(
    createRoute({
      tags: ["Applications"],
      summary: "Get Applications List",
      description: "Get list of all applications with their sync status",
      method: "get",
      path: "/list",
      responses: {
        [HttpStatusCodes.OK]: jsonContentRequired(
          zOkRes(ApplicationListResponseSchema),
          "Returns list of applications",
        ),
      },
    }),
    async (c) => {
      return c.json(okRes(INTEGRATIONS, c.var.requestId), HttpStatusCodes.OK);
    },
  );

export default applicationsRoutes;
