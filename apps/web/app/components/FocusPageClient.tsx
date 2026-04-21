"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiBase, type FocusSessionResponse, type PlanResponse } from "../lib/api";
import { formatTimeRange, startOfTodayIso } from "../lib/dates";

const STORAGE_KEY = "mindtrack_userId";

function formatElapsed(startedAt: string, now: number): string {
  const elapsedMs = Math.max(0, now - new Date(startedAt).getTime());
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
  }

  return [minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

type FlatTask = {
  id: string;
  title: string;
  status: string;
  blockTitle: string;
  startsAt: string;
  endsAt: string;
};

export function FocusPageClient() {
  const [userId, setUserId] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [session, setSession] = useState<FocusSessionResponse | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [clockNow, setClockNow] = useState(() => Date.now());

  const dayIso = useMemo(() => startOfTodayIso(), []);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setUserId(stored);
    }
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    const timer = window.setInterval(() => {
      setClockNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [session]);

  const tasks = useMemo<FlatTask[]>(() => {
    if (!plan) {
      return [];
    }

    return plan.timeBlocks.flatMap((block) =>
      block.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        blockTitle: block.title,
        startsAt: block.startsAt,
        endsAt: block.endsAt
      }))
    );
  }, [plan]);

  useEffect(() => {
    if (!selectedTaskId && tasks.length > 0) {
      setSelectedTaskId(tasks[0].id);
    }
  }, [tasks, selectedTaskId]);

  const loadPlan = useCallback(async (uid: string) => {
    setPlanError(null);

    try {
      const params = new URLSearchParams({
        userId: uid,
        date: dayIso
      });
      const res = await fetch(`${apiBase()}/plans/daily?${params.toString()}`);

      if (res.status === 404) {
        setPlan(null);
        setPlanError("Create today's plan first. Focus sessions require a task from today's schedule.");
        return;
      }

      if (!res.ok) {
        setPlan(null);
        setPlanError(`Could not load today's plan (${res.status}).`);
        return;
      }

      const data = (await res.json()) as PlanResponse;
      setPlan(data);
    } catch {
      setPlan(null);
      setPlanError(`Cannot reach API at ${apiBase()}. Start it with npm run dev:api.`);
    }
  }, [dayIso]);

  const loadActiveSession = useCallback(async (uid: string) => {
    setSessionError(null);

    try {
      const params = new URLSearchParams({ userId: uid });
      const res = await fetch(`${apiBase()}/sessions/active?${params.toString()}`);

      if (res.status === 404) {
        setSession(null);
        return;
      }

      if (!res.ok) {
        setSession(null);
        setSessionError(`Could not load active session (${res.status}).`);
        return;
      }

      const data = (await res.json()) as FocusSessionResponse;
      setSession(data);
    } catch {
      setSession(null);
      setSessionError(`Cannot reach API at ${apiBase()}.`);
    }
  }, []);

  const refresh = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      await Promise.all([loadPlan(uid), loadActiveSession(uid)]);
    } finally {
      setLoading(false);
    }
  }, [loadActiveSession, loadPlan]);

  useEffect(() => {
    if (userId) {
      void refresh(userId);
    }
  }, [userId, refresh]);

  async function handleStartFocus() {
    if (!userId || !selectedTaskId) {
      return;
    }

    setSessionError(null);
    setLoading(true);

    try {
      const res = await fetch(`${apiBase()}/sessions/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          taskId: selectedTaskId
        })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSessionError(
          typeof body.error === "string" ? body.error : `Could not start focus (${res.status}).`
        );
        return;
      }

      const data = (await res.json()) as FocusSessionResponse;
      setSession(data);
      await loadPlan(userId);
    } catch {
      setSessionError(`Cannot reach API at ${apiBase()}.`);
    } finally {
      setLoading(false);
    }
  }

  async function handleStopFocus() {
    if (!userId) {
      return;
    }

    setSessionError(null);
    setLoading(true);

    try {
      const res = await fetch(`${apiBase()}/sessions/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId
        })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSessionError(
          typeof body.error === "string" ? body.error : `Could not stop focus (${res.status}).`
        );
        return;
      }

      setSession(null);
      await loadPlan(userId);
    } catch {
      setSessionError(`Cannot reach API at ${apiBase()}.`);
    } finally {
      setLoading(false);
    }
  }

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;

  return (
    <>
      <h1>Focus</h1>
      <p className="mt-page-desc">
        Start a session on one task from today&apos;s plan. The timer is live, the session is saved in the
        backend, and only one session can be active at a time.
      </p>

      <div className="mt-card">
        <p className="mt-card-title">Session</p>
        {session ? (
          <>
            <div className="mt-row" style={{ alignItems: "baseline", gap: "1rem" }}>
              <span style={{ fontSize: "2.5rem", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {formatElapsed(session.startedAt, clockNow)}
              </span>
              <span className="mt-badge mt-badge-live">Active now</span>
            </div>
            <p style={{ marginBottom: "0.35rem" }}>
              <strong>{session.task.title}</strong>
            </p>
            <p className="mt-muted" style={{ marginBottom: "0.9rem" }}>
              {session.task.timeBlock.title} ·{" "}
              {formatTimeRange(session.task.timeBlock.startsAt, session.task.timeBlock.endsAt)}
            </p>
            <div className="mt-row">
              <button type="button" className="mt-btn" onClick={handleStopFocus} disabled={loading}>
                Stop focus
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-muted" style={{ marginBottom: "0.9rem" }}>
              {userId
                ? "Pick a task from today's plan and start a session."
                : "Register on Today first so Focus knows who you are."}
            </p>
            <label className="mt-label" htmlFor="focus-task">
              Task
            </label>
            <select
              id="focus-task"
              className="mt-input"
              value={selectedTaskId}
              onChange={(event) => setSelectedTaskId(event.target.value)}
              disabled={!userId || loading || tasks.length === 0}
              style={{ maxWidth: 420, marginBottom: "0.8rem" }}
            >
              {tasks.length === 0 ? <option value="">No tasks available</option> : null}
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title} · {task.blockTitle}
                </option>
              ))}
            </select>
            {selectedTask ? (
              <p className="mt-muted" style={{ marginBottom: "0.9rem" }}>
                Selected block: {selectedTask.blockTitle} · {formatTimeRange(selectedTask.startsAt, selectedTask.endsAt)}
              </p>
            ) : null}
            <button
              type="button"
              className="mt-btn"
              onClick={handleStartFocus}
              disabled={!userId || loading || !selectedTaskId}
            >
              Start focus
            </button>
          </>
        )}
        {sessionError ? <p className="mt-error" style={{ marginTop: "0.8rem" }}>{sessionError}</p> : null}
        {loading ? <p className="mt-muted" style={{ marginTop: "0.8rem" }}>Syncing…</p> : null}
      </div>

      <div className="mt-card">
        <p className="mt-card-title">Today&apos;s plan status</p>
        {planError ? <p className="mt-muted">{planError}</p> : null}
        {!planError && tasks.length === 0 ? (
          <p className="mt-muted">No tasks available yet. Add a plan on the Today page first.</p>
        ) : null}
        {tasks.length > 0 ? (
          <ul className="mt-task-list">
            {tasks.map((task) => (
              <li key={task.id}>
                {task.title} <span className="mt-badge">{task.status}</span> · {task.blockTitle}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="mt-card">
        <p className="mt-card-title">Blocklist</p>
        <ul className="mt-task-list" style={{ marginBottom: "0.75rem" }}>
          <li>YouTube</li>
          <li>TikTok</li>
          <li>Telegram</li>
        </ul>
        <p className="mt-muted" style={{ margin: 0, fontSize: "0.85rem" }}>
          Still static UI for now. The next backend step after sessions is syncing these rules to the desktop
          agent.
        </p>
      </div>

      <div className="mt-card">
        <p className="mt-card-title">Device</p>
        <p className="mt-muted" style={{ margin: 0 }}>
          Desktop agent status: <span className="mt-badge">Not connected</span>
        </p>
      </div>
    </>
  );
}
