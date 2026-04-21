import { FocusSessionStatus, TaskStatus } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db.js";

const startSessionSchema = z.object({
  userId: z.string().min(1),
  taskId: z.string().min(1)
});

const stopSessionSchema = z.object({
  userId: z.string().min(1)
});

const activeSessionQuerySchema = z.object({
  userId: z.string().min(1)
});

function normalizeDate(value: Date): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

const activeSessionInclude = {
  task: {
    include: {
      timeBlock: {
        include: {
          plan: true
        }
      }
    }
  }
} as const;

export function registerFocusSessionRoutes(app: FastifyInstance): void {
  app.get("/sessions/active", async (request, reply) => {
    const query = activeSessionQuerySchema.parse(request.query);

    const session = await db.focusSession.findFirst({
      where: {
        userId: query.userId,
        status: FocusSessionStatus.ACTIVE
      },
      orderBy: {
        startedAt: "desc"
      },
      include: activeSessionInclude
    });

    if (!session) {
      return reply.status(404).send({
        error: "No active focus session."
      });
    }

    return reply.status(200).send(session);
  });

  app.post("/sessions/start", async (request, reply) => {
    const body = startSessionSchema.parse(request.body);
    const today = normalizeDate(new Date());

    const existing = await db.focusSession.findFirst({
      where: {
        userId: body.userId,
        status: FocusSessionStatus.ACTIVE
      }
    });

    if (existing) {
      return reply.status(409).send({
        error: "A focus session is already active. Stop it before starting another one."
      });
    }

    const task = await db.task.findFirst({
      where: {
        id: body.taskId,
        timeBlock: {
          plan: {
            userId: body.userId,
            planDate: today
          }
        }
      },
      include: {
        timeBlock: {
          include: {
            plan: true
          }
        }
      }
    });

    if (!task) {
      return reply.status(400).send({
        error: "No plan, no focus. Choose a task from today's plan before starting a session."
      });
    }

    const session = await db.focusSession.create({
      data: {
        userId: body.userId,
        taskId: body.taskId,
        status: FocusSessionStatus.ACTIVE
      },
      include: activeSessionInclude
    });

    await db.task.update({
      where: {
        id: body.taskId
      },
      data: {
        status: TaskStatus.IN_PROGRESS
      }
    });

    return reply.status(201).send(session);
  });

  app.post("/sessions/stop", async (request, reply) => {
    const body = stopSessionSchema.parse(request.body);

    const session = await db.focusSession.findFirst({
      where: {
        userId: body.userId,
        status: FocusSessionStatus.ACTIVE
      },
      orderBy: {
        startedAt: "desc"
      }
    });

    if (!session) {
      return reply.status(404).send({
        error: "No active focus session to stop."
      });
    }

    const stopped = await db.focusSession.update({
      where: {
        id: session.id
      },
      data: {
        status: FocusSessionStatus.COMPLETED,
        endedAt: new Date()
      },
      include: activeSessionInclude
    });

    return reply.status(200).send(stopped);
  });
}
