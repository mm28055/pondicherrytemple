"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type TouchEvent } from "react";
import { monthDates, TAMIL_MONTHS } from "@/lib/calendar";
import { useToday } from "@/lib/useToday";
import { tamilPlace, tamilYearName } from "@/lib/tamilDate";
import { MonthMotif } from "@/components/MonthMotif";
import { inGlide, startGlide } from "@/components/MonthSwipe";
import { DropBand } from "@/components/DropBand";
import { CALENDAR_TA, spanTa } from "@/content/festivalsTa";
import { MONTHS_TA } from "@/content/homeTa";
import { MonthRing, type RingMonth } from "@/components/MonthRing";

/** The ritual year as a chart after the South Indian rasi kattam: the twelve
    Tamil months round the edge of a square, Chithirai in the top-left box,
    going clockwise; in the middle, the year itself — "2026–27", and its name
    in the sixty-year cycle, Parabhava.

    A year runs from Chithirai to Panguni, as the temples keep it. It opens
    on the year we are in; the years listed in the band above the chart (on
    a computer), the arrows either side of the year (on a phone, beside the
    page's title), or a swipe across the chart (a finger, or two on
    a trackpad), go to other years: back as far as the year the documentation began in (where
    the months before it are shown, but cannot be opened), forward without
    end; the band offers up to two years on.
    Each month opens its own page, in that year. On a phone the months are a
    circle (components/MonthRing), just under the title. */
export function RitualYear({
  today: built,
  begins,
  head,
  ta = false,
}: {
  /** on the Tamil page */
  ta?: boolean;
  /** the day the page was built, and the first day of the line of months (Masi 2026) */
  today: string;
  begins: string;
  /** the page's header: the way back, and its title */
  head: ReactNode;
}) {
  const T = ta ? CALENDAR_TA : null;
  const today = useToday(built);
  // the year a date's ritual year begins in (it begins at Chithirai)
  const yearOf = (iso: string) => {
    const y = Number(iso.slice(0, 4));
    return iso >= monthDates("chithirai", y).first ? y : y - 1;
  };
  const first = yearOf(begins);
  const [year, setYear] = useState(yearOf(today));
  // a new year begun since the page was built
  useEffect(() => {
    setYear((y) => (y === yearOf(built) ? yearOf(today) : y));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);
  const [came, setCame] = useState<"" | "from-left" | "from-right">("");
  const grid = useRef<HTMLDivElement>(null);

  const go = (way: -1 | 1) => {
    if (way < 0 && year <= first) return bounce();
    setCame(way > 0 ? "from-right" : "from-left");
    setYear(year + way);
  };
  // straight to a year, from the dropdown
  const goTo = (to: number) => {
    if (to === year) return;
    setCame(to > year ? "from-right" : "from-left");
    setYear(to);
  };
  const labelOf = (y: number) => `${y}–${String(y + 1).slice(2)}`;
  const last = Math.max(yearOf(today) + 2, year);
  const years = Array.from({ length: last - first + 1 }, (_, i) => first + i);
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
    let rest: number | undefined;
    const onWheel = (e: WheelEvent) => {
      if (!dx && Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (inGlide(e.deltaX)) return; // the glide after a swipe
      dx -= e.deltaX;
      window.clearTimeout(rest);
      if (Math.abs(dx) > 140) {
        const way = dx < 0 ? 1 : -1;
        dx = 0;
        startGlide(e.deltaX);
        latest.current.drag(0);
        latest.current.go(way);
        return;
      }
      latest.current.drag(dx * 0.4);
      rest = window.setTimeout(() => {
        dx = 0;
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

  // for the circle on a phone (filled as the months of the chart are laid out)
  const ringMonths: RingMonth[] = [];

  const name = tamilYearName(year);
  const label = labelOf(year);
  // today, in the circle's middle, in the year we are in
  const [ty, tm, td] = today.split("-").map(Number);
  const place = tamilPlace(ty, tm, td);
  const month = TAMIL_MONTHS[place.month];
  const ringToday =
    year === yearOf(today)
      ? {
          ta: `${month.tamil} ${place.day}`,
          en: month.name,
          date: ta ? `${td} ${MONTHS_TA[tm - 1]}` : new Date(Date.UTC(ty, tm - 1, td)).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" }),
        }
      : null;

  return (
    <>
    <header className="page-head landing-head calendar-head">
      {/* on a phone, at the right, on the title's line */}
      <div className="ring-year">
        <div className="rasi-year">
          <button
            type="button"
            className="rasi-year-step"
            onClick={() => go(-1)}
            disabled={year <= first}
            aria-label={T?.yearBefore(labelOf(year - 1)) ?? `The year before, ${labelOf(year - 1)}`}
          >
            ‹
          </button>
          <span className="rasi-year-num">{label}</span>
          <button type="button" className="rasi-year-step" onClick={() => go(1)} aria-label={T?.yearAfter(labelOf(year + 1)) ?? `The year after, ${labelOf(year + 1)}`}>
            ›
          </button>
        </div>
      </div>
      {head}
    </header>
    <section className="section tight">
    {/* the home page's "Full calendar" opens here, the chart filling the screen */}
    <div id="calendar" className="calendar-anchor">
    <DropBand
      className="year-band"
      drops={[
        {
          key: "year",
          label: T?.year ?? "Year",
          value: label,
          chosen: String(year),
          choices: years.map((y) => ({ id: String(y), label: labelOf(y) })),
          onPick: (y) => goTo(Number(y)),
          inline: true,
        },
      ]}
    />
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
              <MonthMotif month={m.slug} className="rasi-motif" fit ta={ta} />
              <span className="rasi-ta" lang="ta">
                {m.tamil}
              </span>
              <span className="caps">
                <span lang="en">{m.name}</span>
                {now && <span className="rasi-now"> · {T?.now ?? "Now"}</span>}
              </span>
              <span className="rasi-span">{ta ? spanTa(m.span) : m.span}</span>
            </>
          );
          ringMonths.push({
            slug: m.slug,
            name: ta ? m.tamil : m.name,
            colour: m.colour,
            href: before ? null : `${ta ? "/ta" : ""}/festivals-and-rituals/month/${m.slug}/${y}`,
            now,
          });
          return before ? (
            <div key={m.slug} className="rasi-month before" style={style} title={T?.before ?? "Before the documentation began"}>
              {inside}
            </div>
          ) : (
            <Link
              key={m.slug}
              href={`${ta ? "/ta" : ""}/festivals-and-rituals/month/${m.slug}/${y}`}
              className={`rasi-month${now ? " now" : ""}`}
              style={style}
            >
              {inside}
            </Link>
          );
        })}

        <div className="rasi-centre">
          <div className="kicker">{T?.kicker ?? "The ritual year"}</div>
          {/* the year, and its name in the sixty-year cycle */}
          <div className="rasi-year">
            <span className="rasi-year-num">{label}</span>
          </div>
          <p className="rasi-year-name">
            <span lang="ta">{name.ta}</span> · <span lang="en">{name.en}</span>
          </p>
          <p>{T?.open ?? "Open a month to see what the temples keep in it."}</p>
        </div>
        {/* (filled as the months above are laid out) */}
        <MonthRing months={ringMonths} today={ringToday} year={{ label, ...name }} />
      </div>
    </div>
    </div>
    </section>
    </>
  );
}
