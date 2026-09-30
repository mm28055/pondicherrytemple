"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Photo } from "@/content/types";
import { formatDate } from "@/lib/calendar";

const PAGE = 30;
/** How many the "lead" layout shows: one large, five small. */
const LEAD = 6;

type Props = {
  photos: Photo[];
  /** "lead": on a temple's or festival's page, one photo large and five
      small, with a link to see them all. "years": the page of all its
      photographs, grouped by year. */
  layout: "lead" | "years";
  seeAll?: string;
  /** Buttons to narrow the photos to one festival (a temple's photographs). */
  filters?: { id: string; label: string; count: number }[];
};

/** Photographs of a temple or festival. Press one and it opens over the page,
    whole and as large as the screen allows, with its caption and where it
    belongs; the arrows (or a swipe) go through all of them. An open photo has
    its own address, so it can be sent to someone, and Back closes it. */
export function PhotoWall({ photos, layout, seeAll, filters = [] }: Props) {
  const [filter, setFilter] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const more = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  // the photos in the order they are shown, and stepped through
  const order = useMemo(() => {
    const shown = filter ? photos.filter((p) => p.observances.includes(filter)) : photos;
    return layout === "lead" ? [...shown.filter((p) => p.featured), ...shown.filter((p) => !p.featured)] : shown;
  }, [photos, filter, layout]);

  /* ----- the open photo, kept in the address as ?photo=… ----- */

  const fromAddress = useCallback(() => {
    const id = new URL(window.location.href).searchParams.get("photo");
    const i = id ? order.findIndex((p) => p.id === id) : -1;
    setOpen(i >= 0 ? i : null);
  }, [order]);

  // a link straight to a photo opens it; Back and Forward open and close it
  useEffect(() => {
    fromAddress();
    window.addEventListener("popstate", fromAddress);
    return () => window.removeEventListener("popstate", fromAddress);
  }, [fromAddress]);

  const addressFor = (i: number | null) => {
    const url = new URL(window.location.href);
    if (i === null) url.searchParams.delete("photo");
    else url.searchParams.set("photo", order[i].id);
    return url.toString();
  };

  const show = (i: number) => {
    if (open === null) window.history.pushState({ photo: true }, "", addressFor(i));
    else window.history.replaceState(window.history.state, "", addressFor(i));
    setOpen(i);
  };

  const close = useCallback(() => {
    if (window.history.state?.photo) {
      window.history.back(); // the popstate that follows closes it
    } else {
      window.history.replaceState(window.history.state, "", addressFor(null));
      setOpen(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const step = useCallback(
    (by: number) => {
      if (open === null) return;
      const i = (open + by + order.length) % order.length;
      window.history.replaceState(window.history.state, "", addressFor(i));
      setOpen(i);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, order]
  );

  /* ----- the viewer ----- */

  // open and close it; the page behind stays still while it is open
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    else if (open === null && d.open) d.close();
    document.documentElement.style.overflow = open !== null ? "hidden" : "";
  }, [open]);

  useEffect(() => () => void (document.documentElement.style.overflow = ""), []);

  // fetch the next and previous photos ahead, so stepping is instant
  useEffect(() => {
    if (open === null || order.length < 2) return;
    for (const by of [1, -1]) new Image().src = order[(open + by + order.length) % order.length].src;
  }, [open, order]);

  // on the "years" page, load more as the end of the grid comes into view
  useEffect(() => {
    const el = more.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => e[0].isIntersecting && setLimit((n) => n + PAGE), {
      rootMargin: "800px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [limit, order.length]);

  const tile = (p: Photo, i: number, big = false) => (
    <button
      key={p.id}
      className={`photo-tile${big ? " big" : ""}`}
      onClick={() => show(i)}
      aria-label={p.alt || p.caption || "Photograph"}
    >
      <img
        src={big ? p.medium : p.small}
        alt=""
        loading={i < LEAD ? "eager" : "lazy"}
        style={{ objectPosition: `${p.focus[0]}% ${p.focus[1]}%` }}
      />
    </button>
  );

  const photo = open !== null ? order[open] : null;

  return (
    <>
      {filters.length > 1 && (
        <div className="filters" role="group" aria-label="Show">
          <button aria-pressed={!filter} onClick={() => (setFilter(null), setLimit(PAGE))}>
            All<span className="count">{photos.length}</span>
          </button>
          {filters.map((f) => (
            <button key={f.id} aria-pressed={filter === f.id} onClick={() => (setFilter(f.id), setLimit(PAGE))}>
              {f.label}
              <span className="count">{f.count}</span>
            </button>
          ))}
        </div>
      )}

      {layout === "lead" ? (
        <>
          {order.length >= 4 ? (
            <div className="photo-wall lead">{order.slice(0, LEAD).map((p, i) => tile(p, i, i === 0))}</div>
          ) : (
            <div className="photo-wall">{order.map((p, i) => tile(p, i))}</div>
          )}
          {seeAll && order.length > LEAD && (
            <Link className="arrow-link photo-all" href={seeAll}>
              See all {order.length} photographs
            </Link>
          )}
        </>
      ) : (
        <>
          {groupByYear(order.slice(0, limit)).map(({ year, items }) => (
            <Fragment key={year}>
              <h2 className="photo-year">{year}</h2>
              <div className="photo-wall">{items.map(({ p, i }) => tile(p, i))}</div>
            </Fragment>
          ))}
          {limit < order.length && <div ref={more} aria-hidden="true" style={{ height: 1 }} />}
        </>
      )}

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
        // a swipe sideways goes to the next photo; a swipe down closes it
        onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={(e) => {
          const t = touch.current;
          touch.current = null;
          if (!t) return;
          const dx = e.changedTouches[0].clientX - t.x;
          const dy = e.changedTouches[0].clientY - t.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
          else if (dy > 90 && dy > Math.abs(dx)) close();
        }}
      >
        {photo && (
          <figure className="photo-viewer-inner" onClick={(e) => e.target === e.currentTarget && close()}>
            <img key={photo.id} src={photo.src} alt={photo.alt || photo.caption || ""} />
            <figcaption>
              <span className="caps">
                {open! + 1} of {order.length}
                {photo.dated && ` · ${formatDate(photo.date)}`}
              </span>
              {photo.caption && <span className="photo-viewer-caption">{photo.caption}</span>}
              {photo.credit && <span className="photo-viewer-credit">{photo.credit}</span>}
              {photo.tags.length > 0 && (
                <span className="photo-viewer-tags">
                  {photo.tags.map((t, i) => (
                    <Fragment key={t.label}>
                      {i > 0 && " · "}
                      {t.href ? <Link href={t.href}>{t.label}</Link> : t.label}
                    </Fragment>
                  ))}
                </span>
              )}
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
        {order.length > 1 && (
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

/** Newest year first, keeping each photo's place in the whole order. */
function groupByYear(photos: Photo[]) {
  const groups: { year: string; items: { p: Photo; i: number }[] }[] = [];
  photos.forEach((p, i) => {
    const year = p.date.slice(0, 4);
    const g = groups.find((x) => x.year === year);
    if (g) g.items.push({ p, i });
    else groups.push({ year, items: [{ p, i }] });
  });
  return groups;
}
