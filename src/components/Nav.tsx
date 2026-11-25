"use client";

import { HIDDEN_TA } from "@/content/hiddenTa";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { KEEP_SCROLL } from "@/lib/keepScroll";
import { keepPlace, returnToPlace } from "@/lib/langPlace";
import { AI_TA, NAV_TA } from "@/content/homeTa";
import { englishOf, isTamil, tamilOf } from "@/lib/tamilPages";

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
  {
    // Writings: the field notes and the articles, with tabs between them (WritingsTabs)
    href: "/field-notes",
    label: "Writings",
    match: (p) => p.startsWith("/field-notes") || p.startsWith("/articles"),
  },
  { href: "/photographs", label: "Photographs", match: (p) => p.startsWith("/photographs") },
  { href: "/films", label: "Films", match: (p) => p.startsWith("/films") },
  { href: "/about", label: "About", match: (p) => p.startsWith("/about") },
];

export function Nav() {
  const address = usePathname();
  // the page, whichever language it is shown in (a Tamil page: /ta, then its English address)
  const ta = isTamil(address);
  const pathname = englishOf(address);
  const tamil = tamilOf(address);
  // the home page has the name large in its masthead: none in the bar, there only
  const home = pathname === "/";
  const name = (t: Tab) => (ta ? (NAV_TA[t.href] ?? t.label) : t.label);
  const [open, setOpen] = useState(false);
  // there, the bar's line comes only once the page has moved under it
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!home) return;
    const on = () => setScrolled(window.scrollY > 4);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [home]);
  // a dropdown just clicked through stays shut until the pointer leaves it
  const [shut, setShut] = useState<string | null>(null);

  // the other language: the page stays where it was (lib/langPlace)
  const stay = { [KEEP_SCROLL]: "", onClick: keepPlace };
  useLayoutEffect(returnToPlace, [address]);

  // close the mobile menu whenever the route changes
  useEffect(() => setOpen(false), [address]);

  // and when the page is tapped outside it, or scrolled
  const bar = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const from = window.scrollY;
    const away = (e: PointerEvent) => {
      if (!bar.current?.contains(e.target as Node)) setOpen(false);
    };
    const scrolled = () => Math.abs(window.scrollY - from) > 10 && setOpen(false);
    document.addEventListener("pointerdown", away);
    window.addEventListener("scroll", scrolled, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", away);
      window.removeEventListener("scroll", scrolled);
    };
  }, [open]);

  return (
    <>
    <header className={home ? `nav nav-home${scrolled ? " scrolled" : ""}` : "nav"} ref={bar}>
      <div className="stripes" aria-hidden="true" />
      <div className="wrap nav-inner">
        {!home && (
          <Link className="brand" href={ta ? "/ta" : "/"} aria-label={ta ? HIDDEN_TA.home : "Sthalam — home"}>
            <span>
              <span className="brand-word">Sthalam</span>
              <span className="brand-tamil" lang="ta">
                ஸ்தலம்
              </span>
            </span>
          </Link>
        )}
        <nav aria-label={ta ? HIDDEN_TA.main : "Main"} lang={ta ? "ta" : undefined}>
          <ul className={`nav-links${ta ? " in-ta" : ""}${open ? " open" : ""}`} id="primary-nav">
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
                    href={(ta && tamilOf(t.href)) || t.href}
                    className={active ? "active" : undefined}
                    aria-current={active && !t.sub?.some((u) => u.match(pathname)) ? "page" : undefined}
                  >
                    {name(t)}
                  </Link>
                  {t.sub && (
                    <ul className="nav-sub">
                      {t.sub.map((u) => (
                        <li key={u.href}>
                          <Link
                            href={(ta && tamilOf(u.href)) || u.href}
                            className={u.match(pathname) ? "active" : undefined}
                            aria-current={u.match(pathname) ? "page" : undefined}
                          >
                            {name(u)}
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
        {/* the languages; on a phone or tablet, the menu button under them */}
        <div className="nav-side">
        <div className="nav-lang" role="group" aria-label={ta ? HIDDEN_TA.language : "Language"} lang={ta ? "ta" : undefined}>
          {ta && <span className="nav-ai" lang="ta">{AI_TA}</span>}
          {ta ? (
            // (in place of this page in the tab's history: the same page)
            <Link className="en" href={pathname} replace scroll={false} {...stay} lang="en" hrefLang="en" aria-label="English">
              EN
            </Link>
          ) : (
            <span className="on en" aria-current="true">
              EN
            </span>
          )}
          <span className="nav-lang-bar" aria-hidden="true" />
          {ta ? (
            <span className="on ta" lang="ta" aria-current="true">
              த
            </span>
          ) : tamil ? (
            <Link className="ta" href={tamil} replace scroll={false} {...stay} lang="ta" hrefLang="ta" aria-label="தமிழ்">
              த
            </Link>
          ) : (
            // (no Tamil version of this page to go to yet)
            <button className="ta" type="button" lang="ta" aria-label="Tamil" aria-disabled="true">
              த
            </button>
          )}
        </div>
        <button
          className="nav-toggle"
          aria-label={ta ? HIDDEN_TA.menu : "Menu"}
          lang={ta ? "ta" : undefined}
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        </div>
      </div>
    </header>
    {/* on a computer, under the languages, level with the link back (and in its bar: BackLink) */}
    {ta && (
      <div className="ai-line" lang="ta">
        <div className="wrap">
          <span className="ai-words">{AI_TA}</span>
        </div>
      </div>
    )}
    </>
  );
}
