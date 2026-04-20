export default function InsightsPage() {
  const bars = [40, 65, 35, 80, 55, 70, 45];
  const labels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <>
      <h1>Insights</h1>
      <p className="mt-page-desc">
        Plan vs actual, distraction patterns, and streaks will render here from aggregated API data. Numbers
        below are placeholders for layout only.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "1rem",
          marginBottom: "1.25rem"
        }}
      >
        {[
          { label: "Planned hours", value: "6.5h" },
          { label: "Focused (mock)", value: "4.2h" },
          { label: "Top distraction", value: "YouTube" }
        ].map((card) => (
          <div key={card.label} className="mt-card" style={{ marginBottom: 0 }}>
            <p className="mt-card-title">{card.label}</p>
            <p style={{ fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-card">
        <p className="mt-card-title">Last 7 days (mock depth)</p>
        <div className="mt-chart" role="img" aria-label="Mock bar chart for seven days">
          {bars.map((h, i) => (
            <div
              key={`weekday-${i}`}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
            >
              <div className="mt-chart-bar" style={{ height: `${h}%`, width: "100%" }} />
              <span className="mt-muted" style={{ fontSize: "0.75rem" }}>
                {labels[i]}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-muted" style={{ margin: "0.75rem 0 0", fontSize: "0.85rem" }}>
          When analytics endpoints exist, bars will reflect real focused minutes per day.
        </p>
      </div>
    </>
  );
}
