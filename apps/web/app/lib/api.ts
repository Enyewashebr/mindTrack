export function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

export type PlanResponse = {
  id: string;
  planDate: string;
  status: string;
  timeBlocks: Array<{
    id: string;
    title: string;
    startsAt: string;
    endsAt: string;
    tasks: Array<{ id: string; title: string; status: string }>;
  }>;
};

export type FocusSessionResponse = {
  id: string;
  userId: string;
  taskId: string;
  status: string;
  startedAt: string;
  endedAt: string | null;
  task: {
    id: string;
    title: string;
    status: string;
    timeBlock: {
      id: string;
      title: string;
      startsAt: string;
      endsAt: string;
      plan: {
        id: string;
        planDate: string;
        status: string;
      };
    };
  };
};
