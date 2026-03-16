import { env, hasDatabaseConfig } from "../config/env.js";
import { createDatabasePool } from "../lib/database.js";
import type { Store } from "./store.js";
import { MemoryStore } from "./memory-store.js";
import { PostgresStore } from "./postgres-store.js";

export async function createStore(): Promise<{
  store: Store;
  storageMode: "memory" | "postgres";
}> {
  if (!hasDatabaseConfig) {
    return {
      store: new MemoryStore(env.BOOKING_HOLD_MINUTES),
      storageMode: "memory"
    };
  }

  const store = new PostgresStore(createDatabasePool(), env.BOOKING_HOLD_MINUTES);
  await store.initialize();

  return {
    store,
    storageMode: "postgres"
  };
}
