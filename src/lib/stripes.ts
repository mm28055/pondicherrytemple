"use client";

import { type RefObject, useLayoutEffect, useState } from "react";

/* The stripes at the top of the page are 20px red, 20px white. Rows of
   photographs are measured in them (the home page's strip, the Photographs
   page): each photo whole red stripes wide (40n + 20px), with a white one's
   width between photos; the whole row then drawn to the page's width, from
   margin to margin, a little larger or smaller than the stripes. */
export const STRIPE = 40;

/** A photo `units` stripes wide, in pixels. */
export const stripeWidth = (units: number) => units * STRIPE + STRIPE / 2;

export type StripeFit = {
  /** how many stripes long a row is */
  units: number;
  /** the height of its photos: the box's `--h`, if set */
  h: number;
  /** how much the stripes are drawn larger (or smaller) to fill the page's width */
  k: number;
  /** a photo `units` stripes wide, as drawn */
  width: (units: number) => number;
  /** the space between photos, as drawn */
  gap: number;
};

/** The row of photos in `box`: as many stripes as come nearest its width,
    drawn to fill it exactly. Measured in the browser, and again when the
    window changes size. */
export function useStripeFit(box: RefObject<HTMLElement | null>) {
  const [fit, setFit] = useState<StripeFit>();
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      const h = parseFloat(getComputedStyle(el).getPropertyValue("--h")) || 120;
      // (by the whole pixel, so boxes as wide as each other to a hair, on
      // different pages, are always the same number of stripes long)
      const units = Math.max(1, Math.round((Math.round(w) - STRIPE / 2) / STRIPE));
      const k = w / stripeWidth(units);
      setFit((f) =>
        f && f.units === units && f.h === h && f.k === k
          ? f
          : { units, h, k, width: (u: number) => stripeWidth(u) * k, gap: (STRIPE / 2) * k }
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    ro.observe(el);
    return () => ro.disconnect();
  }, [box]);
  return fit;
}

/** How many stripes wide a photo would be at height `h`, by its shape (not
    rounded). */
export const idealUnits = (p: { width: number; height: number }, h: number) =>
  ((h * p.width) / p.height - STRIPE / 2) / STRIPE;

/** Photos laid in rows `units` stripes long, each photo as wide as its shape
    suits at height `h` (at least 2 stripes). A row is filled exactly: a photo
    that would not quite fit is taken in, or left for the next row, whichever
    asks less of the others; then the photos furthest from their own shape
    give or take a stripe each until the row fits. The last row is left
    short, as its photos are. */
export function stripeRows<P extends { width: number; height: number }>(photos: P[], units: number, h: number) {
  const rows: { p: P; units: number }[][] = [];
  const pitch = units + 1; // each photo takes its width and the gap after it
  let i = 0;
  while (i < photos.length) {
    const row: { p: P; units: number; ideal: number }[] = [];
    let used = 0;
    while (i < photos.length) {
      const ideal = Math.max(2, idealUnits(photos[i], h));
      const n = Math.min(units, Math.max(2, Math.round(ideal)));
      if (used + n + 1 <= pitch) {
        row.push({ p: photos[i], units: n, ideal });
        used += n + 1;
        i++;
        continue;
      }
      // it would not fit: take it in (the row then gives up stripes) if that
      // asks less than leaving it out (the row then takes stripes on)
      const over = used + n + 1 - pitch;
      const under = pitch - used;
      const room = row.reduce((s, x) => s + x.units - 2, 0) + n - 2;
      if (!row.length || (over < under && over <= room)) {
        row.push({ p: photos[i], units: n, ideal });
        used += n + 1;
        i++;
      }
      break;
    }
    const last = i >= photos.length;
    // give or take a stripe at a time, from the photo it changes least
    while (used > pitch) {
      const x = row.filter((r) => r.units > 2).sort((a, b) => b.units / b.ideal - a.units / a.ideal)[0];
      if (!x) break;
      x.units--;
      used--;
    }
    while (used < pitch && !last) {
      const x = [...row].sort((a, b) => a.units / a.ideal - b.units / b.ideal)[0];
      x.units++;
      used++;
    }
    rows.push(row.map(({ p, units: n }) => ({ p, units: n })));
  }
  return rows;
}
