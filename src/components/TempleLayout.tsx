"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { Illustration } from "@/content/types";
import { LAYOUT_STEP, LAYOUT_UNDER } from "@/lib/layoutStack";


/** The temple's layouts in the header of its page: turned on their sides, in
    the site's striped frame, as a stack of cards, the top one hanging over
    the line below the header (every temple's layout is shown this way; see
    site.css). The cards under it (two at most) show at its edges, each a step up and to the right, fainter the deeper it is. Clicking
    opens the layouts upright and large over the page; with more than one, the
    arrows (or the arrow keys, or a swipe) go through them. */
export function TempleLayout({ layouts }: { layouts: Illustration[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const touch = useRef<number | null>(null);
  const [at, setAt] = useState(0);
  const n = layouts.length;
  const d = layouts[0];
  const shown = layouts[at] ?? d;
  // Only a tall drawing (most plans) is turned; a wide one is shown as it is.
  const turn = d.height > d.width;
  const under = layouts.slice(1, 1 + LAYOUT_UNDER);

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
    for (const by of [1, -1]) new Image().src = layouts[(at + by + n) % n].src;
  }, [at, n, layouts]);

  return (
    <figure className="layout-card" style={{ "--stack-drop": `${under.length * LAYOUT_STEP}px` } as CSSProperties}>
      <span className="layout-stack">
        {/* the layouts under the top one, the deepest first */}
        {under
          .map((u, k) => (
            <span key={u.id} className="layout-under" aria-hidden="true" style={{ "--depth": k + 1 } as CSSProperties}>
              <span className="layout-mount">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.src} alt="" />
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
              className={turn ? "layout-turned" : "layout-turned upright"}
              style={{ aspectRatio: turn ? `${d.height} / ${d.width}` : `${d.width} / ${d.height}` }}
            >
              {/* Before turning it is as wide as the box is tall, so once turned it fills the box. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.src} alt={d.alt} style={turn ? { width: `${(d.width / d.height) * 100}%` } : undefined} />
            </span>
          </span>
        </button>
      </span>
      <figcaption className="kicker">{n > 1 ? `Temple Layouts · ${n}` : "Temple Layout"}</figcaption>
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={shown.id} src={shown.src} alt={shown.alt} width={shown.width} height={shown.height} />
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
