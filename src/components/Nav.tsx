"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Tab = {
  href: string;
  label: string;
  match: (p: string) => boolean;
  /** pages under it: a dropdown below its label (in the phone menu, beneath it) */
  sub?: Tab[];
};

// the calendar, and the month pages it opens
const inCalendar = (p: string) => p.startsWith("/calendar") || p.startsWith("/festivals-and-rituals/month");

const TABS: Tab[] = [
  {
    href: "/pondicherry",
    label: "Temples",
    // the region and its temple pages, but not its book
    match: (p) => p.startsWith("/pondicherry") && !p.startsWith("/pondicherry/book"),
  },
  {
    href: "/festivals-and-rituals",
    label: "Festivals & Rituals",
    match: (p) => p.startsWith("/festivals-and-rituals") || inCalendar(p),
    sub: [{ href: "/calendar", label: "Calendar", match: inCalendar }],
  },
  { href: "/field-notes", label: "Field Notes", match: (p) => p.startsWith("/field-notes") },
  { href: "/articles", label: "Articles", match: (p) => p.startsWith("/articles") },
  { href: "/films", label: "Films", match: (p) => p.startsWith("/films") },
  { href: "/about", label: "About", match: (p) => p.startsWith("/about") },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // a dropdown just clicked through stays shut until the pointer leaves it
  const [shut, setShut] = useState<string | null>(null);

  // close the mobile menu whenever the route changes
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="nav">
      <div className="stripes" aria-hidden="true" />
      <div className="wrap nav-inner">
        <Link className="brand" href="/" aria-label="Sthalam — home">
          <span>
            <span className="brand-word">Sthalam</span>
            <span className="brand-tamil" lang="ta">
              ஸ்தலம்
            </span>
          </span>
        </Link>
        <nav aria-label="Main">
          <ul className={`nav-links${open ? " open" : ""}`} id="primary-nav">
            {TABS.map((t) => {
              const active = t.match(pathname);
              return (
                <li
                  key={t.href}
                  className={t.sub ? `has-sub${shut === t.href ? " shut" : ""}` : undefined}
                  onClick={t.sub ? () => setShut(t.href) : undefined}
                  onMouseLeave={t.sub ? () => setShut(null) : undefined}
                >
                  <Link
                    href={t.href}
                    className={active ? "active" : undefined}
                    aria-current={active && !t.sub?.some((u) => u.match(pathname)) ? "page" : undefined}
                  >
                    {t.label}
                  </Link>
                  {t.sub && (
                    <ul className="nav-sub">
                      {t.sub.map((u) => (
                        <li key={u.href}>
                          <Link
                            href={u.href}
                            className={u.match(pathname) ? "active" : undefined}
                            aria-current={u.match(pathname) ? "page" : undefined}
                          >
                            {u.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        <button
          className="nav-toggle"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>
    </header>
  );
}
