"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";

export type WheelMonth = { slug: string; href: string; now: boolean; colour: string; inside: ReactNode };

/** On a phone, the Calendar's months in a box that scrolls, three and a half
    of them showing, opening on the month we are in (or the year's first, in
    another year). Each month opens its page, as in the chart. (On a computer:
    the chart, components/RitualYear.) */
const ROW = 112; // px: one month

export function MonthWheel({ months, year }: { months: WheelMonth[]; year: number }) {
  const box = useRef<HTMLDivElement>(null);
  const n = months.length;
  const home = Math.max(0, months.findIndex((m) => m.now));

  // its month in the middle of the box, as near as the ends allow
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    el.scrollTop = home * ROW - (el.clientHeight - ROW) / 2;
    el.classList.add("ready");
  }, [year, n, home]);

  return (
    <div className="wheel" style={{ "--row": `${ROW}px` } as CSSProperties}>
      <div ref={box} className="wheel-box" aria-label="The months of the year">
        {months.map((m) => (
          <Link
            key={m.slug}
            href={m.href}
            className={`rasi-month wheel-month${m.now ? " now" : ""}`}
            style={{ "--m": m.colour } as CSSProperties}
          >
            {m.inside}
          </Link>
        ))}
      </div>
    </div>
  );
}
