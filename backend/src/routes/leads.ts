import { z } from "zod";
import type { FastifyInstance } from "fastify";
import type { Store } from "../store/store.js";

const leadSchema = z.object({
  displayName: z.string().trim().min(2).max(120),
  contact: z.string().trim().min(3).max(255),
  contactType: z.enum(["email", "whatsapp", "phone"]).default("email"),
  selectedSessionId: z.string().trim().min(1).optional().nullable(),
  note: z.string().trim().max(1000).optional().nullable(),
  source: z.string().trim().min(2).max(80),
  marketingConsent: z.boolean().optional()
});

export async function registerLeadRoutes(app: FastifyInstance, store: Store): Promise<void> {
  app.post("/api/v1/leads", async (request, reply) => {
    const payload = leadSchema.parse(request.body);
    const lead = await store.createLead(payload);

    return reply.code(201).send({
      leadId: lead.id,
      message: "Lead captured successfully."
    });
  });
}
