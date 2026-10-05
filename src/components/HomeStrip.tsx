"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Photo } from "@/content/types";
import { idealUnits, stripeWidth, useStripeFit } from "@/lib/stripes";

/* The stripes at the top of the page are 20px red, 20px white, from the left
   edge of the window. The strip of photographs hangs from them: each photo
   spans whole red stripes (40n + 20px wide), as many as suit its shape, and
   the 20px between photos falls under a white one. The strip starts on the
   last red stripe at or before the page's margin and ends on the first red
   one at or after the other margin (so it lines up, more or less, with the
   text above and below), and is filled exactly: the last photo takes what is
   left. On a phone, too narrow for that, there are two rows, as many photos
   in each as fit, and the last a narrow one. Every so often the whole strip
   blinks, slowly, to the next photos. */
const EVERY = 9000; // ms between changes
const BLINK = 1200; // ms to fade out (and as long to fade back in)

type StripPhoto = Pick<Photo, "id" | "small" | "alt" | "focus" | "width" | "height">;
type Placed = { p: StripPhoto; units: number };

/** How many stripes wide a photo is at the strip's height: from 2 (an
    upright photo) to 6 (a wide one). */
function unitsFor(p: StripPhoto, h: number) {
  return Math.min(6, Math.max(2, Math.round(idealUnits(p, h))));
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

/** On a phone: as many photos as fit in `pitch` stripes (each at least 2
    wide, with its gap 3), from photo `from` on; the stripes over go one at
    a time to the photo most cropped from its own shape. */
function pack(photos: StripPhoto[], from: number, pitch: number, h: number): Placed[] {
  const set = Array.from({ length: Math.max(1, Math.floor(pitch / 3)) }, (_, k) => {
    const p = photos[(from + k) % photos.length];
    return { p, units: 2, ideal: Math.max(2, idealUnits(p, h)) };
  });
  for (let over = pitch - set.length * 3; over > 0; over--) {
    set.reduce((a, b) => (b.ideal / b.units > a.ideal / a.units ? b : a)).units++;
  }
  return set.map(({ p, units }) => ({ p, units }));
}

/** The rows of the strip, from photo `from` on: one row; or on a phone (a
    strip lower than 100px), two, the last photo of the second 2 stripes
    wide. */
function compose(photos: StripPhoto[], from: number, units: number, h: number): { rows: Placed[][]; next: number } {
  if (h >= 100) {
    const { set, next } = fill(photos, from, units, h);
    return { rows: [set], next };
  }
  const first = pack(photos, from, units + 1, h);
  const second = pack(photos, from + first.length, units + 1 - 3, h);
  const at = from + first.length + second.length;
  second.push({ p: photos[at % photos.length], units: 2 });
  return { rows: [first, second], next: (at + 1) % photos.length };
}

export function HomeStrip({ photos }: { photos: StripPhoto[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [from, setFrom] = useState(0);
  const [faded, setFaded] = useState(false);
  const [tick, setTick] = useState(0);

  const fit = useStripeFit(box);
  const shown = fit ? compose(photos, from, fit.units, fit.h) : null;
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
      const coming = compose(photos, next, fit.units, fit.h).rows.flat();
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
        style={fit ? { width: stripeWidth(fit.units), marginLeft: -fit.back } : undefined}
        aria-live="off"
      >
        {shown?.rows.map((row, r) => (
          <div key={r} className="home-strip-row">
            {row.map(({ p, units }, i) => {
              // the last photo, dimmed, is the way to all of them
              const last = r === shown.rows.length - 1 && i === row.length - 1;
              return (
                <Link
                  key={`${p.id}-${i}`}
                  className={last ? "home-strip-photo home-strip-all" : "home-strip-photo"}
                  href={last ? "/photographs" : `/photographs?photo=${p.id}`}
                  style={{ width: stripeWidth(units) }}
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
        ))}
      </div>
    </div>
  );
}
