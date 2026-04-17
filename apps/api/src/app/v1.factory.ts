import type { Context } from "hono";

import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { requestId } from "hono/request-id";
import { trimTrailingSlash } from "hono/trailing-slash";
import { z } from "zod";

import type { ExtractEnv } from "@/types/index";

import { env } from "@/env";
import { auth } from "@/lib/auth";
import { ApiError } from "@/lib/error";
import { pinoLogger } from "@/lib/logger";

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
    .on(["POST", "GET"], "/auth/*", (c) => {
      return auth.handler(c.req.raw);
    })
    .use(
      "*",
      createMiddleware<{
        Variables: {
          user: typeof auth.$Infer.Session.user | null;
          session: typeof auth.$Infer.Session.session | null;
        };
      }>(async (c, next) => {
        const session = await auth.api.getSession({
          headers: c.req.raw.headers,
        });
        if (!session) {
          c.set("user", null);
          c.set("session", null);
          return next();
        }
        c.set("user", session.user);
        c.set("session", session.session);
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
