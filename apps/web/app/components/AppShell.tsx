"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAV = [
  { href: "/today", label: "Today" },
  { href: "/week", label: "Week" },
  { href: "/focus", label: "Focus" },
  { href: "/insights", label: "Insights" },
  { href: "/settings", label: "Settings" }
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mt-app">
      <aside className="mt-sidebar">
        <Link href="/today" className="mt-brand">
          mindTrack
        </Link>
        <nav className="mt-nav" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "mt-nav-active" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="mt-main">{children}</div>
    </div>
  );
}
