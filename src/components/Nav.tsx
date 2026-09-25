"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Tab = { href: string; label: string; match: (p: string) => boolean };

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
    match: (p) => p.startsWith("/festivals-and-rituals"),
  },
  { href: "/field-notes", label: "Field Notes", match: (p) => p.startsWith("/field-notes") },
  { href: "/articles", label: "Articles", match: (p) => p.startsWith("/articles") },
  { href: "/films", label: "Films", match: (p) => p.startsWith("/films") },
  { href: "/about", label: "About", match: (p) => p.startsWith("/about") },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className={active ? "active" : undefined}
                    aria-current={active ? "page" : undefined}
                  >
                    {t.label}
                  </Link>
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
