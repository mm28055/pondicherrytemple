"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";

export type WheelMonth = { slug: string; href: string; now: boolean; colour: string; inside: ReactNode };

/** On a phone, the Calendar's months as a wheel that turns: the month we are
    in (or the year's first, in another year) in the middle, the others
    turning away above and below it, fainter and tipped back the further
    they are, as on a drum. A finger turns it, a month at a time; the whole
    year comes round again (Panguni, then Chithirai), so it has no ends. On
    arriving it turns a little way to its month, to show that it turns;
    with "less motion" asked for, it is simply there. Each month opens its
    page, as in the chart. (On a computer: the chart, components/RitualYear.) */
const ROW = 112; // px: one month
const COPIES = 7; // the year, round and round: enough that a finger never reaches an end

export function MonthWheel({ months, year }: { months: WheelMonth[]; year: number }) {
  const box = useRef<HTMLDivElement>(null);
  const n = months.length;
  const round = n === 12; // only a whole year comes round again
  const copies = round ? COPIES : 1;
  const middle = round ? Math.floor(COPIES / 2) * n : 0;
  const home = Math.max(0, months.findIndex((m) => m.now));

  // each month tipped and faded by how far it is from the middle
  const turn = () => {
    const el = box.current;
    if (!el) return;
    const mid = el.scrollTop + el.clientHeight / 2;
    for (const item of el.children as HTMLCollectionOf<HTMLElement>) {
      if (!item.dataset.i) continue;
      const d = (item.offsetTop + ROW / 2 - mid) / ROW;
      const a = Math.min(3, Math.abs(d));
      item.style.transform = `perspective(520px) rotateX(${(-d * 34).toFixed(2)}deg) scale(${(1 - a * 0.07).toFixed(3)})`;
      item.style.opacity = (1 - a * 0.34).toFixed(3);
    }
  };

  const at = (i: number) => i * ROW; // the scroll that puts month i in the middle (the padding sees to that)

  // arrive on the month: from two months before it, turning to it and
  // slowing as it comes (the turn stops at a touch)
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const target = at(middle + home);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      el.scrollTop = target;
      turn();
      el.classList.add("ready");
      return;
    }
    const from = target - ROW * 2;
    const SPIN = 1100; // ms
    el.style.scrollSnapType = "none"; // (or the browser snaps it short)
    el.scrollTop = from;
    turn();
    el.classList.add("ready"); // shown only once it is on its month
    let frame = 0;
    let begun = 0;
    const done = () => {
      cancelAnimationFrame(frame);
      el.style.scrollSnapType = "";
      el.removeEventListener("pointerdown", done);
      el.removeEventListener("wheel", done);
    };
    const step = (t: number) => {
      begun ||= t;
      const k = Math.min(1, (t - begun) / SPIN);
      el.scrollTop = from + (target - from) * (1 - (1 - k) ** 3);
      if (k < 1) frame = requestAnimationFrame(step);
      else done();
    };
    const wait = window.setTimeout(() => (frame = requestAnimationFrame(step)), 200);
    el.addEventListener("pointerdown", done);
    el.addEventListener("wheel", done, { passive: true });
    return () => {
      window.clearTimeout(wait);
      done();
    };
    // a new year: arrive again
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, n]);

  // turning: the months follow; once it rests, it is quietly brought back to
  // the middle year, which looks the same, so it can turn on for ever
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let frame = 0;
    let rest = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(turn);
      if (!round) return;
      window.clearTimeout(rest);
      rest = window.setTimeout(() => {
        const i = Math.round(el.scrollTop / ROW);
        const back = Math.floor((i - middle) / n) * n;
        if (back) {
          el.scrollTop -= back * ROW;
          turn();
        }
      }, 160);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      window.clearTimeout(rest);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, n, middle]);

  const items = Array.from({ length: copies }, (_, c) =>
    months.map((m, k) => (
      <Link
        key={`${c}-${m.slug}`}
        data-i={c * n + k}
        href={m.href}
        className={`rasi-month wheel-month${m.now ? " now" : ""}`}
        style={{ "--m": m.colour } as CSSProperties}
        tabIndex={c * n + k === middle + k ? 0 : -1}
        aria-hidden={c * n + k === middle + k ? undefined : true}
      >
        {m.inside}
      </Link>
    ))
  ).flat();

  return (
    <div className="wheel" style={{ "--row": `${ROW}px` } as CSSProperties}>
      <span className="wheel-cue up" aria-hidden="true">
        ‹
      </span>
      <div ref={box} className="wheel-box" aria-label="The months of the year">
        {items}
      </div>
      <span className="wheel-cue down" aria-hidden="true">
        ›
      </span>
    </div>
  );
}
