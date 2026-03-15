import { z } from "zod";
import type { FastifyInstance } from "fastify";
import type { Store } from "../store/store.js";

export async function registerSessionRoutes(app: FastifyInstance, store: Store): Promise<void> {
  app.get("/api/v1/sessions", async () => {
    const sessions = await store.listSessions();
    return {
      items: sessions
    };
  });

  app.get("/api/v1/sessions/:slug", async (request, reply) => {
    const params = z.object({
      slug: z.string().min(1)
    }).parse(request.params);

    const sessions = await store.listSessions();
    const session = sessions.find((item) => item.slug === params.slug);
    if (!session) {
      return reply.code(404).send({ message: "Session not found." });
    }

    return session;
  });
}
