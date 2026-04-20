"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { apiBase, type PlanResponse } from "../lib/api";
import { addHoursIso, formatTimeRange, startOfTodayIso } from "../lib/dates";
import { PlanDayEditor } from "./PlanDayEditor";

const STORAGE_KEY = "mindtrack_userId";

function formatTodayHeading(): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date());
}

export function TodayPageClient() {
  const dayIso = useMemo(() => startOfTodayIso(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("you@example.com");
  const [fullName, setFullName] = useState("Your name");
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setUserId(stored);
    }
  }, []);

  const fetchPlan = useCallback(async (uid: string) => {
    setPlanError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId: uid,
        date: dayIso
      });
      const res = await fetch(`${apiBase()}/plans/daily?${params.toString()}`);
      if (res.status === 404) {
        setPlan(null);
        setPlanError("No plan for today yet. Build one below.");
        return;
      }
      if (!res.ok) {
        setPlanError(`Could not load plan (${res.status}).`);
        return;
      }
      const data = (await res.json()) as PlanResponse;
      setPlan(data);
    } catch {
      setPlanError(
        `Cannot reach API at ${apiBase()}. Start it with npm run dev:api and check your network.`
      );
      setPlan(null);
    } finally {
      setLoading(false);
    }
  }, [dayIso]);

  useEffect(() => {
    if (userId) {
      void fetchPlan(userId);
    }
  }, [userId, fetchPlan]);

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setRegisterError(null);
    setLoading(true);
    try {
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
        return;
      }
      const user = (await res.json()) as { id: string };
      window.localStorage.setItem(STORAGE_KEY, user.id);
      setUserId(user.id);
      void fetchPlan(user.id);
    } catch {
      setRegisterError(`Cannot reach API at ${apiBase()}. Is the server running?`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePlan(payload: {
    timeBlocks: Array<{
      title: string;
      startsAt: string;
      endsAt: string;
      tasks: Array<{ title: string }>;
    }>;
  }) {
    if (!userId) {
      return;
    }
    setPlanError(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase()}/plans/daily`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          date: dayIso,
          timeBlocks: payload.timeBlocks
        })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg =
          typeof body.error === "string" ? body.error : `Could not save plan (${res.status}).`;
        setPlanError(msg);
        return;
      }
      const data = (await res.json()) as PlanResponse;
      setPlan(data);
      setShowEditor(false);
    } catch {
      setPlanError(`Cannot reach API at ${apiBase()}.`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSamplePlan(e: FormEvent) {
    e.preventDefault();
    if (!userId) {
      return;
    }
    const morning = addHoursIso(dayIso, 9, 11);
    const afternoon = addHoursIso(dayIso, 14, 16);
    await handleSavePlan({
      timeBlocks: [
        {
          title: "Deep work",
          startsAt: morning.startsAt,
          endsAt: morning.endsAt,
          tasks: [{ title: "Ship planning API" }, { title: "Polish web UI" }]
        },
        {
          title: "Admin / planning",
          startsAt: afternoon.startsAt,
          endsAt: afternoon.endsAt,
          tasks: [{ title: "Review weekly goals" }]
        }
      ]
    });
  }

  function handleClearUser() {
    window.localStorage.removeItem(STORAGE_KEY);
    setUserId(null);
    setPlan(null);
    setPlanError(null);
    setShowEditor(false);
  }

  return (
    <>
      <h1>Today</h1>
      <p className="mt-page-desc">
        {formatTodayHeading()} — plan your blocks, then execute (focus mode and tracking come next).
      </p>

      <div className="mt-card">
        <p className="mt-card-title">Account</p>
        {userId ? (
          <div className="mt-row">
            <span className="mt-muted">
              Signed in · <code>{userId.slice(0, 12)}…</code>
            </span>
            <span className="mt-badge mt-badge-live">API {apiBase()}</span>
            <button type="button" className="mt-btn mt-btn-ghost" onClick={handleClearUser}>
              Sign out
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="mt-form-grid">
            <div>
              <label className="mt-label" htmlFor="reg-email">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                className="mt-input"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                required
              />
            </div>
            <div>
              <label className="mt-label" htmlFor="reg-name">
                Full name
              </label>
              <input
                id="reg-name"
                className="mt-input"
                value={fullName}
                onChange={(ev) => setFullName(ev.target.value)}
                required
              />
            </div>
            <button type="submit" className="mt-btn" disabled={loading}>
              Register
            </button>
            {registerError ? <p className="mt-error">{registerError}</p> : null}
          </form>
        )}
      </div>

      <div className="mt-card">
        <p className="mt-card-title">Today&apos;s schedule</p>
        {loading ? <p className="mt-muted">Loading…</p> : null}
        {!loading && planError ? <p className="mt-muted">{planError}</p> : null}
        {!loading && plan ? (
          <div className="mt-timeline">
            {plan.timeBlocks.map((block) => (
              <article key={block.id} className="mt-block">
                <div className="mt-block-time">{formatTimeRange(block.startsAt, block.endsAt)}</div>
                <h3>{block.title}</h3>
                <ul className="mt-task-list">
                  {block.tasks.map((t) => (
                    <li key={t.id}>
                      {t.title} <span className="mt-badge">{t.status}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        ) : null}
        {!loading && userId ? (
          <div className="mt-row" style={{ marginTop: "1rem" }}>
            <button
              type="button"
              className="mt-btn mt-btn-ghost"
              onClick={() => setShowEditor((v) => !v)}
              disabled={loading}
            >
              {showEditor ? "Hide editor" : plan ? "Edit plan" : "Build plan"}
            </button>
            <form onSubmit={handleSamplePlan} style={{ display: "inline" }}>
              <button type="submit" className="mt-btn mt-btn-ghost" disabled={loading}>
                Load sample plan
              </button>
            </form>
          </div>
        ) : null}
      </div>

      {!loading && userId && showEditor ? (
        <PlanDayEditor dayIso={dayIso} disabled={loading} onSave={handleSavePlan} />
      ) : null}

      {!userId ? (
        <p className="mt-muted">Register to load or create your plan for today.</p>
      ) : null}
    </>
  );
}
