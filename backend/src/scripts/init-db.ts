import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createDatabasePool } from "../lib/database.js";
import { env } from "../config/env.js";
import { PostgresStore } from "../store/postgres-store.js";

async function main() {
  if (!env.DATABASE_URL) {
    throw new Error("Set DATABASE_URL or SUPABASE_DB_URL before running db:init.");
  }

  const schemaPath = fileURLToPath(new URL("../../../docs/database-schema.sql", import.meta.url));
  const schemaSql = await readFile(schemaPath, "utf8");
  const pool = createDatabasePool();
  const store = new PostgresStore(pool, env.BOOKING_HOLD_MINUTES);

  try {
    await pool.query(schemaSql);
    await store.initialize();
    console.log("Supabase schema is ready and seed sessions are available.");
  } finally {
    await store.close();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
