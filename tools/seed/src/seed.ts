import { createAuth } from "@repo/auth/server";
import { createDb } from "@repo/db/client";
import * as schema from "@repo/db/schema";

import { env } from "./env";

const { db, pool } = createDb({
  databaseUrl: env.DATABASE_URL,
  max: 10,
});

export const auth = createAuth({
  baseUrl: env.API_AUTH_URL,
  db,
  trustedUrls: [],
  secret: env.AUTH_SECRET,
});

async function seed() {
  console.log("🌱 Start seeding database...");

  console.log("🧹 Cleaning up existing data...");

  await db.delete(schema.session);
  await db.delete(schema.account);
  await db.delete(schema.user);
  await db.delete(schema.verification);
  console.log("✅ Cleanup complete.");

  console.log("👤 Creating users...");

  const USERS = [
    {
      name: "Test",
      email: "test@test.com",
      password: "aaaaaaaa",
    },
  ] satisfies NonNullable<Parameters<typeof auth.api.signUpEmail>[0]>["body"][];

  for (const user of USERS) {
    await auth.api.signUpEmail({
      body: user,
    });
    console.log(`   👤 Created user: ${user.email}`);
  }

  console.log("✅ Users created.");
  console.log("🎉 Seeding finished successfully!");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
