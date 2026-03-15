import { z } from "zod";
import type { FastifyInstance } from "fastify";
import type { Store } from "../store/store.js";

const paymentOrderSchema = z.object({
  bookingId: z.string().trim().min(1)
});

const paymentWebhookSchema = z.object({
  providerOrderId: z.string().trim().min(1),
  providerPaymentId: z.string().trim().min(1)
});

export async function registerPaymentRoutes(app: FastifyInstance, store: Store): Promise<void> {
  app.post("/api/v1/payments/orders", async (request, reply) => {
    const payload = paymentOrderSchema.parse(request.body);
    const payment = await store.createPaymentOrder(payload);

    return reply.code(201).send({
      paymentOrderId: payment.id,
      providerOrderId: payment.providerOrderId,
      amountInr: payment.amountInr,
      currency: "INR",
      provider: "razorpay",
      status: payment.status,
      message: "Mock payment order created. Replace this with Razorpay order creation next."
    });
  });

  app.post("/api/v1/payments/webhooks/razorpay", async (request) => {
    const payload = paymentWebhookSchema.parse(request.body);
    const payment = await store.confirmPayment(payload);

    return {
      paymentOrderId: payment.id,
      bookingId: payment.bookingId,
      status: payment.status
    };
  });
}
