"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { Photo } from "@/content/types";
import { STRIPE, stripeWidth } from "@/lib/stripes";
import { seeded } from "@/lib/mahotsavam";

type NotePhoto = Pick<Photo, "id" | "medium" | "alt" | "focus" | "width" | "height">;
type Row = { h: number; cells: { p: NotePhoto; units: number }[] };

const GAP = STRIPE / 2; // between photos, across and down: a white stripe's width
const BESIDE = 32; // at least this much between the photos and the text

/** The rows of the column, `units` stripes wide and `height` tall: a photo
    across the whole of it, or two side by side, each as wide as suits its
    shape (whole stripes) and the rows of varied heights, until the column
    is full; the last row takes the height left, so the photos end level with
    the text. Random, but always the same for the same note. */
function rows(photos: NotePhoto[], units: number, height: number, seed: string): Row[] {
  const r = seeded(seed);
  const out: Row[] = [];
  let y = 0;
  let i = 0;
  const next = () => photos[i++ % photos.length];
  const shape = (p: NotePhoto) => p.width / p.height;
  while (height - y >= 80 && photos.length) {
    let row: Row;
    if (units < 5 || r() < 0.35) {
      const p = next();
      const h = Math.round(Math.min(340, Math.max(140, stripeWidth(units) / shape(p))));
      row = { h, cells: [{ p, units }] };
    } else {
      const a = next();
      const b = next();
      // the two share the stripes (and one gap) as their shapes ask
      const share = (units - 1) * (shape(a) / (shape(a) + shape(b)));
      const ua = Math.min(units - 3, Math.max(2, Math.round(share)));
      const h = Math.round(120 + r() * 160);
      row = { h, cells: [{ p: a, units: ua }, { p: b, units: units - 1 - ua }] };
    }
    const left = height - y;
    // the last row: what is left, unless too little would be left after it
    if (left - (row.h + GAP) < 100) row.h = left;
    out.push(row);
    y += row.h + GAP;
  }
  return out;
}

/** Beside a field note's text: photographs down the left of the page, hung
    from the stripes at the top of the page (each photo spans whole red
    stripes, the gaps are white ones), as long as the text. On a narrow
    screen, a few rows under the text. For now, dummies: the site's
    photographs, in an order fixed by the note. */
export function NotePhotos({ photos, seed }: { photos: NotePhoto[]; seed: string }) {
  const box = useRef<HTMLDivElement>(null);
  // the space the photos may fill, beside the text (see site.css)
  const frame = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ back: number; units: number; height: number }>();

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const narrow = window.matchMedia("(max-width: 900px)").matches;
      const back = ((r.left % STRIPE) + STRIPE) % STRIPE;
      const start = r.left - back;
      // beside the text: end on a red stripe short of it; under it, the
      // red stripe at or after the margin, never past the window
      let units = narrow
        ? Math.ceil((r.right - start - GAP) / STRIPE)
        : Math.floor((r.right - BESIDE - start - GAP) / STRIPE);
      if (start + stripeWidth(units) > document.documentElement.clientWidth) units -= 1;
      const height = narrow ? 4 * 220 : Math.round(frame.current?.getBoundingClientRect().height ?? 0);
      setFit((f) => (f && f.back === back && f.units === units && f.height === height ? f : { back, units, height }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} className="note-photos" aria-hidden="true">
      <div ref={frame} className="note-photos-frame" />
      {fit && (
        <div className="note-photos-col" style={{ width: stripeWidth(fit.units), marginLeft: -fit.back }}>
          {rows(photos, fit.units, fit.height, seed).map((row, k) => (
            <div key={k} className="note-photos-row" style={{ height: row.h }}>
              {row.cells.map(({ p, units }, j) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={j}
                  src={p.medium}
                  alt=""
                  loading="lazy"
                  style={{ width: stripeWidth(units), objectPosition: `${p.focus[0]}% ${p.focus[1]}%` }}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
