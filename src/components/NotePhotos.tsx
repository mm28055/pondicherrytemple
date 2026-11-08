"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { FieldVideo, Photo } from "@/content/types";
import { FilmVideo } from "./FilmVideo";
import { STRIPE, stripeRows, stripeWidth, useStripeFit } from "@/lib/stripes";
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

const VIDEO_MOST = 560; // a video in the column at most this tall (a phone's upright one)
const CAPTION = 30; // room for a video's caption under it

/** A field note's videos, first among its media: at the top of the column
    beside the text, or above the photographs on a phone, each at its own
    shape (16:9 until it says otherwise), with its caption. */
function NoteVideos({ videos, width, onShape }: { videos: FieldVideo[]; width?: number; onShape?: (i: number, shape: number) => void }) {
  return (
    <>
      {videos.map((v, i) => (
        <figure key={v.src} className="note-photos-video" style={width ? { width } : undefined}>
          <FilmVideo
            controls
            playsInline
            preload="metadata"
            src={v.src}
            poster={v.poster}
            onLoadedMetadata={(e) => {
              const el = e.currentTarget;
              if (el.videoWidth && el.videoHeight) onShape?.(i, el.videoWidth / el.videoHeight);
            }}
          />
          {v.caption && <figcaption>{v.caption}</figcaption>}
        </figure>
      ))}
    </>
  );
}

/** Beside a field note's text: its videos first, then photographs down the
    left of the page, from its margin, each as wide as whole stripes at the top
    of the page (the gaps a white one's width), as long as the text; as many as
    fit. When more are left, the last says how many, and opens them all in the
    column, carrying on down the page under the text ("See fewer" at the end). */
function NoteColumn({ photos, videos, seed, open }: { photos: Photo[]; videos: FieldVideo[]; seed: string; open: Open }) {
  // the space the photos may fill, beside the text (see site.css)
  const frame = useRef<HTMLDivElement>(null);
  const col = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ units: number; height: number }>();
  const [shapes, setShapes] = useState<Record<number, number>>({});
  const [all, setAll] = useState(false);

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

  const width = fit ? stripeWidth(fit.units) : 0;
  // the height the videos take at the top, with their gaps and captions
  const above = videos.reduce(
    (h, v, i) => h + Math.min(VIDEO_MOST, Math.round(width / (shapes[i] ?? 16 / 9))) + (v.caption ? CAPTION : 0) + GAP,
    0,
  );
  // (while the rest is open under the text, the column keeps the height it had,
  // so the photos beside the text stay as they were)
  const [held, setHeld] = useState<number>();
  const height = all && held !== undefined ? held : (fit?.height ?? 0);
  const laid = fit ? rows(photos, fit.units, height - above, seed) : [];
  const rest = photos.slice(laid.reduce((n, r) => n + r.cells.length, 0));

  // the rest, opened under the note's text (page: #note-more-photos)
  const [spot, setSpot] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => setSpot(document.getElementById("note-more-photos")), []);
  const wall = useRef<HTMLElement>(null);
  const openRest = () => {
    // the column ends level with the note's own text, and the rest open
    // under both, from margin to margin (site.css, .note-more)
    const top = frame.current?.getBoundingClientRect().top;
    const end = document.querySelector(".note-text > .note-body")?.getBoundingClientRect().bottom;
    setHeld(top !== undefined && end !== undefined && end > top ? Math.round(end - top) : fit?.height);
    setAll(true);
    requestAnimationFrame(() => wall.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const fewer = () => {
    setAll(false);
    if (col.current && col.current.getBoundingClientRect().bottom < 0) col.current.scrollIntoView();
  };

  return (
    <>
      <div ref={frame} className="note-photos-frame" />
      {fit && (
        <div ref={col} className="note-photos-col" style={{ width }}>
          <NoteVideos videos={videos} width={width} onShape={(i, s) => setShapes((m) => (m[i] === s ? m : { ...m, [i]: s }))} />
          {laid.map((row, k) => (
            <div key={k} className="note-photos-row" style={{ height: row.h }}>
              {row.cells.map(({ p, units }, j) => {
                // the last photo, when more are left (and not yet opened): how many, and the way to them
                const more = !all && rest.length > 0 && k === laid.length - 1 && j === row.cells.length - 1;
                return (
                  <button
                    key={j}
                    className={more ? "note-photos-photo note-photos-more" : "note-photos-photo"}
                    onClick={more ? openRest : () => open(p)}
                    aria-label={more ? undefined : p.alt || p.caption || "Photograph"}
                    style={{ width: stripeWidth(units) }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.medium} alt="" loading="lazy" style={{ objectPosition: `${p.focus[0]}% ${p.focus[1]}%` }} />
                    {more && (
                      <span>
                        <span>+ {rest.length + 1} photos</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          {/* no room for even one: the way to them, under the videos */}
          {!all && laid.length === 0 && rest.length > 0 && (
            <button className="arrow-link note-photos-fewer" onClick={openRest}>
              {rest.length} photo{rest.length === 1 ? "" : "s"}
            </button>
          )}
        </div>
      )}
      {all &&
        spot &&
        rest.length > 0 &&
        createPortal(
          <section ref={wall} className="note-more">
            <MoreRows photos={rest} open={open} fewer={fewer} />
          </section>,
          spot,
        )}
    </>
  );
}

/** The rest of a note's photos, opened under its text: in rows as the
    Photographs page lays them (lib/stripes), each photo whole stripes wide,
    a white stripe's width between, the row drawn from margin to margin; at
    the end, as there, the way back: the first of them again, darkened, its
    shape, "See fewer" over it. */
function MoreRows({ photos, open, fewer }: { photos: Photo[]; open: Open; fewer: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const fit = useStripeFit(box);
  const first = photos[0];
  const back = { id: "fewer", width: first.width, height: first.height, fewer: true as const };
  return (
    <div ref={box} className="photo-rows note-more-rows">
      {fit && (
        <div style={{ "--gap": `${fit.gap}px` } as CSSProperties}>
          {stripeRows<Photo | typeof back>([...photos, back], fit.units, fit.h).map((row) => (
            <div key={row[0].p.id} className="photo-row">
              {row.map(({ p, units }) =>
                "fewer" in p ? (
                  <button key={p.id} className="photo-tile photo-line-more photo-fewer" style={{ width: fit.width(units) }} onClick={fewer}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={fit.width(units) > 240 ? first.medium : first.small} alt="" loading="lazy" style={{ objectPosition: `${first.focus[0]}% ${first.focus[1]}%` }} />
                    <span>See fewer</span>
                  </button>
                ) : (
                  <button
                    key={p.id}
                    className="photo-tile"
                    style={{ width: fit.width(units) }}
                    onClick={() => open(p)}
                    aria-label={p.alt || p.caption || "Photograph"}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={fit.width(units) > 240 ? p.medium : p.small} alt="" loading="lazy" style={{ objectPosition: `${p.focus[0]}% ${p.focus[1]}%` }} />
                  </button>
                ),
              )}
            </div>
          ))}
        </div>
      )}
    </div>
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

/** A field note's videos and its own photographs (those of its photo sets),
    in the order taken: beside its text, or above it on a phone, the videos
    first. Each photo opens in the viewer. */
export function NotePhotos({ pack: photos, videos = [], seed }: { pack: PhotoPack; videos?: FieldVideo[]; seed: string }) {
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
              <>
                <NoteVideos videos={videos} />
                <NoteStrip photos={list} open={show} />
              </>
            ) : (
              <NoteColumn photos={list} videos={videos} seed={seed} open={show} />
            )}
          </div>
        );
      }}
    />
  );
}
