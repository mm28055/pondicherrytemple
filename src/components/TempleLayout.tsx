"use client";

import { useRef } from "react";
import type { Illustration } from "@/content/types";

/** The temple's plan in the header of its page: turned on its side, in the
    site's striped frame, hanging over the line below the header like a card.
    Clicking opens it upright and large over the page. */
export function TempleLayout({ d }: { d: Illustration }) {
  const dialog = useRef<HTMLDialogElement>(null);
  // Only a tall drawing (most plans) is turned; a wide one is shown as it is.
  const turn = d.height > d.width;
  return (
    <figure className="layout-card">
      <button type="button" className="layout-frame" onClick={() => dialog.current?.showModal()} title="See the full drawing">
        <span className="layout-mount">
          <span
            className={turn ? "layout-turned" : "layout-turned upright"}
            style={{ aspectRatio: turn ? `${d.height} / ${d.width}` : `${d.width} / ${d.height}` }}
          >
            {/* Before turning it is as wide as the box is tall, so once turned it fills the box. */}
            <img src={d.src} alt={d.alt} style={turn ? { width: `${(d.width / d.height) * 100}%` } : undefined} />
          </span>
        </span>
      </button>
      <figcaption className="kicker">Temple Layout</figcaption>
      <dialog
        ref={dialog}
        className="layout-dialog"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      >
        <button type="button" className="layout-close" onClick={() => dialog.current?.close()} aria-label="Close">
          ×
        </button>
        <img src={d.src} alt={d.alt} width={d.width} height={d.height} />
        <p className="layout-dialog-caption">{d.title}</p>
      </dialog>
    </figure>
  );
}
