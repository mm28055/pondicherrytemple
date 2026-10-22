"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { Facing, Illustration } from "@/content/types";
import { LAYOUT_STEP, LAYOUT_UNDER } from "@/lib/layoutStack";

/* A layout is drawn with its deity facing down (south); on the site north is
   at the top, so it is turned until its deity faces the way the drawing says
   (Drawings: "The deity faces"): east, a quarter turn to the left (its foot
   to the right); north, upside down; west, a quarter turn to the right; the
   four between, by an eighth more. Clockwise, in degrees. */
const TURN: Record<Facing, number> = {
  south: 0,
  "south-east": -45,
  east: -90,
  "north-east": -135,
  north: 180,
  "north-west": 135,
  west: 90,
  "south-west": 45,
};

/** A layout's shape on the screen, turned: the box round the turned drawing,
    and its width over its height. */
function shapeOf(d: Illustration) {
  const turn = d.faces ? TURN[d.faces] : 0;
  const a = (turn * Math.PI) / 180;
  const w = Math.abs(d.width * Math.cos(a)) + Math.abs(d.height * Math.sin(a));
  const h = Math.abs(d.width * Math.sin(a)) + Math.abs(d.height * Math.cos(a));
  return { turn, w, h, ratio: w / h };
}

/** A layout's image, turned as its deity faces: as it is, or, turned, drawn
    in a box of the turned shape (an SVG, which takes its width from its
    height, or its height from its width, as an image does). `fill`: covering
    a box of its own shape (the cards under the top one). */
function LayoutImage({ d, alt, style, fill }: { d: Illustration; alt: string; style?: CSSProperties; fill?: boolean }) {
  const { turn, w, h } = shapeOf(d);
  // eslint-disable-next-line @next/next/no-img-element
  if (!turn) return <img src={d.src} alt={alt} style={style} width={fill ? undefined : d.width} height={fill ? undefined : d.height} />;
  return (
    <svg
      className="layout-svg"
      viewBox={`${-w / 2} ${-h / 2} ${w} ${h}`}
      preserveAspectRatio={fill ? "xMidYMid slice" : "xMidYMid meet"}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      style={style}
    >
      <image href={d.src} x={-d.width / 2} y={-d.height / 2} width={d.width} height={d.height} transform={`rotate(${turn})`} />
    </svg>
  );
}

/** The temple's layouts in the header of its page: each turned so north is at
    the top (above), at one height, as wide as its own shape makes it, in the
    site's striped frame; as a stack of cards, the top one hanging over the line below the header (every
    temple's layout is shown this way; see site.css). The cards under it (two at
    most) show at its edges, each a step up and to the right, fainter the
    deeper it is. Clicking opens the layouts large over the page, but for a
    cover (shown only on the page); with more than one, the arrows (or the
    arrow keys, or a swipe) go through them. */
export function TempleLayout({ layouts }: { layouts: Illustration[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const touch = useRef<number | null>(null);
  const [at, setAt] = useState(0);
  const d = layouts[0];
  const under = layouts.slice(1, 1 + LAYOUT_UNDER);
  // in the pop-up: all but a cover (Drawings: "Cover only"), so a stack whose
  // top is one opens onto the layout after it
  const inPopUp = layouts.filter((l) => !l.coverOnly);
  const opened = inPopUp.length ? inPopUp : layouts;
  const n = opened.length;
  const shown = opened[at] ?? opened[0];

  const step = useCallback((by: number) => setAt((i) => (i + by + n) % n), [n]);
  const open = () => {
    setAt(0);
    dialog.current?.showModal();
  };

  // the arrow keys, while it is open
  useEffect(() => {
    const el = dialog.current;
    if (!el || n < 2) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    el.addEventListener("keydown", key);
    return () => el.removeEventListener("keydown", key);
  }, [n, step]);

  // the next and previous layouts fetched ahead, so stepping is instant
  useEffect(() => {
    if (n < 2) return;
    for (const by of [1, -1]) new Image().src = opened[(at + by + n) % n].src;
  }, [at, n, opened]);

  return (
    <figure className="layout-card" style={{ "--stack-drop": `${under.length * LAYOUT_STEP}px` } as CSSProperties}>
      <span className="layout-stack">
        {/* the layouts under the top one, the deepest first */}
        {under
          .map((u, k) => (
            <span key={u.id} className="layout-under" aria-hidden="true" style={{ "--depth": k + 1 } as CSSProperties}>
              <span className="layout-mount">
                <LayoutImage d={u} alt="" fill />
              </span>
            </span>
          ))
          .reverse()}
        <button
          type="button"
          className="layout-frame"
          onClick={open}
          title={n > 1 ? `See the ${n} layouts` : "See the full drawing"}
        >
          <span className="layout-mount">
            <span
              className="layout-turned upright"
              style={{ aspectRatio: `${shapeOf(d).ratio}`, "--ratio": shapeOf(d).ratio } as CSSProperties}
            >
              <LayoutImage d={d} alt={d.alt} />
            </span>
          </span>
        </button>
      </span>
      <dialog
        ref={dialog}
        className={n > 1 ? "layout-dialog stepped" : "layout-dialog"}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current === null || n < 2) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          touch.current = null;
          if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
        }}
      >
        <button type="button" className="layout-close" onClick={() => dialog.current?.close()} aria-label="Close">
          ×
        </button>
        {n > 1 && (
          <button type="button" className="day-step prev" onClick={() => step(-1)} aria-label="The layout before">
            ‹
          </button>
        )}
        <LayoutImage key={shown.id} d={shown} alt={shown.alt} style={{ "--ratio": shapeOf(shown).ratio } as CSSProperties} />
        <p className="layout-dialog-caption">
          {shown.title}
          {n > 1 && (
            <span className="layout-count">
              {at + 1} of {n}
            </span>
          )}
        </p>
        {n > 1 && (
          <button type="button" className="day-step next" onClick={() => step(1)} aria-label="The next layout">
            ›
          </button>
        )}
      </dialog>
    </figure>
  );
}
