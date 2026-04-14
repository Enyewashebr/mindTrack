import { PlanStatus, TaskStatus } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db.js";

const timeBlockSchema = z.object({
  title: z.string().min(1),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  tasks: z.array(z.object({ title: z.string().min(1) })).default([])
});

const createDailyPlanSchema = z.object({
  userId: z.string().min(1),
  date: z.string().datetime(),
  status: z.nativeEnum(PlanStatus).optional(),
  timeBlocks: z.array(timeBlockSchema).min(1)
});

const getDailyPlanSchema = z.object({
  userId: z.string().min(1),
  date: z.string().datetime()
});

function normalizeDate(value: string): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function hasOverlap(
  blocks: Array<{ startsAt: string; endsAt: string }>
): boolean {
  const normalized = blocks
    .map((block) => ({
      startsAt: new Date(block.startsAt).getTime(),
      endsAt: new Date(block.endsAt).getTime()
    }))
    .sort((a, b) => a.startsAt - b.startsAt);

  for (let index = 0; index < normalized.length; index += 1) {
    const current = normalized[index];

    if (current.startsAt >= current.endsAt) {
      return true;
    }

    if (index > 0 && current.startsAt < normalized[index - 1].endsAt) {
      return true;
    }
  }

  return false;
}

export function registerPlanRoutes(app: FastifyInstance): void {
  app.post("/plans/daily", async (request, reply) => {
    const body = createDailyPlanSchema.parse(request.body);

    if (hasOverlap(body.timeBlocks)) {
      return reply.status(400).send({
        error: "Invalid time blocks. Ensure blocks do not overlap and each has a valid range."
      });
    }

    const planDate = normalizeDate(body.date);

    const plan = await db.plan.upsert({
      where: { userId_planDate: { userId: body.userId, planDate } },
      update: {
        status: body.status ?? PlanStatus.DRAFT,
        timeBlocks: {
          deleteMany: {},
          create: body.timeBlocks.map((block) => ({
            title: block.title,
            startsAt: new Date(block.startsAt),
            endsAt: new Date(block.endsAt),
            tasks: {
              create: block.tasks.map((task) => ({
                title: task.title,
                status: TaskStatus.TODO
              }))
            }
          }))
        }
      },
      create: {
        userId: body.userId,
        planDate,
        status: body.status ?? PlanStatus.DRAFT,
        timeBlocks: {
          create: body.timeBlocks.map((block) => ({
            title: block.title,
            startsAt: new Date(block.startsAt),
            endsAt: new Date(block.endsAt),
            tasks: {
              create: block.tasks.map((task) => ({
                title: task.title,
                status: TaskStatus.TODO
              }))
            }
          }))
        }
      },
      include: {
        timeBlocks: {
          include: {
            tasks: true
          },
          orderBy: {
            startsAt: "asc"
          }
        }
      }
    });

    return reply.status(200).send(plan);
  });

  app.get("/plans/daily", async (request, reply) => {
    const query = getDailyPlanSchema.parse(request.query);
    const planDate = normalizeDate(query.date);

    const plan = await db.plan.findUnique({
      where: {
        userId_planDate: {
          userId: query.userId,
          planDate
        }
      },
      include: {
        timeBlocks: {
          include: {
            tasks: true
          },
          orderBy: {
            startsAt: "asc"
          }
        }
      }
    });

    if (!plan) {
      return reply.status(404).send({ error: "No daily plan found for the selected date." });
    }

    return reply.status(200).send(plan);
  });
}
