"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/today", label: "Today" },
  { href: "/week", label: "Week" },
  { href: "/focus", label: "Focus" },
  { href: "/insights", label: "Insights" },
  { href: "/settings", label: "Settings" }
] as const;

export function SidebarNav() {
  const pathname = usePathname();

  return (
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
  );
}
