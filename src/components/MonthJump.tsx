"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TAMIL_MONTHS } from "@/lib/calendar";

/** Any month, not only the one before or after: the dropdowns of the
    Photographs and Films pages, a month and a year, in the month's colour.
    A choice goes to that month, the calendar staying where it was on the
    screen. A month's year is the year it falls in (Thai 2027 is January
    2027); the months before the calendar begins are not offered. Each opens
    across the band, as on those pages; the years begin under the year. */
export function MonthJump({ month, year, begins, years }: { month: string; year: number; begins: string; years: number[] }) {
  const router = useRouter();
  const go = (slug: string, y: number) => router.push(`/festivals-and-rituals/month/${slug}/${y}`, { scroll: false });
  // whether a month is in the calendar's line (on or after its first month)
  const open = (slug: string, y: number) => `${y}-${TAMIL_MONTHS.find((m) => m.slug === slug)!.starts}` >= begins;

  const [menu, setMenu] = useState<"month" | "year" | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const yearBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menu) return;
    const from = window.scrollY;
    const away = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setMenu(null);
    const key = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    const scrolled = () => Math.abs(window.scrollY - from) > 40 && setMenu(null);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", scrolled, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", scrolled);
    };
  }, [menu]);

  // a year without this month in the line (2026 has no Thai): its first month that is
  const toYear = (y: number) => go(open(month, y) ? month : TAMIL_MONTHS.find((m) => open(m.slug, y))!.slug, y);

  return (
    <div className="filter-bar month-jump" ref={box}>
      <div className="filter-bar-line">
        <span className="filter-bar-item">
          <button
            className={`filter-bar-btn${menu === "month" ? " open" : ""}`}
            aria-expanded={menu === "month"}
            onClick={() => setMenu(menu === "month" ? null : "month")}
          >
            Month <b>{TAMIL_MONTHS.find((m) => m.slug === month)!.name}</b>
            <i aria-hidden="true">▾</i>
          </button>
        </span>
        <span className="filter-bar-item">
          <button
            ref={yearBtn}
            className={`filter-bar-btn${menu === "year" ? " open" : ""}`}
            aria-expanded={menu === "year"}
            onClick={() => setMenu(menu === "year" ? null : "year")}
          >
            Year <b>{year}</b>
            <i aria-hidden="true">▾</i>
          </button>
        </span>
      </div>
      {menu === "year" && (
        <div
          className="filters filter-bar-panel"
          role="group"
          aria-label="Year"
          style={{ paddingLeft: yearBtn.current?.offsetLeft ?? 0 }}
        >
          {years.map((y) => (
            <button key={y} aria-pressed={y === year} onClick={() => toYear(y)}>
              {y}
            </button>
          ))}
        </div>
      )}
      {menu === "month" && (
        <div className="filters filter-bar-panel" role="group" aria-label="Month">
          {TAMIL_MONTHS.map((m) => (
            <button key={m.slug} aria-pressed={m.slug === month} disabled={!open(m.slug, year)} onClick={() => go(m.slug, year)}>
              {m.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
