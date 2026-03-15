import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { MemoryStore } from "./store/memory-store.js";

async function start() {
  const store = new MemoryStore(env.BOOKING_HOLD_MINUTES);
  const app = await buildApp(store);

  try {
    await app.listen({
      port: env.PORT,
      host: env.HOST
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
