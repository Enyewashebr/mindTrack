import Link from "next/link";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export default function WeekPage() {
  return (
    <>
      <h1>Week</h1>
      <p className="mt-page-desc">
        Weekly planning will roll up goals into each day. This screen is UI-first: wire it to the API once
        weekly models exist.
      </p>

      <div className="mt-card">
        <p className="mt-card-title">Week overview</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
            gap: "0.75rem"
          }}
        >
          {DAYS.map((d) => (
            <div
              key={d}
              style={{
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "0.85rem",
                background: "var(--surface-2)",
                minHeight: 88,
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem"
              }}
            >
              <strong style={{ fontSize: "0.95rem" }}>{d}</strong>
              <span className="mt-muted" style={{ fontSize: "0.8rem" }}>
                No plan linked
              </span>
              <Link
                href="/today"
                className="mt-btn mt-btn-ghost"
                style={{ marginTop: "auto", fontSize: "0.8rem", textAlign: "center" }}
              >
                Open today
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-card">
        <p className="mt-card-title">Weekly focus</p>
        <p className="mt-muted" style={{ margin: 0 }}>
          Add 1–3 outcomes for the week (e.g. “Ship focus MVP”, “Exercise 4×”). Backend fields coming next.
        </p>
        <textarea
          className="mt-input"
          rows={3}
          placeholder="Outcome 1…&#10;Outcome 2…"
          style={{ marginTop: "0.75rem", resize: "vertical" }}
          readOnly
          aria-readonly="true"
        />
        <p className="mt-muted" style={{ marginBottom: 0, marginTop: "0.5rem", fontSize: "0.8rem" }}>
          Read-only placeholder until weekly goals are persisted.
        </p>
      </div>
    </>
  );
}
