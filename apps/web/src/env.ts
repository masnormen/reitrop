import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const SERVER_ENV = {};
type ServerEnv = Readonly<z.infer<ReturnType<typeof z.object<typeof SERVER_ENV>>>>;

const CLIENT_ENV = {
  VITE_APP_ENV: z.enum(["development", "production"]).default("development"),
  VITE_API_URL: z.url(),
  VITE_GA_ID: z.string().optional(),
  VITE_GTM_ID: z.string().optional(),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_BUILD_SHA: z.string().optional(),
};
type ClientEnv = Readonly<z.infer<ReturnType<typeof z.object<typeof CLIENT_ENV>>>>;

/**
 * @deprecated This is only for build/dev-time environment validation.
 * Use `import.meta.env.VITE_...` directly in the code.
 */
createEnv({
  server: SERVER_ENV,
  clientPrefix: "VITE_",
  client: CLIENT_ENV,
  // oxlint-disable-next-line node/no-process-env
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

// Type augmentation for environment variables
declare global {
  namespace NodeJS {
    // @ts-ignore
    interface ProcessEnv extends ServerEnv, ClientEnv {}
  }
  interface ImportMetaEnv extends ClientEnv {}
}
