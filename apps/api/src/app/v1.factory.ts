import type { Context } from "hono";

import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { requestId } from "hono/request-id";
import { trimTrailingSlash } from "hono/trailing-slash";
import { z } from "zod";

import type { ExtractEnv } from "@/types/index";

import { env } from "@/env";
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

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type Session = {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
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
        Variables:
          | {
              user: User;
              session: Session;
            }
          | {
              user: null;
              session: null;
            };
      }>(async (c, next) => {
        // TODO: Implement real authentication logic.
        const session = {
          user: {
            id: "123",
            name: "John Doe",
            email: "john.doe@example.com",
            phone: "123-456-7890",
            role: "user",
            status: "active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          session: {
            id: "456",
            userId: "123",
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
          },
        };

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
