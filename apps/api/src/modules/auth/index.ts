import { createRoute } from "@hono/zod-openapi";
import { sign } from "hono/jwt";
import { jsonContentRequired } from "stoker/openapi/helpers";
import { z } from "zod";

import { createV1RouteApp } from "@/app/v1.factory";
import { env } from "@/env";
import { ApiError } from "@/lib/error";
import { errorContent, okRes, zOkRes } from "@/lib/response";
import { HttpStatusCodes } from "@/lib/status-code";
import { MOCK_USER } from "@/mock";
import { Session, User } from "@/schema/auth";

const LoginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

const LoginResponseSchema = z.object({
  session: Session,
  token: z.string(),
});

const AuthMeResponseSchema = User;

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
          zOkRes(LoginResponseSchema),
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
      const EXPIRE_TIME = new Date(Date.now() + ONE_HOUR_MS);
      const MOCK_NEW_SESSION = {
        id: crypto.randomUUID(),
        user: MOCK_USER,
        createdAt: new Date().toISOString(),
        expiresAt: EXPIRE_TIME.toISOString(), // 1 hour from now
      };

      const token = await sign(
        { ...MOCK_NEW_SESSION, sub: MOCK_USER.id, exp: Math.floor(EXPIRE_TIME.getTime() / 1000) },
        env.AUTH_SECRET,
        "HS256",
      );

      return c.json(
        okRes(
          {
            session: MOCK_NEW_SESSION,
            token,
          },
          c.var.requestId,
        ),
        HttpStatusCodes.OK,
      );
    },
  )
  /**
   * =============================
   * GET /auth/me
   * =============================
   */
  .openapi(
    createRoute({
      tags: ["Auth"],
      summary: "Get current user session",
      description: "Returns the current user's session information",
      method: "get",
      path: "/me",
      responses: {
        [HttpStatusCodes.OK]: jsonContentRequired(
          zOkRes(AuthMeResponseSchema),
          "Returns user data",
        ),
        ...errorContent(["UNAUTHORIZED"]),
      },
    }),
    async (c) => {
      if (!c.var.session) {
        throw ApiError.UNAUTHORIZED({ message: "Not authenticated" });
      }

      return c.json(okRes(c.var.session.user, c.var.requestId), HttpStatusCodes.OK);
    },
  );
