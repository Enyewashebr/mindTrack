"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

const STORAGE_KEY = "mindtrack_userId";

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function addHoursIso(baseIso: string, startHour: number, endHour: number): {
  startsAt: string;
  endsAt: string;
} {
  const day = new Date(baseIso);
  const startsAt = new Date(day);
  startsAt.setHours(startHour, 0, 0, 0);
  const endsAt = new Date(day);
  endsAt.setHours(endHour, 0, 0, 0);
  return { startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() };
}

type PlanResponse = {
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

export function TodayPlanner() {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("you@example.com");
  const [fullName, setFullName] = useState("Your name");
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setUserId(stored);
    }
  }, []);

  const fetchPlan = useCallback(async (uid: string) => {
    setPlanError(null);
    setLoading(true);
    const params = new URLSearchParams({
      userId: uid,
      date: startOfTodayIso()
    });
    const res = await fetch(`${apiBase()}/plans/daily?${params.toString()}`);
    if (res.status === 404) {
      setPlan(null);
      setPlanError("No plan for today yet. Create one below.");
      setLoading(false);
      return;
    }
    if (!res.ok) {
      setPlanError(`Could not load plan (${res.status}).`);
      setLoading(false);
      return;
    }
    const data = (await res.json()) as PlanResponse;
    setPlan(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (userId) {
      void fetchPlan(userId);
    }
  }, [userId, fetchPlan]);

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setRegisterError(null);
    setLoading(true);
    const res = await fetch(`${apiBase()}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fullName })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message =
        typeof body.error === "string" ? body.error : `Register failed (${res.status})`;
      setRegisterError(message);
      setLoading(false);
      return;
    }
    const user = (await res.json()) as { id: string };
    window.localStorage.setItem(STORAGE_KEY, user.id);
    setUserId(user.id);
    setLoading(false);
    void fetchPlan(user.id);
  }

  async function handleCreateSamplePlan(e: FormEvent) {
    e.preventDefault();
    if (!userId) {
      return;
    }
    setPlanError(null);
    setLoading(true);
    const dayIso = startOfTodayIso();
    const morning = addHoursIso(dayIso, 9, 11);
    const afternoon = addHoursIso(dayIso, 14, 16);
    const res = await fetch(`${apiBase()}/plans/daily`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        date: dayIso,
        timeBlocks: [
          {
            title: "Deep work",
            startsAt: morning.startsAt,
            endsAt: morning.endsAt,
            tasks: [{ title: "Ship planning API" }, { title: "Wire web UI" }]
          },
          {
            title: "Admin / planning",
            startsAt: afternoon.startsAt,
            endsAt: afternoon.endsAt,
            tasks: [{ title: "Review weekly goals" }]
          }
        ]
      })
    });
    if (!res.ok) {
      setPlanError(`Could not save plan (${res.status}).`);
      setLoading(false);
      return;
    }
    const data = (await res.json()) as PlanResponse;
    setPlan(data);
    setLoading(false);
  }

  function handleClearUser() {
    window.localStorage.removeItem(STORAGE_KEY);
    setUserId(null);
    setPlan(null);
    setPlanError(null);
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section>
        <h2>Account</h2>
        {userId ? (
          <p>
            Signed in as user id: <code>{userId}</code>{" "}
            <button type="button" onClick={handleClearUser}>
              Clear
            </button>
          </p>
        ) : (
          <form onSubmit={handleRegister} style={{ display: "grid", gap: 8, maxWidth: 360 }}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                required
                style={{ display: "block", width: "100%" }}
              />
            </label>
            <label>
              Full name
              <input
                value={fullName}
                onChange={(ev) => setFullName(ev.target.value)}
                required
                style={{ display: "block", width: "100%" }}
              />
            </label>
            <button type="submit" disabled={loading}>
              Register
            </button>
            {registerError ? <p style={{ color: "crimson" }}>{registerError}</p> : null}
          </form>
        )}
      </section>

      <section>
        <h2>Today&apos;s plan from API</h2>
        <p style={{ color: "#555", fontSize: 14 }}>
          API base: <code>{apiBase()}</code>
        </p>
        {loading ? <p>Loading…</p> : null}
        {planError && !loading ? <p style={{ color: "#666" }}>{planError}</p> : null}
        {plan ? (
          <ul style={{ paddingLeft: 20 }}>
            {plan.timeBlocks.map((block) => (
              <li key={block.id} style={{ marginBottom: 12 }}>
                <strong>{block.title}</strong>{" "}
                <span style={{ color: "#555", fontSize: 14 }}>
                  {new Date(block.startsAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}{" "}
                  –{" "}
                  {new Date(block.endsAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
                <ul>
                  {block.tasks.map((t) => (
                    <li key={t.id}>
                      {t.title} <small>({t.status})</small>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : null}
        {userId ? (
          <form onSubmit={handleCreateSamplePlan}>
            <button type="submit" disabled={loading}>
              Create sample plan for today
            </button>
          </form>
        ) : null}
      </section>
    </div>
  );
}
