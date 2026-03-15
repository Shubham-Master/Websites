import { z } from "zod";
import type { FastifyInstance } from "fastify";
import type { Store } from "../store/store.js";

const bookingIntentSchema = z.object({
  sessionId: z.string().trim().min(1),
  displayName: z.string().trim().min(2).max(120),
  contact: z.string().trim().min(3).max(255),
  contactType: z.enum(["email", "whatsapp", "phone"]).default("email"),
  pricingMode: z.enum(["drop_in", "membership"]).optional(),
  topicChoice: z.string().trim().max(160).optional().nullable(),
  customTopic: z.string().trim().max(240).optional().nullable(),
  note: z.string().trim().max(1000).optional().nullable()
}).superRefine((payload, ctx) => {
  if (!payload.topicChoice && !payload.customTopic) {
    ctx.addIssue({
      code: "custom",
      message: "Please choose a promoted topic or enter a custom topic."
    });
  }
});

export async function registerBookingRoutes(app: FastifyInstance, store: Store): Promise<void> {
  app.post("/api/v1/bookings/intents", async (request, reply) => {
    const payload = bookingIntentSchema.parse(request.body);
    const bookingIntent = await store.createBookingIntent(payload);

    return reply.code(201).send(bookingIntent);
  });
}
