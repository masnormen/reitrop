import { createDb } from "@repo/db/client";

import { env } from "@/env";

// import { pinoInstance } from "@/lib/logger";
// class DrizzleLogger {
//   logQuery(query: string, params: unknown[]): void {
//     pinoInstance.debug({ query, params }, "Database Query");
//   }
// }

export const { db, pool } = createDb({
  databaseUrl: env.DATABASE_URL,
  max: 10,
  // logger: new DrizzleLogger(),
});
