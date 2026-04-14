const todayTasks = [
  "Define today's focus blocks",
  "Create tasks for each block",
  "Start first focus session"
];

export default function HomePage() {
  return (
    <main style={{ maxWidth: 760, margin: "48px auto", padding: "0 16px" }}>
      <h1>mindTrack</h1>
      <p>Today setup checklist for planning MVP.</p>

      <section>
        <h2>Today's Plan</h2>
        <ul>
          {todayTasks.map((task) => (
            <li key={task}>{task}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
