import { randomUUID } from "node:crypto";

export function createId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

export function createConfirmationCode(): string {
  return randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
}
