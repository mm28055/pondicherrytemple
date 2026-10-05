"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Photo } from "@/content/types";

/* The stripes at the top of the page are 20px red, 20px white, from the left
   edge of the window. The strip of photographs hangs from them: each photo
   spans whole red stripes (40n + 20px wide), as many as suit its shape, and
   the 20px between photos falls under a white one. The strip starts on the
   last red stripe at or before the page's margin and ends on the first red
   one at or after the other margin (so it lines up, more or less, with the
   text above and below), and is filled exactly: the last photo takes what is
   left. Every so often the whole strip blinks, slowly, to the next photos. */
const STRIPE = 40;
const EVERY = 9000; // ms between changes
const BLINK = 1200; // ms to fade out (and as long to fade back in)

type StripPhoto = Pick<Photo, "id" | "small" | "alt" | "focus" | "width" | "height">;
type Placed = { p: StripPhoto; units: number };

/** How many stripes wide a photo is at the strip's height: from 2 (an
    upright photo) to 6 (a wide one). */
function unitsFor(p: StripPhoto, h: number) {
  return Math.min(6, Math.max(2, Math.round(((h * p.width) / p.height - STRIPE / 2) / STRIPE)));
}

/** The photos that fill a strip `units` stripes long, from photo `from` on
    (round again to the first when they run out). Each photo, with the gap
    after it, takes its width + 1 stripes; the last takes what is left, and
    is never narrower than 3, so "See all photos" fits on it. */
function fill(photos: StripPhoto[], from: number, units: number, h: number): { set: Placed[]; next: number } {
  const set: Placed[] = [];
  let left = units + 1;
  let i = from;
  while (left > 0) {
    const p = photos[i % photos.length];
    let n = unitsFor(p, h);
    if (left - (n + 1) < 4) n = left - 1;
    set.push({ p, units: n });
    left -= n + 1;
    i++;
  }
  return { set, next: i % photos.length };
}

export function HomeStrip({ photos }: { photos: StripPhoto[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ back: number; units: number; h: number }>();
  const [from, setFrom] = useState(0);
  const [faded, setFaded] = useState(false);
  const [tick, setTick] = useState(0);

  // how far out past the page's margin the red stripe before it begins; and
  // how many stripes to the red one after the other margin (never past the
  // window)
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const back = ((r.left % STRIPE) + STRIPE) % STRIPE;
      const start = r.left - back;
      let units = Math.ceil((r.right - start - STRIPE / 2) / STRIPE);
      if (start + units * STRIPE + STRIPE / 2 > document.documentElement.clientWidth) units -= 1;
      const h = parseFloat(getComputedStyle(el).getPropertyValue("--h")) || 120;
      setFit((f) => (f && f.back === back && f.units === units && f.h === h ? f : { back, units, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

  const shown = fit ? fill(photos, from, fit.units, fit.h) : null;
  const next = shown?.next ?? 0;

  // the slow blink: fade the strip out, change every photo, fade it back in
  // (once the new ones have loaded). Not for those who prefer less motion,
  // nor while the page is out of sight.
  useEffect(() => {
    if (!fit || photos.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let live = true;
    const timers: number[] = [];
    const t = window.setTimeout(async () => {
      if (document.hidden) return setTick((n) => n + 1); // try again next time round
      const coming = fill(photos, next, fit.units, fit.h).set;
      const ready = Promise.all(
        coming.map(({ p }) => {
          const img = new Image();
          img.src = p.small;
          return img.decode().catch(() => undefined);
        })
      );
      setFaded(true);
      timers.push(
        window.setTimeout(async () => {
          await ready;
          if (!live) return;
          // the new photos, already loaded, and the strip fades back in
          setFrom(next);
          setFaded(false);
        }, BLINK)
      );
    }, EVERY);
    return () => {
      live = false;
      window.clearTimeout(t);
      timers.forEach((x) => window.clearTimeout(x));
    };
  }, [fit, from, next, photos, tick]);

  return (
    <div ref={box} className="home-strip">
      <div
        className={`home-strip-track${faded ? " faded" : ""}`}
        style={fit ? { width: fit.units * STRIPE + STRIPE / 2, marginLeft: -fit.back } : undefined}
        aria-live="off"
      >
        {shown?.set.map(({ p, units }, i) => {
          // the last photo, dimmed, is the way to all of them
          const last = i === shown.set.length - 1;
          return (
            <Link
              key={`${p.id}-${i}`}
              className={last ? "home-strip-photo home-strip-all" : "home-strip-photo"}
              href={last ? "/photographs" : `/photographs?photo=${p.id}`}
              style={{ width: units * STRIPE + STRIPE / 2 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.small} alt={last ? "" : p.alt} style={{ objectPosition: `${p.focus[0]}% ${p.focus[1]}%` }} />
              {last && (
                <span>
                  <span>See all photos</span>
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
