import type { Config } from "drizzle-kit";

import { env } from "./src/env";

export default {
  schema: "./src/schemas/__schema__.ts",
  dialect: "postgresql",
  dbCredentials: { url: env.DATABASE_URL },
  casing: "snake_case",
} satisfies Config;
