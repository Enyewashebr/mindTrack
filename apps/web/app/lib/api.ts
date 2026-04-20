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
