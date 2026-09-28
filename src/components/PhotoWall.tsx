"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "@/content/types";
import { formatDate } from "@/lib/calendar";

const PAGE = 24;

/** The Photographs section of temple and festival pages: small square crops
    in a grid. Press one and it opens over the page, whole and as large as the
    screen allows, with its caption; the arrows go to the next and previous
    photo. More appear as you scroll. */
export function PhotoWall({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const more = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  // load the next batch as the end of the grid comes into view
  useEffect(() => {
    const el = more.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && setLimit((n) => n + PAGE),
      { rootMargin: "600px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [limit]);

  // open and close the viewer; the page behind stays still while it is open
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    else if (open === null && d.open) d.close();
    document.documentElement.style.overflow = open !== null ? "hidden" : "";
  }, [open]);

  // however it is closed (×, Esc, the browser), the page is let go again
  useEffect(() => {
    const d = dialog.current;
    const onClose = () => setOpen(null);
    d?.addEventListener("close", onClose);
    return () => {
      d?.removeEventListener("close", onClose);
      document.documentElement.style.overflow = "";
    };
  }, []);

  const close = useCallback(() => setOpen(null), []);

  const step = useCallback(
    (by: number) => setOpen((i) => (i === null ? i : (i + by + photos.length) % photos.length)),
    [photos.length]
  );

  const photo = open !== null ? photos[open] : null;

  return (
    <>
      <div className="photo-wall">
        {photos.slice(0, limit).map((p, i) => (
          <button key={p.id} className="photo-tile" onClick={() => setOpen(i)} aria-label={p.alt || p.caption || "Photograph"}>
            <img
              src={p.thumb}
              alt=""
              loading="lazy"
              style={{ objectPosition: `${p.focus[0]}% ${p.focus[1]}%` }}
            />
          </button>
        ))}
      </div>
      {limit < photos.length && <div ref={more} aria-hidden="true" style={{ height: 1 }} />}

      <dialog
        ref={dialog}
        className="film-viewer photo-viewer"
        aria-label={photo?.caption ?? "Photograph"}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        {photo && (
          <figure className="photo-viewer-inner" onClick={(e) => e.target === e.currentTarget && close()}>
            <img key={photo.id} src={photo.src} alt={photo.alt || photo.caption || ""} />
            <figcaption>
              {photo.note && <span className="caps">{formatDate(photo.date)}</span>}
              {photo.caption && <span className="photo-viewer-caption">{photo.caption}</span>}
              {photo.credit && <span className="photo-viewer-credit">{photo.credit}</span>}
              {photo.note && (
                <Link className="arrow-link" href={photo.note.href}>
                  From the field note: {photo.note.title}
                </Link>
              )}
            </figcaption>
          </figure>
        )}
        <button className="film-viewer-close" onClick={close} aria-label="Close">
          ×
        </button>
        {photos.length > 1 && (
          <>
            <button className="film-viewer-step prev" onClick={() => step(-1)} aria-label="Previous photograph">
              ‹
            </button>
            <button className="film-viewer-step next" onClick={() => step(1)} aria-label="Next photograph">
              ›
            </button>
          </>
        )}
      </dialog>
    </>
  );
}
