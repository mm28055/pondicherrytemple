"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FilmTile } from "@/lib/view";
import { Html } from "./Prose";
import { FilterBar } from "./FilterBar";

type Filter = {
  key: "temples" | "observances";
  id: string;
  label: string;
  count: number;
};

const PAGE = 24;

/** A wall of films: still frames in a grid. Press one and it opens over the
    page, sized to the screen, with its words beside it; the arrows go to
    the next and previous film, and closing it leaves you where you were.
    More stills appear as you scroll, and only the stills load until a film
    is played, so hundreds of films stay quick. Used on the Films tab (with
    filters) and on temple and festival pages (without). */
export function FilmWall({
  tiles,
  filters = [],
}: {
  tiles: FilmTile[];
  filters?: Filter[];
}) {
  // a temple, a festival or ritual, or both; and the order
  const [chosen, setChosen] = useState<Partial<Record<Filter["key"], string>>>({});
  const [oldestFirst, setOldestFirst] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const more = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const shown = useMemo(() => {
    const list = tiles.filter((t) =>
      (["temples", "observances"] as const).every((key) => !chosen[key] || t[key].includes(chosen[key]!)),
    );
    return oldestFirst ? [...list].reverse() : list;
  }, [tiles, chosen, oldestFirst]);

  // load the next batch as the end of the grid comes into view
  useEffect(() => {
    const el = more.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && setLimit((n) => n + PAGE),
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown.length, limit]);

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
    (by: number) =>
      setOpen((i) => (i === null ? i : (i + by + shown.length) % shown.length)),
    [shown.length],
  );

  const choose = (key: Filter["key"], id: string | null) => {
    setChosen((c) => ({ ...c, [key]: id ?? undefined }));
    setLimit(PAGE);
  };

  const film = open !== null ? shown[open] : null;
  const withFilters = filters.length > 1;
  // a dropdown for temples, one for festivals and rituals (if there are any)
  const bar = [
    { key: "temples", label: "Temple" },
    { key: "observances", label: "Festival/Ritual" },
  ]
    .map((b) => ({ ...b, options: filters.filter((f) => f.key === b.key).map(({ id, label }) => ({ id, label })) }))
    .filter((b) => b.options.length > 0);

  return (
    <>
      {/* With filters (the Films tab): the filter bar, as on the
          Photographs page, and the films in three columns below it */}
      {withFilters && (
        <FilterBar
          filters={bar}
          chosen={chosen}
          onPick={(key, id) => choose(key as Filter["key"], id)}
          oldestFirst={oldestFirst}
          onOrder={() => setOldestFirst(!oldestFirst)}
        />
      )}
      <div className={withFilters ? "film-browse" : undefined}>

        <div className="video-wall">
          {shown.slice(0, limit).map((t, i) => (
            <button
              key={t.key}
              className="video-tile"
              onClick={() => setOpen(i)}
            >
              <span className="still">
                {t.poster ? (
                  <img src={t.poster} alt="" loading="lazy" />
                ) : (
                  <video
                    src={`${t.src}#t=0.5`}
                    preload="metadata"
                    muted
                    playsInline
                    tabIndex={-1}
                  />
                )}
                <span className="play" aria-hidden="true" />
              </span>
              <span className="caps">{t.date}</span>
              <span className="video-title">{t.title}</span>
              {t.where && <span className="video-where">{t.where}</span>}
            </button>
          ))}
        </div>
      </div>
      {limit < shown.length && (
        <div ref={more} aria-hidden="true" style={{ height: 1 }} />
      )}

      <dialog
        ref={dialog}
        className="film-viewer"
        aria-label={film?.title ?? "Film"}
        // Esc: close it ourselves, so the page is always let go
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        // a press on the dark surround closes it
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        {film && (
          <div className="film-viewer-inner">
            <video
              key={film.key}
              controls
              autoPlay
              playsInline
              preload="auto"
              src={film.src}
              poster={film.poster}
            />
            <div className="film-viewer-text">
              <div className="caps">
                {film.date}
                {film.where && ` · ${film.where}`}
              </div>
              <h2 className="film-viewer-title">{film.title}</h2>
              {film.madeBy && (
                <p className="film-viewer-by">By {film.madeBy}</p>
              )}
              {film.html && (
                <Html className="rich film-text" html={film.html} />
              )}
              <div className="film-viewer-links">
                <Link className="arrow-link" href={film.href}>
                  Link to this film
                </Link>
                {film.instagram && (
                  <a
                    className="arrow-link"
                    href={film.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    On Instagram
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
        <button
          className="film-viewer-close"
          onClick={close}
          aria-label="Close"
        >
          ×
        </button>
        {shown.length > 1 && (
          <>
            <button
              className="film-viewer-step prev"
              onClick={() => step(-1)}
              aria-label="Previous film"
            >
              ‹
            </button>
            <button
              className="film-viewer-step next"
              onClick={() => step(1)}
              aria-label="Next film"
            >
              ›
            </button>
          </>
        )}
      </dialog>
    </>
  );
}
