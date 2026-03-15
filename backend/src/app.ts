import Fastify from "fastify";
import cors from "@fastify/cors";
import type { Store } from "./store/store.js";
import { env } from "./config/env.js";
import { HttpError } from "./lib/http-error.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerSessionRoutes } from "./routes/sessions.js";
import { registerLeadRoutes } from "./routes/leads.js";
import { registerBookingRoutes } from "./routes/bookings.js";
import { registerPaymentRoutes } from "./routes/payments.js";

export async function buildApp(store: Store) {
  const app = Fastify({
    logger: true
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(",").map((item) => item.trim())
  });

  await registerHealthRoutes(app);
  await registerSessionRoutes(app, store);
  await registerLeadRoutes(app, store);
  await registerBookingRoutes(app, store);
  await registerPaymentRoutes(app, store);

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    if (error instanceof HttpError) {
      return reply.code(error.statusCode).send({
        message: error.message
      });
    }

    if (error.name === "ZodError") {
      return reply.code(400).send({
        message: "Invalid request payload.",
        details: error.message
      });
    }

    return reply.code(500).send({
      message: "Internal server error."
    });
  });

  return app;
}
