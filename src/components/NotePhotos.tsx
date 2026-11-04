"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { Photo } from "@/content/types";
import { STRIPE, stripeWidth, useStripeFit } from "@/lib/stripes";
import { seeded } from "@/lib/mahotsavam";
import type { PhotoPack } from "@/lib/photoPack";
import { pack } from "./HomeStrip";
import { PhotoWall } from "./PhotoWall";

type Open = (photo: Photo) => void;
type Row = { h: number; cells: { p: Photo; units: number }[] };
type Placed = { p: Photo; units: number; fewer?: true };

const GAP = STRIPE / 2; // between photos, across and down: a white stripe's width
const BESIDE = 32; // at least this much between the photos and the text
const ROWS = 3; // on a phone, how many rows show until the rest are opened

/** The rows of the column, `units` stripes wide and `height` tall: a photo
    across the whole of it, or two side by side, each as wide as suits its
    shape (whole stripes) and the rows of varied heights, until the column
    is full; the last row takes the height left, so the photos end level with
    the text. Random, but always the same for the same note. */
function rows(photos: Photo[], units: number, height: number, seed: string): Row[] {
  const r = seeded(seed);
  const out: Row[] = [];
  let y = 0;
  let i = 0;
  const next = () => photos[i++];
  const shape = (p: Photo) => p.width / p.height;
  // (each photo once: the column ends early if they run out)
  while (height - y >= 80 && i < photos.length) {
    let row: Row;
    if (units < 5 || r() < 0.35 || photos.length - i < 2) {
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

/** Beside a field note's text: photographs down the left of the page, from
    its margin, each as wide as whole stripes at the top of the page (the gaps
    a white one's width), as long as the text; as many as fit. */
function NoteColumn({ photos, seed, open }: { photos: Photo[]; seed: string; open: Open }) {
  // the space the photos may fill, beside the text (see site.css)
  const frame = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ units: number; height: number }>();

  useLayoutEffect(() => {
    const el = frame.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const units = Math.floor((r.width - BESIDE - GAP) / STRIPE);
      const height = Math.round(r.height);
      setFit((f) => (f && f.units === units && f.height === height ? f : { units, height }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <div ref={frame} className="note-photos-frame" />
      {fit && (
        <div className="note-photos-col" style={{ width: stripeWidth(fit.units) }}>
          {rows(photos, fit.units, fit.height, seed).map((row, k) => (
            <div key={k} className="note-photos-row" style={{ height: row.h }}>
              {row.cells.map(({ p, units }, j) => (
                <button
                  key={j}
                  className="note-photos-photo"
                  onClick={() => open(p)}
                  aria-label={p.alt || p.caption || "Photograph"}
                  style={{ width: stripeWidth(units) }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.medium} alt="" loading="lazy" style={{ objectPosition: `${p.focus[0]}% ${p.focus[1]}%` }} />
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/** Every photo in rows, as the Field Notes page's strip lays them on a phone
    (lib/stripes, HomeStrip): the third row one photo short of the stripes,
    with a narrow photo after it, so that one can be the way to the rest. Each
    photo once; a last row short of photos is left short. */
function stripRows(photos: Photo[], units: number, h: number): Placed[][] {
  const out: Placed[][] = [];
  const pitch = units + 1;
  const most = Math.max(1, Math.floor(pitch / 3));
  let at = 0;
  while (at < photos.length) {
    const left = photos.length - at;
    const third = out.length === ROWS - 1 && left > most;
    const room = third ? pitch - 3 : pitch;
    const fits = Math.max(1, Math.floor(room / 3));
    const n = Math.min(fits, left);
    const row: Placed[] = pack(photos.slice(at, at + n), 0, n < fits ? n * 3 : room, h);
    at += n;
    if (third && at < photos.length) row.push({ p: photos[at++], units: 2 });
    out.push(row);
  }
  return out;
}

/** Above a field note's text on a phone: three rows of its photographs, as
    on the Field Notes page, the last a way to the rest of them, opened here. */
function NoteStrip({ photos, open }: { photos: Photo[]; open: Open }) {
  const box = useRef<HTMLDivElement>(null);
  const fit = useStripeFit(box);
  const [all, setAll] = useState(false);

  if (!photos.length) return null;
  let shown = fit ? stripRows(photos, fit.units, fit.h) : [];
  const cut = !all && shown.length > ROWS;
  if (cut) shown = shown.slice(0, ROWS);
  else if (all && fit && shown.length > ROWS) {
    // the way back to three rows, at the end of the last, or under it
    const last = shown[shown.length - 1];
    const used = last.reduce((n, c) => n + c.units + 1, 0);
    const tile: Placed = { p: photos[0], units: 2, fewer: true };
    shown = fit.units + 1 - used >= 3 ? [...shown.slice(0, -1), [...last, tile]] : [...shown, [tile]];
  }

  const fewer = () => {
    setAll(false);
    if (box.current && box.current.getBoundingClientRect().top < 0) box.current.scrollIntoView();
  };

  return (
    <div ref={box} className="home-strip note-strip">
      <div className="home-strip-track" style={fit ? ({ "--gap": `${fit.gap}px` } as CSSProperties) : undefined}>
        {shown.map((row, r) => (
          <div key={r} className="home-strip-row">
            {row.map(({ p, units, fewer: back }, i) => {
              const more = cut && r === shown.length - 1 && i === row.length - 1;
              return (
                <button
                  key={`${p.id}-${i}`}
                  className={more || back ? "home-strip-photo home-strip-all" : "home-strip-photo"}
                  onClick={more ? () => setAll(true) : back ? fewer : () => open(p)}
                  aria-label={more || back ? undefined : p.alt || p.caption || "Photograph"}
                  style={{ width: fit?.width(units) }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.small} alt="" loading="lazy" style={{ objectPosition: `${p.focus[0]}% ${p.focus[1]}%` }} />
                  {more && (
                    <span>
                      <span>See all photos</span>
                    </span>
                  )}
                  {back && <span>See fewer</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/** A field note's own photographs (those of its photo sets), in the order
    taken: beside its text, or above it on a phone. Each opens in the viewer. */
export function NotePhotos({ pack: photos, seed }: { pack: PhotoPack; seed: string }) {
  const [narrow, setNarrow] = useState<boolean>();

  useLayoutEffect(() => {
    const m = window.matchMedia("(max-width: 900px)");
    const set = () => setNarrow(m.matches);
    set();
    m.addEventListener("change", set);
    return () => m.removeEventListener("change", set);
  }, []);

  return (
    <PhotoWall
      pack={photos}
      layout="own"
      render={(list, open) => {
        const show: Open = (p) => open(list.indexOf(p));
        return (
          <div className="note-photos" style={{ "--rows": Math.min(ROWS, Math.ceil(list.length / 3)) } as CSSProperties}>
            {narrow === undefined ? null : narrow ? (
              <NoteStrip photos={list} open={show} />
            ) : (
              <NoteColumn photos={list} seed={seed} open={show} />
            )}
          </div>
        );
      }}
    />
  );
}
