import Fastify from "fastify";
import { ZodError } from "zod";
import { registerPlanRoutes } from "./routes/plans.js";

const app = Fastify({ logger: true });

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

  request.log.error(error);
  return reply.status(500).send({
    error: "Internal server error"
  });
});

registerPlanRoutes(app);

const port = Number(process.env.PORT ?? 4000);

app
  .listen({ port, host: "0.0.0.0" })
  .then(() => {
    app.log.info(`API listening on port ${port}`);
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
