import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const defaultAppUrl = process.env.RENDER_EXTERNAL_URL || "http://localhost:4000";

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no", "off"].includes(normalized)) {
    return false;
  }

  return value;
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().min(1).default("0.0.0.0"),
  APP_URL: z.string().url().default(defaultAppUrl),
  CORS_ORIGIN: z.string().min(1).default("*"),
  BOOKING_HOLD_MINUTES: z.coerce.number().int().positive().default(10),
  TRUST_PROXY: booleanFromEnv.default(false)
});

export const env = envSchema.parse(process.env);

export const allowedCorsOrigins =
  env.CORS_ORIGIN === "*"
    ? []
    : env.CORS_ORIGIN.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

export function isCorsOriginAllowed(origin?: string): boolean {
  if (env.CORS_ORIGIN === "*") {
    return true;
  }

  if (!origin) {
    return true;
  }

  return allowedCorsOrigins.includes(origin);
}
