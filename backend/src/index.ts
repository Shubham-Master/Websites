import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { MemoryStore } from "./store/memory-store.js";

async function start() {
  const store = new MemoryStore(env.BOOKING_HOLD_MINUTES);
  const app = await buildApp(store);
  let isShuttingDown = false;

  const shutdown = async (signal: string) => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    app.log.info({ signal }, "Shutting down Unmute backend");

    try {
      await app.close();
      process.exit(0);
    } catch (error) {
      app.log.error(error);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  try {
    const address = await app.listen({
      port: env.PORT,
      host: env.HOST
    });
    app.log.info(
      {
        address,
        environment: env.NODE_ENV,
        appUrl: env.APP_URL
      },
      "Unmute backend listening"
    );
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
