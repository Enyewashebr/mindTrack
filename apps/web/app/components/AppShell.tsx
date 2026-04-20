import type { ReactNode } from "react";
import { Suspense } from "react";
import { SidebarNav } from "./SidebarNav";

function SidebarFallback() {
  return (
    <aside className="mt-sidebar">
      <span className="mt-brand" style={{ cursor: "default" }}>
        mindTrack
      </span>
      <nav className="mt-nav" aria-label="Main" aria-busy="true">
        <span className="mt-muted" style={{ padding: "0.5rem 0.65rem", fontSize: "0.9rem" }}>
          Loading menu…
        </span>
      </nav>
    </aside>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mt-app">
      <Suspense fallback={<SidebarFallback />}>
        <SidebarNav />
      </Suspense>
      <div className="mt-main">{children}</div>
    </div>
  );
}
