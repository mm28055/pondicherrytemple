"use client";

import Link from "next/link";
import { FestivalLink } from "@/components/FestivalLink";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Photo, PhotoFilter } from "@/content/types";
import { formatDate } from "@/lib/calendar";
import { stripeRows, stripeWidth, useStripeFit } from "@/lib/stripes";
import { FilterBar } from "@/components/FilterBar";

const PAGE = 30;
/** How many the "lead" layout shows: one large, five small. */
const LEAD = 6;
/** How many photos a one-row strip shows before its link to the rest. */
const STRIP = 6;

type Props = {
  photos: Photo[];
  /** "lead": on a temple's or festival's page, one photo large and five
      small, with a link to see them all. "all": the page of all of them,
      which can be narrowed and sorted. "strip": a contact strip, rows of
      small photos, under the name of a rite; given seeAll, one row only, its
      last tile (the next photo, dimmed) a link to all of them. "row": one
      row of photos, each its own shape, filling the width exactly (as on
      the home page), under a temple's name on the Temples page. */
  layout: "lead" | "all" | "strip" | "row";
  seeAll?: string;
  /** Rows of buttons to narrow the photos: by temple, festival, deity, year. */
  filters?: PhotoFilter[];
  /** a line shown over every photo in the viewer ("Latest from this temple") */
  note?: string;
  /** "row": its last photo, dimmed, a link to all `total` photographs, counting
      those not shown in the row ("+46") */
  moreLink?: { href: string; total: number; title?: string };
  /** whether an open photo has its own address (?photo=…); off where many
      walls share a page, so that one address opens only one of them */
  addressable?: boolean;
};

const valuesOf = (p: Photo, key: PhotoFilter["key"]) => (key === "years" ? [p.date.slice(0, 4)] : p[key]);

/** Photographs of a temple or festival. Press one and it opens over the page,
    whole and as large as the screen allows, with its caption and where it
    belongs; the arrows (or a swipe) go through all of them. An open photo has
    its own address, so it can be sent to someone, and Back closes it. */
