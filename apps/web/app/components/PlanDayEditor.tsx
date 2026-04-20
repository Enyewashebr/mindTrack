"use client";

import { useCallback, useState, type FormEvent } from "react";
import { todayAtLocalTime } from "../lib/dates";

export type DraftBlock = {
  clientId: string;
  title: string;
  startTime: string;
  endTime: string;
  tasks: Array<{ clientId: string; title: string }>;
};

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function emptyBlock(): DraftBlock {
  return {
    clientId: newId(),
    title: "",
    startTime: "09:00",
    endTime: "10:00",
    tasks: [{ clientId: newId(), title: "" }]
  };
}

type Props = {
  dayIso: string;
  disabled?: boolean;
  onSave: (payload: {
    timeBlocks: Array<{
      title: string;
      startsAt: string;
      endsAt: string;
      tasks: Array<{ title: string }>;
    }>;
  }) => void;
};

export function PlanDayEditor({ dayIso, disabled, onSave }: Props) {
  const [blocks, setBlocks] = useState<DraftBlock[]>([emptyBlock()]);
  const [localError, setLocalError] = useState<string | null>(null);

  const addBlock = useCallback(() => {
    setBlocks((prev) => [...prev, emptyBlock()]);
  }, []);

  const removeBlock = useCallback((clientId: string) => {
    setBlocks((prev) => (prev.length <= 1 ? prev : prev.filter((b) => b.clientId !== clientId)));
  }, []);

  const updateBlock = useCallback((clientId: string, patch: Partial<DraftBlock>) => {
    setBlocks((prev) => prev.map((b) => (b.clientId === clientId ? { ...b, ...patch } : b)));
  }, []);

  const addTask = useCallback((blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.clientId === blockId
          ? { ...b, tasks: [...b.tasks, { clientId: newId(), title: "" }] }
          : b
      )
    );
  }, []);

  const updateTask = useCallback((blockId: string, taskId: string, title: string) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.clientId === blockId
          ? {
              ...b,
              tasks: b.tasks.map((t) => (t.clientId === taskId ? { ...t, title } : t))
            }
          : b
      )
    );
  }, []);

  const removeTask = useCallback((blockId: string, taskId: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.clientId !== blockId) {
          return b;
        }
        const tasks = b.tasks.filter((t) => t.clientId !== taskId);
        return { ...b, tasks: tasks.length ? tasks : [{ clientId: newId(), title: "" }] };
      })
    );
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);
    const timeBlocks = blocks.map((b) => ({
      title: b.title.trim() || "Untitled block",
      startsAt: todayAtLocalTime(b.startTime, dayIso),
      endsAt: todayAtLocalTime(b.endTime, dayIso),
      tasks: b.tasks
        .map((t) => ({ title: t.title.trim() }))
        .filter((t) => t.title.length > 0)
    }));

    const invalid = timeBlocks.some((tb) => new Date(tb.startsAt) >= new Date(tb.endsAt));
    if (invalid) {
      setLocalError("Each block needs an end time after the start time.");
      return;
    }

    onSave({ timeBlocks });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-card" style={{ marginBottom: 0 }}>
      <p className="mt-card-title">Build today&apos;s plan</p>
      <p className="mt-muted" style={{ marginTop: 0 }}>
        Add time blocks and tasks, then save. This replaces today&apos;s plan on the server.
      </p>
      {localError ? <p className="mt-error">{localError}</p> : null}

      {blocks.map((block) => (
        <div key={block.clientId} className="mt-editor-block">
          <div className="mt-editor-block-head">
            <div>
              <label className="mt-label" htmlFor={`title-${block.clientId}`}>
                Block title
              </label>
              <input
                id={`title-${block.clientId}`}
                className="mt-input"
                value={block.title}
                onChange={(ev) => updateBlock(block.clientId, { title: ev.target.value })}
                placeholder="Deep work"
                disabled={disabled}
              />
            </div>
            <div className="mt-small-grid">
              <div>
                <label className="mt-label" htmlFor={`start-${block.clientId}`}>
                  Start
                </label>
                <input
                  id={`start-${block.clientId}`}
                  type="time"
                  className="mt-input"
                  value={block.startTime}
                  onChange={(ev) => updateBlock(block.clientId, { startTime: ev.target.value })}
                  disabled={disabled}
                />
              </div>
              <div>
                <label className="mt-label" htmlFor={`end-${block.clientId}`}>
                  End
                </label>
                <input
                  id={`end-${block.clientId}`}
                  type="time"
                  className="mt-input"
                  value={block.endTime}
                  onChange={(ev) => updateBlock(block.clientId, { endTime: ev.target.value })}
                  disabled={disabled}
                />
              </div>
            </div>
            <button
              type="button"
              className="mt-btn mt-btn-ghost"
              onClick={() => removeBlock(block.clientId)}
              disabled={disabled || blocks.length <= 1}
            >
              Remove block
            </button>
          </div>

          <p className="mt-label" style={{ marginBottom: "0.35rem" }}>
            Tasks
          </p>
          {block.tasks.map((task) => (
            <div key={task.clientId} className="mt-row" style={{ marginBottom: "0.35rem" }}>
              <input
                className="mt-input"
                style={{ flex: 1, minWidth: 120 }}
                value={task.title}
                onChange={(ev) => updateTask(block.clientId, task.clientId, ev.target.value)}
                placeholder="Task description"
                disabled={disabled}
              />
              <button
                type="button"
                className="mt-btn mt-btn-ghost"
                onClick={() => removeTask(block.clientId, task.clientId)}
                disabled={disabled}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            className="mt-btn mt-btn-ghost"
            style={{ marginTop: "0.5rem" }}
            onClick={() => addTask(block.clientId)}
            disabled={disabled}
          >
            Add task
          </button>
        </div>
      ))}

      <div className="mt-row" style={{ marginTop: "0.75rem" }}>
        <button type="button" className="mt-btn mt-btn-ghost" onClick={addBlock} disabled={disabled}>
          Add time block
        </button>
        <button type="submit" className="mt-btn" disabled={disabled}>
          Save plan to server
        </button>
      </div>
    </form>
  );
}
