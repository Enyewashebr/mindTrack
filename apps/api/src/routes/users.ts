import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db.js";

const createUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1)
});

export function registerUserRoutes(app: FastifyInstance): void {
  app.post("/users", async (request, reply) => {
    const body = createUserSchema.parse(request.body);
    const user = await db.user.create({
      data: {
        email: body.email,
        fullName: body.fullName
      }
    });
    return reply.status(201).send(user);
  });
}
