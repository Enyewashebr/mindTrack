import cors from "@fastify/cors";
import { Prisma } from "@prisma/client";
import Fastify from "fastify";
import { ZodError } from "zod";
import { registerFocusSessionRoutes } from "./routes/focusSessions.js";
import { registerPlanRoutes } from "./routes/plans.js";
import { registerUserRoutes } from "./routes/users.js";

async function buildApp() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true });

  app.get("/health", async () => {
    return { ok: true, service: "mindtrack-api" };
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      request.log.warn(error);
      return reply.status(400).send({
        error: "Validation failed",
        details: error.issues
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return reply.status(409).send({
          error: "A user with this email already exists."
        });
      }
    }

    request.log.error(error);
    return reply.status(500).send({
      error: "Internal server error"
    });
  });

  registerPlanRoutes(app);
  registerFocusSessionRoutes(app);
  registerUserRoutes(app);

  return app;
}

async function main(): Promise<void> {
  const app = await buildApp();
  const port = Number(process.env.PORT ?? 4000);
  await app.listen({ port, host: "0.0.0.0" });
  app.log.info(`API listening on port ${port}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
