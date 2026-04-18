import type { Context } from "hono";

import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import { requestId } from "hono/request-id";
import { trimTrailingSlash } from "hono/trailing-slash";
import { JwtTokenExpired } from "hono/utils/jwt/types";
import { z } from "zod";

import type { ExtractEnv } from "@/types/index";

import { env } from "@/env";
import { ApiError } from "@/lib/error";
import { pinoLogger } from "@/lib/logger";
import { Session } from "@/schema/auth";

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
        const authHeader = c.req.header("Authorization");
        if (!authHeader) {
          c.set("session", null);
          return next();
        }

        if (!authHeader.startsWith("Bearer ")) {
          throw ApiError.MALFORMED_INPUT({ message: "Invalid Authorization header format" });
        }

        const token = authHeader.substring(7); // Remove "Bearer " prefix
        try {
          const decoded = await verify(token, env.AUTH_SECRET, "HS256");
          const session = Session.safeParse(decoded);

          if (!session.success) {
            c.set("session", null);
            return next();
          }
          c.set("session", session.data);
          return next();
        } catch (err) {
          if (err instanceof JwtTokenExpired) {
            throw ApiError.SESSION_EXPIRED({ message: "Token has expired" });
          }
          throw ApiError.UNAUTHORIZED({ message: "Invalid or expired token" });
        }
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
