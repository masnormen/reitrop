import { createAuth } from "@repo/auth/server";

import { env } from "@/env";
import { db } from "@/lib/db";
import { pinoInstance } from "@/lib/logger";

export const auth = createAuth({
  baseUrl: "http://localhost:4200/api/v1/auth",
  db,
  trustedUrls: ["http://localhost:3000", "http://localhost:4200"],
  secret: env.AUTH_SECRET,
  logger: {
    log: (level, message) => {
      pinoInstance[level](`[better-auth] ${message.trimEnd()}`);
    },
  },
});
