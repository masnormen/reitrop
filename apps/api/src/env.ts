import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    APP_ENV: z.enum(["development", "production"]).default("development"),
    API_PORT: z.coerce
      .number()
      .refine((val) => val >= 1 && val <= 65535, "PORT must be a number between 1 and 65535")
      .optional(),
    PORT: z.coerce
      .number()
      .refine((val) => val >= 1 && val <= 65535, "PORT must be a number between 1 and 65535")
      .default(4200),
    DATABASE_URL: z.url(),
    AUTH_SECRET: z.string().min(32),
  },
  // oxlint-disable-next-line node/no-process-env
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
