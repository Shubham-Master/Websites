import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().min(1).default("::"),
  APP_URL: z.string().url().default("http://localhost:4000"),
  CORS_ORIGIN: z.string().min(1).default("*"),
  BOOKING_HOLD_MINUTES: z.coerce.number().int().positive().default(10)
});

export const env = envSchema.parse(process.env);
