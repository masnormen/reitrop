import type { DatabaseInstance } from "@repo/db/client";

import { createId as createCuid2Id } from "@paralleldrive/cuid2";
import { type BetterAuthOptions, type BetterAuthPlugin, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, openAPI } from "better-auth/plugins";

export interface AuthOptions extends Omit<
  BetterAuthOptions,
  "database" | "plugins" | "baseURL" | "trustedOrigins" | "secret"
> {
  baseUrl: string;
  db: DatabaseInstance;
  trustedUrls: string[];
  secret: string;
}

/**
 * This function is abstracted for schema generations in cli-config.ts
 */
export const getBaseOptions = (db: DatabaseInstance) => {
  return {
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    advanced: {
      database: {
        generateId: () => createCuid2Id(),
      },
    },
    /**
     * Only uncomment the line below if you are using plugins, so that
     * your types can be correctly inferred:
     */
    plugins: [
      // organization(),
      openAPI({
        disableDefaultReference: true,
      }) as BetterAuthPlugin,
      admin(),
    ], // Fix types too deep
  } satisfies BetterAuthOptions;
};

export const createAuth = ({ baseUrl, db, trustedUrls, secret, logger }: AuthOptions) => {
  const config = {
    ...getBaseOptions(db),
    baseURL: baseUrl,
    trustedOrigins: trustedUrls.map((url) => new URL(url).origin),
    secret,
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      requireEmailVerification: false,
    },
    logger,
  } satisfies BetterAuthOptions;
  return betterAuth(config) as ReturnType<typeof betterAuth<typeof config>>;
};
