import Fastify from "fastify";
import cors from "@fastify/cors";
import type { Store } from "./store/store.js";
import { env, isCorsOriginAllowed } from "./config/env.js";
import { HttpError } from "./lib/http-error.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerSessionRoutes } from "./routes/sessions.js";
import { registerLeadRoutes } from "./routes/leads.js";
import { registerBookingRoutes } from "./routes/bookings.js";
import { registerPaymentRoutes } from "./routes/payments.js";
import type { EmailService } from "./notifications/email.js";

export async function buildApp(store: Store, emailService: EmailService) {
  const app = Fastify({
    logger: true,
    trustProxy: env.TRUST_PROXY
  });

  await app.register(cors, {
    origin(origin, callback) {
      callback(null, isCorsOriginAllowed(origin));
    },
    methods: ["GET", "POST", "OPTIONS"]
  });

  await registerHealthRoutes(app);
  await registerSessionRoutes(app, store);
  await registerLeadRoutes(app, store);
  await registerBookingRoutes(app, store, emailService);
  await registerPaymentRoutes(app, store);

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";

    if (error instanceof HttpError) {
      return reply.code(error.statusCode).send({
        message: error.message
      });
    }

    if (error instanceof Error && error.name === "ZodError") {
      return reply.code(400).send({
        message: "Invalid request payload.",
        details: message
      });
    }

    return reply.code(500).send({
      message: "Internal server error."
    });
  });

  return app;
}
