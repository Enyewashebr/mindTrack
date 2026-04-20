import { TodayPlanner } from "./components/TodayPlanner";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 760, margin: "48px auto", padding: "0 16px" }}>
      <h1>mindTrack</h1>
      <p>Register once, then load or create today&apos;s plan from the API.</p>
      <TodayPlanner />
    </main>
  );
}
