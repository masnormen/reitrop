import type { Context } from "hono";

import { OpenAPIHono } from "@hono/zod-openapi";
import { getSignedCookie } from "hono/cookie";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { requestId } from "hono/request-id";
import { trimTrailingSlash } from "hono/trailing-slash";
import { z } from "zod";

import type { ExtractEnv } from "@/types/index";

import { env } from "@/env";
import { ApiError } from "@/lib/error";
import { pinoLogger } from "@/lib/logger";
import { Session } from "@/schema/user";

const v1DefaultHook = <TContext extends Context>(
  result:
    | {
        success: false;
        error: z.ZodError;
      }
    | {
        success: true;
        data: unknown;
      },
  c: TContext,
) => {
  if (!result.success) {
    const errorMalformed = ApiError.MALFORMED_INPUT({
      message: z.prettifyError(result.error),
    });
    return c.json(errorMalformed.toResponseJSON(c.var.requestId), errorMalformed.status);
  }
};

export const createV1App = () => {
  const baseApp = new OpenAPIHono({
    defaultHook: v1DefaultHook,
  });

  const baseAppWithMiddlewares = baseApp
    .use(requestId())
    .use(trimTrailingSlash())
    .use(pinoLogger())
    .use(
      cors({
        origin: env.APP_ENV !== "production" ? ["http://localhost:3000"] : [],
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["POST", "GET", "OPTIONS"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
        credentials: true,
      }),
    )
    .use(
      "*",
      createMiddleware<{
        Variables: {
          session: Session | null;
        };
      }>(async (c, next) => {
        const rawSessionString = await getSignedCookie(c, env.AUTH_SECRET, "session");
        const session = Session.safeParse(JSON.parse(rawSessionString || "null"));

        if (!session.success) {
          c.set("session", null);
          return next();
        }
        c.set("session", session.data);
        return next();
      }),
    );

  type BaseEnv = ExtractEnv<typeof baseAppWithMiddlewares>;

  return baseApp as OpenAPIHono<BaseEnv>;
};

export type BaseAppEnv = ExtractEnv<ReturnType<typeof createV1App>>;

export const createV1RouteApp = () => {
  return new OpenAPIHono<BaseAppEnv>({
    defaultHook: v1DefaultHook,
  });
};
