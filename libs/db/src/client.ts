import type { Logger } from "drizzle-orm";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schemas/__schema__";

export interface DatabaseClientOptions {
  databaseUrl?: string;
  max?: number;
  logger?: boolean | Logger;
}

export type DatabaseInstance = ReturnType<typeof createDb>["db"];

export const createDb = (opts?: DatabaseClientOptions) => {
  const pool = new Pool({
    connectionString: opts?.databaseUrl,
    max: opts?.max,
    connectionTimeoutMillis: 5000,
  });

  const db = drizzle(pool, {
    schema,
    casing: "snake_case",
    logger: opts?.logger,
  });

  return {
    db,
    pool,
  };
};