export function PhotoWall({ photos, layout, seeAll, filters = [], note, addressable = true, moreLink }: Props) {
  const [chosen, setChosen] = useState<Partial<Record<PhotoFilter["key"], string>>>({});
  const [oldestFirst, setOldestFirst] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [limit, setLimit] = useState(PAGE);

  const more = useRef<HTMLDivElement>(null);
  // the page of all of them: rows hung from the stripes at the top of the
  // page, each photo as wide as suits it (lib/stripes)
  const wall = useRef<HTMLDivElement>(null);
  const fit = useStripeFit(wall);
  const dialog = useRef<HTMLDialogElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  // the photos in the order they are shown, and stepped through
  const order = useMemo(() => {
    if (layout === "strip") return photos;
    if (layout === "lead") return [...photos.filter((p) => p.featured), ...photos.filter((p) => !p.featured)];
    const shown = photos.filter((p) =>
      Object.entries(chosen).every(([key, id]) => !id || valuesOf(p, key as PhotoFilter["key"]).includes(id))
    );
    return oldestFirst ? [...shown].reverse() : shown;
  }, [photos, chosen, oldestFirst, layout]);

  const choose = (key: PhotoFilter["key"], id: string | null) => {
    setChosen((c) => ({ ...c, [key]: id ?? undefined }));
    setLimit(PAGE);
  };

  /* ----- the open photo, kept in the address as ?photo=… ----- */

  const fromAddress = useCallback(() => {
    if (!addressable) return;
    const id = new URL(window.location.href).searchParams.get("photo");
    const i = id ? order.findIndex((p) => p.id === id) : -1;
    setOpen(i >= 0 ? i : null);
  }, [order, addressable]);

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
    if (!addressable) return setOpen(i);
    if (open === null) window.history.pushState({ photo: true }, "", addressFor(i));
    else window.history.replaceState(window.history.state, "", addressFor(i));
    setOpen(i);
  };

  const close = useCallback(() => {
    if (!addressable) return setOpen(null);
    if (window.history.state?.photo) {
      window.history.back(); // the popstate that follows closes it
    } else {
      window.history.replaceState(window.history.state, "", addressFor(null));
      setOpen(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, addressable]);

  const step = useCallback(
    (by: number) => {
      if (open === null) return;
      const i = (open + by + order.length) % order.length;
      if (addressable) window.history.replaceState(window.history.state, "", addressFor(i));
      setOpen(i);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, order, addressable]
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

  const tile = (p: Photo, i: number, big = false, width?: number) => (
    <button
      key={p.id}
      className={`photo-tile${big ? " big" : ""}`}
      onClick={() => show(i)}
      aria-label={p.alt || p.caption || "Photograph"}
      style={width ? { width } : undefined}
    >
      <img
        src={big || (width && width > 240) ? p.medium : p.small}
        alt=""
        loading={i < LEAD ? "eager" : "lazy"}
        style={{ objectPosition: `${p.focus[0]}% ${p.focus[1]}%` }}
      />
    </button>
  );

  const photo = open !== null ? order[open] : null;

  return (
    <>
      {layout === "all" && (
        <FilterBar
          filters={filters}
          chosen={chosen}
          onPick={(key, id) => choose(key as PhotoFilter["key"], id)}
          oldestFirst={oldestFirst}
          onOrder={() => setOldestFirst(!oldestFirst)}
          stripes
        />
      )}

      {layout === "row" ? (
        <PhotoRow photos={order} tile={tile} more={moreLink} />
      ) : layout === "strip" ? (
        seeAll ? (
          // one row: six photos (four on a phone), then the way to the rest
          <div className="photo-strip one-row">
            {order.slice(0, STRIP).map((p, i) => tile(p, i))}
            {order.length > 0 && (
              <Link className="photo-tile photo-strip-all" href={seeAll}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={order[Math.min(order.length - 1, STRIP)].small} alt="" loading="lazy" />
                <span>
                  <span>See more images</span>
                </span>
              </Link>
            )}
          </div>
        ) : (
          <div className="photo-strip">{order.map((p, i) => tile(p, i))}</div>
        )
      ) : layout === "lead" ? (
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
          <div ref={wall} className="photo-rows">
            {fit && (
              <div style={{ width: stripeWidth(fit.units), marginLeft: -fit.back }}>
                {(() => {
                  let i = 0;
                  return stripeRows(order.slice(0, limit), fit.units, fit.h).map((row) => (
                    <div key={row[0].p.id} className="photo-row">
                      {row.map(({ p, units }) => tile(p, i++, false, stripeWidth(units)))}
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
          {order.length === 0 && <p className="note-line">No photographs match.</p>}
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
              {note && <span className="photo-viewer-note">{note}</span>}
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
                      {t.href ? <FestivalLink href={t.href}>{t.label}</FestivalLink> : t.label}
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

/** A count short enough for the corner of a photo: exact to 999, then
    1.2k, 12k (the exact number is in the link's title). */
function countOf(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10000) return `${(Math.floor(n / 100) / 10).toFixed(1).replace(/.0$/, "")}k`;
  return `${Math.floor(n / 1000)}k`;
}

/** One row of photos at the row's height (set in site.css), each its own
    shape, filling the width exactly, as on the home page: as many as fit,
    the last taking what is left (or, were that only a sliver, the others
    each a little wider instead). */
function PhotoRow({
  photos,
  tile,
  more,
}: {
  photos: Photo[];
  tile: (p: Photo, i: number, big?: boolean, width?: number) => ReactNode;
  more?: Props["moreLink"];
}) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const GAP = 6; // as in site.css, .photo-line
  const placed: { i: number; w: number }[] = [];
  if (size && size.h) {
    let used = 0;
    for (let i = 0; i < photos.length; i++) {
      const gap = placed.length ? GAP : 0;
      const w = (size.h * photos[i].width) / photos[i].height;
      if (used + gap + w <= size.w) {
        placed.push({ i, w });
        used += gap + w;
        continue;
      }
      const left = size.w - used - gap;
      if (left >= size.h * 0.6) placed.push({ i, w: left });
      else if (placed.length) for (const p of placed) p.w += (size.w - used) / placed.length;
      break;
    }
  }
  // whole pixels, the last taking what rounding leaves, so the row ends flush with the page
  const widths = placed.map((p) => Math.floor(p.w));
  if (size && widths.length && placed.length > 0 && Math.ceil(placed.reduce((n, p) => n + p.w, 0) + GAP * (placed.length - 1)) >= size.w - 1)
    widths[widths.length - 1] += size.w - (widths.reduce((n, w) => n + w, 0) + GAP * (widths.length - 1));
  return (
    <div ref={box} className="photo-line">
      {placed.map(({ i }, k) =>
        more && k === placed.length - 1 ? (
          <Link key="more" className="photo-tile photo-line-more" href={more.href} title={more.title} style={{ width: widths[k] }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[i].small} alt="" style={{ objectPosition: `${photos[i].focus[0]}% ${photos[i].focus[1]}%` }} />
            {/* how many more there are than the row shows (its last tile counting as one of the rest) */}
            <span>{more.total > placed.length - 1 ? `+${countOf(more.total - (placed.length - 1))}` : "→"}</span>
          </Link>
        ) : (
          tile(photos[i], i, false, widths[k])
        )
      )}
    </div>
  );
}
