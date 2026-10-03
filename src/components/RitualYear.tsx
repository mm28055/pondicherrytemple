"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type TouchEvent } from "react";
import { monthDates, TAMIL_MONTHS } from "@/lib/calendar";
import { tamilYearName } from "@/lib/tamilDate";
import { MonthMotif } from "@/components/MonthMotif";

/** The ritual year as a South Indian chart (the rasi kattam): the twelve
    Tamil months round the edge of a square, Chithirai at the top, going
    clockwise; in the middle, the year itself — "2026–27", and its name in the
    sixty-year cycle, Parabhava — with what is done all through the year.

    A year runs from Chithirai to Panguni, as the temples keep it. It opens
    on the year we are in; the arrows either side of it, or a swipe across
    the chart (a finger, or two on a trackpad), go to the years before and
    after: back as far as the year the documentation began in (where the
    months before it are shown, but cannot be opened), forward without end.
    Each month opens its own page, in that year. On a phone the months are a
    plain list, in order. */
export function RitualYear({
  throughYear,
  today,
  begins,
}: {
  throughYear: { id: string; name: string }[];
  /** today, and the first day of the line of months (Masi 2026) */
  today: string;
  begins: string;
}) {
  // the year a date's ritual year begins in (it begins at Chithirai)
  const yearOf = (iso: string) => {
    const y = Number(iso.slice(0, 4));
    return iso >= monthDates("chithirai", y).first ? y : y - 1;
  };
  const first = yearOf(begins);
  const [year, setYear] = useState(yearOf(today));
  const [came, setCame] = useState<"" | "from-left" | "from-right">("");
  const grid = useRef<HTMLDivElement>(null);

  const go = (way: -1 | 1) => {
    if (way < 0 && year <= first) return bounce();
    setCame(way > 0 ? "from-right" : "from-left");
    setYear(year + way);
  };
  const drag = (dx: number, settle = false) => {
    const el = grid.current;
    if (!el) return;
    el.style.transition = settle ? "transform 0.3s ease" : "none";
    el.style.transform = dx ? `translateX(${dx}px)` : "";
  };
  const bounce = () => drag(0, true);

  // a two-finger swipe on a trackpad: it follows a little, and past a point
  // goes to the next or previous year; the trackpad's after-glide is let go
  const latest = useRef({ go, drag });
  latest.current = { go, drag };
  useEffect(() => {
    const el = grid.current?.parentElement;
    if (!el) return;
    let dx = 0;
    let quietUntil = 0;
    let rest: number | undefined;
    const onWheel = (e: WheelEvent) => {
      if (!dx && Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (Date.now() < quietUntil) return;
      dx -= e.deltaX;
      window.clearTimeout(rest);
      if (Math.abs(dx) > 140) {
        const way = dx < 0 ? 1 : -1;
        dx = 0;
        quietUntil = Date.now() + 700;
        latest.current.drag(0);
        latest.current.go(way);
        return;
      }
      latest.current.drag(dx * 0.4);
      rest = window.setTimeout(() => {
        dx = 0;
        quietUntil = Date.now() + 300;
        latest.current.drag(0, true);
      }, 220);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // a finger across the chart
  const start = useRef<{ x: number; y: number; along: boolean | null } | null>(null);
  const onTouchStart = (e: TouchEvent) => {
    start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, along: null };
  };
  const onTouchMove = (e: TouchEvent) => {
    const s = start.current;
    if (!s) return;
    const dx = e.touches[0].clientX - s.x, dy = e.touches[0].clientY - s.y;
    if (s.along === null && Math.hypot(dx, dy) > 8) s.along = Math.abs(dx) > Math.abs(dy) * 1.2;
    if (s.along) drag(dx * 0.4);
  };
  const onTouchEnd = (e: TouchEvent) => {
    const s = start.current;
    start.current = null;
    if (!s?.along) return;
    const dx = e.changedTouches[0].clientX - s.x;
    drag(0);
    if (Math.abs(dx) > 70) go(dx < 0 ? 1 : -1);
    else bounce();
  };

  const name = tamilYearName(year);
  const label = `${year}–${String(year + 1).slice(2)}`;

  return (
    <div className="rasi-years" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div ref={grid} key={year} className={`rasi${came ? ` ${came}` : ""}`}>
        {TAMIL_MONTHS.map((m) => {
          // the month in this year: Thai, Masi and Panguni fall in the next calendar year
          const y = monthDates(m.slug, year).first >= monthDates("chithirai", year).first ? year : year + 1;
          const { first: from, last: to } = monthDates(m.slug, y);
          const before = from < begins; // before the documentation began
          const now = today >= from && today <= to;
          const style = { "--r": m.rasi[0], "--c": m.rasi[1], "--m": m.colour } as CSSProperties;
          const inside = (
            <>
              {/* the month's drawing, as at the top of its page */}
              <MonthMotif month={m.slug} className="rasi-motif" fit />
              <span className="rasi-ta" lang="ta">
                {m.tamil}
              </span>
              <span className="caps">
                {m.name}
                {now && <span className="rasi-now"> · Now</span>}
              </span>
              <span className="rasi-span">{m.span}</span>
            </>
          );
          return before ? (
            <div key={m.slug} className="rasi-month before" style={style} title="Before the documentation began">
              {inside}
            </div>
          ) : (
            <Link
              key={m.slug}
              href={`/festivals-and-rituals/month/${m.slug}/${y}`}
              className={`rasi-month${now ? " now" : ""}`}
              style={style}
            >
              {inside}
            </Link>
          );
        })}

        <div className="rasi-centre">
          <div className="kicker">The ritual year</div>
          {/* the year, and its name in the sixty-year cycle; the years either side */}
          <div className="rasi-year">
            <button
              type="button"
              className="rasi-year-step"
              onClick={() => go(-1)}
              disabled={year <= first}
              aria-label={`The year before, ${year - 1}–${String(year).slice(2)}`}
            >
              ‹
            </button>
            <span className="rasi-year-num">{label}</span>
            <button
              type="button"
              className="rasi-year-step"
              onClick={() => go(1)}
              aria-label={`The year after, ${year + 1}–${String(year + 2).slice(2)}`}
            >
              ›
            </button>
          </div>
          <p className="rasi-year-name">
            <span lang="ta">{name.ta}</span> · {name.en}
          </p>
          <p>Open a month to see what the temples keep in it.</p>
          {throughYear.length > 0 && (
            <>
              <h3 className="caps">All through the year</h3>
              <ul>
                {throughYear.map((o) => (
                  <li key={o.id}>
                    <Link href={`/festivals-and-rituals/${o.id}`}>{o.name}</Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
