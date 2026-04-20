export default function FocusPage() {
  return (
    <>
      <h1>Focus</h1>
      <p className="mt-page-desc">
        Strong blocking (desktop) and soft blocking (mobile) will plug in here. For now this is the control
        room layout: session timer, blocklist, and status.
      </p>

      <div className="mt-card">
        <p className="mt-card-title">Session</p>
        <div className="mt-row" style={{ alignItems: "baseline", gap: "1rem" }}>
          <span style={{ fontSize: "2.5rem", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            25:00
          </span>
          <span className="mt-badge">Pomodoro (mock)</span>
        </div>
        <p className="mt-muted" style={{ marginBottom: "0.75rem" }}>
          Start / pause will connect to a real focus session API. “No plan, no focus” will be enforced there.
        </p>
        <div className="mt-row">
          <button type="button" className="mt-btn" disabled title="Requires focus session API">
            Start focus
          </button>
          <button type="button" className="mt-btn mt-btn-ghost" disabled>
            Pause
          </button>
        </div>
      </div>

      <div className="mt-card">
        <p className="mt-card-title">Blocklist</p>
        <ul className="mt-task-list" style={{ marginBottom: "0.75rem" }}>
          <li>YouTube</li>
          <li>TikTok</li>
          <li>Telegram</li>
        </ul>
        <p className="mt-muted" style={{ margin: 0, fontSize: "0.85rem" }}>
          Static examples — editable list + sync to desktop agent comes later.
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
