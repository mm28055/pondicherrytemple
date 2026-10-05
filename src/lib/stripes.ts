"use client";

import { type RefObject, useLayoutEffect, useState } from "react";

/* The stripes at the top of the page are 20px red, 20px white, from the left
   edge of the window. Rows of photographs hang from them (the home page's
   strip, the Photographs page): each photo spans whole red stripes (40n +
   20px wide), and the 20px between photos falls under a white one. */
export const STRIPE = 40;

/** A photo `units` stripes wide, in pixels. */
export const stripeWidth = (units: number) => units * STRIPE + STRIPE / 2;

/** Where a row of photos in `box` goes: from the red stripe at or before the
    page's margin (`back` pixels out past it) to the red one at or after the
    other margin, never past the window; `units` stripes long. Also the
    box's `--h` (the height of its photos), if set. A box with `--phase:
    20px` hangs its photos from the white stripes instead (the gaps then
    under red ones). Measured in the browser,
    and again when the window changes size. */
export function useStripeFit(box: RefObject<HTMLElement | null>) {
  const [fit, setFit] = useState<{ back: number; units: number; h: number }>();
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      const phase = parseFloat(style.getPropertyValue("--phase")) || 0;
      let back = (((r.left - phase) % STRIPE) + STRIPE) % STRIPE;
      // never off the left of the window: then the stripe after it
      if (r.left - back < 0) back -= STRIPE;
      const start = r.left - back;
      let units = Math.ceil((r.right - start - STRIPE / 2) / STRIPE);
      if (start + stripeWidth(units) > document.documentElement.clientWidth) units -= 1;
      const h = parseFloat(style.getPropertyValue("--h")) || 120;
      setFit((f) => (f && f.back === back && f.units === units && f.h === h ? f : { back, units, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
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
