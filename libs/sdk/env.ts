import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    OPENAPI_URL: z.url().optional(),
  },
  // oxlint-disable-next-line node/no-process-env
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
