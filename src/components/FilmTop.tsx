"use client";

import { useEffect, useRef, useState } from "react";
import type { FilmTile } from "@/lib/view";
import { FilmVideo } from "./FilmVideo";
import { FilmViewerText } from "./FilmWall";

/** The film at the top of the Films page, beside its opening words (a film
    marked "At the top of the Films page"): its still frame, with the films'
    play button. Pressed, it opens over the page as the other films do, in the
    same dark viewer, but the film across the screen and its words below it,
    scrolling on their own. */
export function FilmTop({ film }: { film: FilmTile }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  // open and close the viewer; the page behind stays still while it is open
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  // however it is closed (×, Esc, Back), the page is let go again
  useEffect(() => {
    const d = dialog.current;
    const onClose = () => setOpen(false);
    d?.addEventListener("close", onClose);
    return () => {
      d?.removeEventListener("close", onClose);
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <>
      <button type="button" className="film-top video-tile" onClick={() => setOpen(true)} aria-label={`Play the film ${film.title}`}>
        <span className="still">
          {film.poster ? (
            <img src={film.poster} alt="" />
          ) : (
            <FilmVideo tile src={`${film.src}#t=0.5`} preload="metadata" muted playsInline tabIndex={-1} />
          )}
          <span className="play" aria-hidden="true" />
        </span>
      </button>

      <dialog
        ref={dialog}
        className="film-viewer film-viewer-below"
        aria-label={film.title}
        // Esc: close it ourselves, so the page is always let go
        onCancel={(e) => {
          e.preventDefault();
          setOpen(false);
        }}
        // a press on the dark surround closes it
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
      >
        {open && (
          <div className="film-viewer-inner">
            <FilmVideo controls autoPlay playsInline preload="auto" controlsList="nodownload" src={film.src} poster={film.poster} />
            {/* (no link to its own page: it is this page's own) */}
            <FilmViewerText film={film} link={false} />
          </div>
        )}
        <button className="film-viewer-close" onClick={() => setOpen(false)} aria-label="Close">
          ×
        </button>
      </dialog>
    </>
  );
}
