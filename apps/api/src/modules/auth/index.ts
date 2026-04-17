import { createRoute } from "@hono/zod-openapi";
import { setSignedCookie } from "hono/cookie";
import { jsonContentRequired } from "stoker/openapi/helpers";
import { z } from "zod";

import { createV1RouteApp } from "@/app/v1.factory";
import { env } from "@/env";
import { ApiError } from "@/lib/error";
import { errorContent, okRes, zOkRes } from "@/lib/response";
import { HttpStatusCodes } from "@/lib/status-code";
import { MOCK_USER } from "@/mock";
import { Session } from "@/schema/user";

const LoginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

const SessionResponseSchema = z.object({
  session: Session,
});

export const authRoutes = createV1RouteApp()
  /**
   * =============================
   * POST /auth/login
   * =============================
   */
  .openapi(
    createRoute({
      tags: ["Auth"],
      summary: "Login with email and password",
      description: "Authenticate user and set httpOnly session cookie",
      method: "post",
      path: "/login",
      request: {
        body: {
          content: {
            "application/json": {
              schema: LoginSchema,
            },
          },
          required: true,
        },
      },
      responses: {
        [HttpStatusCodes.OK]: jsonContentRequired(
          zOkRes(SessionResponseSchema),
          "Returns user and session data",
        ),
        ...errorContent(["MALFORMED_INPUT", "UNAUTHORIZED"]),
      },
    }),
    async (c) => {
      if (c.var.session) {
        throw ApiError.MALFORMED_INPUT({ message: "Already logged in" });
      }

      const { email, password } = c.req.valid("json");
      if (email !== MOCK_USER.email || password !== "password") {
        throw ApiError.UNAUTHORIZED({ message: "Invalid email or password" });
      }

      const ONE_HOUR_MS = 3600 * 1000;
      const MOCK_NEW_SESSION = {
        id: crypto.randomUUID(),
        user: MOCK_USER,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + ONE_HOUR_MS).toISOString(), // 1 hour from now
      };

      await setSignedCookie(c, "session", JSON.stringify(MOCK_NEW_SESSION), env.AUTH_SECRET, {
        httpOnly: true,
        secure: env.APP_ENV === "production",
        sameSite: "lax",
        maxAge: 3600, // 1 hour
      });

      return c.json(
        okRes(
          {
            session: MOCK_NEW_SESSION,
          },
          c.var.requestId,
        ),
        HttpStatusCodes.OK,
      );
    },
  );
