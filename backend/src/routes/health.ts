import { env } from "../config/env.js";
import type { FastifyInstance } from "fastify";

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  const buildHealthPayload = () => ({
    status: "ok",
    service: "unmute-backend",
    environment: env.NODE_ENV,
    appUrl: env.APP_URL,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime())
  });

  app.get("/", async () => ({
    ...buildHealthPayload(),
    message: "Unmute backend is running.",
    healthcheck: "/health"
  }));

  app.get("/health", async () => buildHealthPayload());
  app.get("/healthz", async () => buildHealthPayload());
}
