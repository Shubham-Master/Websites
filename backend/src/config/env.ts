import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const defaultAppUrl = process.env.RENDER_EXTERNAL_URL || "http://localhost:4000";
const envInput = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL
};

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

const optionalUrlFromEnv = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}, z.string().url().optional());

const optionalStringFromEnv = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}, z.string().min(1).optional());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().min(1).default("0.0.0.0"),
  APP_URL: z.string().url().default(defaultAppUrl),
  CORS_ORIGIN: z.string().min(1).default("*"),
  BOOKING_HOLD_MINUTES: z.coerce.number().int().positive().default(10),
  TRUST_PROXY: booleanFromEnv.default(false),
  DATABASE_URL: optionalUrlFromEnv,
  DATABASE_SSL: booleanFromEnv.default(false),
  RESEND_API_KEY: optionalStringFromEnv,
  EMAIL_FROM: optionalStringFromEnv,
  EMAIL_REPLY_TO: optionalStringFromEnv
});

export const env = envSchema.parse(envInput);
export const hasDatabaseConfig = Boolean(env.DATABASE_URL);

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
