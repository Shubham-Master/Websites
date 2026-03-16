import { Pool } from "pg";
import { env } from "../config/env.js";

export function createDatabasePool(): Pool {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL or SUPABASE_DB_URL must be set before creating a database pool.");
  }

  return new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.DATABASE_SSL
      ? {
          rejectUnauthorized: false
        }
      : undefined
  });
}
