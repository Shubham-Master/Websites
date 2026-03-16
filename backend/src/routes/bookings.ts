import { z } from "zod";
import type { FastifyInstance } from "fastify";
import type { EmailService } from "../notifications/email.js";
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

function resolveRecipientEmail(contact: string, contactType: "email" | "whatsapp" | "phone"): string | null {
  if (contactType === "email" || contact.includes("@")) {
    return contact.trim().toLowerCase();
  }

  return null;
}

function createFreeSessionConfirmationMessage(emailSent: boolean): string {
  return emailSent
    ? "Your free session has been confirmed. Check your email for the session details."
    : "Your free session has been confirmed.";
}

export async function registerBookingRoutes(
  app: FastifyInstance,
  store: Store,
  emailService: EmailService
): Promise<void> {
  app.post("/api/v1/bookings/intents", async (request, reply) => {
    const payload = bookingIntentSchema.parse(request.body);
    const bookingIntent = await store.createBookingIntent(payload);
    const response = { ...bookingIntent };

    if (!bookingIntent.paymentRequired && bookingIntent.bookingStatus === "confirmed") {
      const recipientEmail = resolveRecipientEmail(payload.contact, payload.contactType);

      if (recipientEmail) {
        const session = await store.getSessionById(payload.sessionId);

        if (session) {
          try {
            const emailSent = await emailService.sendFreeSessionConfirmation({
              confirmationCode: bookingIntent.confirmationCode,
              displayName: payload.displayName,
              session,
              to: recipientEmail
            });

            response.message = createFreeSessionConfirmationMessage(emailSent);
          } catch (error) {
            request.log.error(error, "Failed to send free session confirmation email");
            response.message = createFreeSessionConfirmationMessage(false);
          }
        }
      }
    }

    return reply.code(201).send(response);
  });
}
