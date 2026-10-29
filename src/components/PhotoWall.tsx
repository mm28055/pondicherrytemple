"use client";

import Link from "next/link";
import { FestivalLink } from "@/components/FestivalLink";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Photo, PhotoFilter } from "@/content/types";
import { formatDate } from "@/lib/calendar";
import { stripeRows, stripeWidth, useStripeFit } from "@/lib/stripes";
import { FilterBar } from "@/components/FilterBar";
import { Zoomable } from "@/components/Zoomable";
import { eventOf, photoCount, unpackPhotos, type PhotoPack } from "@/lib/photoPack";

const PAGE = 30;
/** How many the "lead" layout shows: one large, five small. */
const LEAD = 6;
/** How many photos a one-row strip shows before its link to the rest. */
const STRIP = 6;
/** "all", with a line over each day or event: how many rows of its photos
    show, until its last tile ("+46") opens the rest of them in place. */
const SHOWN_ROWS = 3;

type Props = {
  photos?: Photo[];
  /** in place of `photos`, a long list packed small (lib/photoPack) */
  pack?: PhotoPack;
  /** "lead": how many there are in all, when only the first few are given */
  total?: number;
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
      those not shown in the row ("+46"); with no `href`, it opens the viewer
      there instead, to go on through the rest of those given */
  moreLink?: { href?: string; total: number; title?: string };
  /** whether an open photo has its own address (?photo=…); off where many
      walls share a page, so that one address opens only one of them */
  addressable?: boolean;
  /** "all": a line over each day's or event's photographs: its day and what
      it was, and, as asked, its temple and its field note's title */
  /** `here`: the temple whose page it is (its shortest name), named only on
      a heading of another temple's photographs shown there too */
  heads?: { temple?: boolean; note?: boolean; here?: string };
  /** "row": shown as it scrolls into view, as the temple's name beside it is */
  reveal?: boolean;
};

/** "2026-10" → "October 2026" */
const monthLabel = (ym: string) =>
  new Date(`${ym}-15T12:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

/** The photos of one day or event, together (a photo set's, or a day's). */
const groupOf = eventOf;
/** The photos in runs of one day or event each, in order. */
function runs(list: Photo[]): Photo[][] {
  const out: Photo[][] = [];
  for (const p of list) {
    const last = out[out.length - 1];
    if (last && groupOf(last[0]) === groupOf(p)) last.push(p);
    else out.push([p]);
  }
  return out;
}

const valuesOf = (p: Photo, key: PhotoFilter["key"]) => (key === "years" ? [p.date.slice(0, 4)] : p[key]);

/** Photographs of a temple or festival. Press one and it opens over the page,
    whole and as large as the screen allows, with its caption and where it
    belongs; the arrows (or a swipe) go through all of them. An open photo has
    its own address, so it can be sent to someone, and Back closes it. */
export function PhotoWall({ photos: given, pack, total, layout, seeAll, filters = [], note, addressable = true, moreLink, heads, reveal = false }: Props) {
  const photos = useMemo(() => (pack ? unpackPhotos(pack) : (given ?? [])), [pack, given]);
  const [chosen, setChosen] = useState<Partial<Record<PhotoFilter["key"], string>>>({});
  const [oldestFirst, setOldestFirst] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [limit, setLimit] = useState(PAGE);
  // the days and events opened to all their photos (see SHOWN_ROWS)
  const [opened, setOpened] = useState<Set<string>>(new Set());

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
    // oldest first: the days and events turned round, each one's photos still in the order taken
    return oldestFirst ? runs(shown).reverse().flat() : shown;
  }, [photos, chosen, oldestFirst, layout]);

  // the days and events, each one's photos together
  const groups = useMemo(() => runs(order), [order]);

  // the months they are in, in the order shown, each with its first day or event: to go to
  const months = useMemo(() => {
    const out: { id: string; label: string; at: number }[] = [];
    groups.forEach((g, at) => {
      const p = g[0];
      const id = p.dated ? p.date.slice(0, 7) : "";
      if (id && !out.some((m) => m.id === id)) out.push({ id, label: monthLabel(id), at });
    });
    return out;
  }, [groups]);
  // going to one: its day loaded (and those before it), then brought up under the bar
  const [goTo, setGoTo] = useState<string | null>(null);
  const jumpTo = (id: string) => {
    const m = months.find((x) => x.id === id);
    if (!m) return;
    setLimit((l) => Math.max(l, (m.at + 2) * 3));
    setGoTo(groups[m.at][0].id);
  };
  useEffect(() => {
    if (!goTo) return;
    const el = document.getElementById(`photos-${goTo}`);
    if (!el) return;
    el.scrollIntoView();
    setGoTo(null);
  });

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
        // (a row's photos only as they come near: a page can have dozens of rows)
        loading={i < LEAD && layout !== "row" ? "eager" : "lazy"}
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
          jump={heads ? { label: "Month", options: months, onJump: jumpTo } : undefined}
        />
      )}

      {layout === "row" ? (
        <PhotoRow photos={order} tile={tile} more={moreLink} open={show} reveal={reveal} />
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
          {seeAll && (total ?? order.length) > LEAD && (
            <Link className="arrow-link photo-all" href={seeAll}>
              See all {photoCount(total ?? order.length)} photographs
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
                  const rowsOf = (list: Photo[]) =>
                    stripeRows(list, fit.units, fit.h).map((row) => (
                      <div key={row[0].p.id} className="photo-row">
                        {row.map(({ p, units }) => tile(p, i++, false, stripeWidth(units)))}
                      </div>
                    ));
                  if (!heads) return rowsOf(order.slice(0, limit));
                  // each day or event under a line of its own: its day, what it was, its
                  // note; SHOWN_ROWS of its photos, the last a way to the rest, shown in
                  // place, at whose end a way back to fewer. (Loaded a few at a time.)
                  const at = new Map(order.map((x, k) => [x.id, k]));
                  return groups.slice(0, Math.round(limit / 3)).map((run) => {
                    const p = run[0];
                    const key = groupOf(p);
                    const isOpen = opened.has(key);
                    // the way back to fewer: the day's first photo again, dimmed, its shape
                    const fewer = { id: `fewer-${key}`, width: p.width, height: p.height, fewer: true as const };
                    let rows = stripeRows<Photo | typeof fewer>(isOpen ? [...run, fewer] : run, fit.units, fit.h);
                    const cut = !isOpen && rows.length > SHOWN_ROWS;
                    if (cut) rows = rows.slice(0, SHOWN_ROWS);
                    const before = rows.flat().length - 1; // the photos shown before the last tile
                    const toggle = (open: boolean) =>
                      setOpened((o) => {
                        const n = new Set(o);
                        if (open) n.add(key);
                        else n.delete(key);
                        return n;
                      });
                    return (
                      <Fragment key={`head-${p.id}`}>
                        <div id={`photos-${p.id}`} className="photo-group-head" style={{ paddingLeft: fit.back }}>
                          <span className="date">{p.dated ? formatDate(p.date) : "Day not known"}</span>
                          {p.place && (heads.temple || (heads.here && p.place !== heads.here)) && <span>{p.place}</span>}
                          {p.occasion && <span>{p.occasion}</span>}
                          {heads.note && p.note && (
                            <Link className="note" href={p.note.href}>
                              {p.note.title}
                            </Link>
                          )}
                        </div>
                        {rows.map((row, r) => (
                          <div key={row[0].p.id} className="photo-row">
                            {row.map(({ p: c, units }, k) => {
                              const width = stripeWidth(units);
                              if ("fewer" in c)
                                return (
                                  <button
                                    key={c.id}
                                    className="photo-tile photo-line-more photo-fewer"
                                    style={{ width }}
                                    onClick={() => {
                                      toggle(false);
                                      // back to the line over them, were it scrolled away
                                      const head = document.getElementById(`photos-${p.id}`);
                                      if (head && head.getBoundingClientRect().top < 0) head.scrollIntoView();
                                    }}
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={width > 240 ? p.medium : p.small} alt="" loading="lazy" style={{ objectPosition: `${p.focus[0]}% ${p.focus[1]}%` }} />
                                    <span>See fewer</span>
                                  </button>
                                );
                              if (cut && r === rows.length - 1 && k === row.length - 1)
                                return (
                                  <button
                                    key={c.id}
                                    className="photo-tile photo-line-more"
                                    style={{ width }}
                                    onClick={() => toggle(true)}
                                    aria-label={`All ${photoCount(run.length)} photographs of this day`}
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={width > 240 ? c.medium : c.small} alt="" loading="lazy" style={{ objectPosition: `${c.focus[0]}% ${c.focus[1]}%` }} />
                                    <span>+{photoCount(run.length - before)}</span>
                                  </button>
                                );
                              return tile(c, at.get(c.id) ?? 0, false, width);
                            })}
                          </div>
                        ))}
                      </Fragment>
                    );
                  });
                })()}
              </div>
            )}
          </div>
          {order.length === 0 && <p className="note-line">No photographs match.</p>}
          {(heads ? Math.round(limit / 3) < groups.length : limit < order.length) && (
            <div ref={more} aria-hidden="true" style={{ height: 1 }} />
          )}
        </>
      )}

      <dialog
        ref={dialog}
        className="film-viewer photo-viewer"
        data-own-history={addressable ? "" : undefined}
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
            <Zoomable key={photo.id}>
              <img src={photo.src} alt={photo.alt || photo.caption || ""} />
            </Zoomable>
            <figcaption>
              {note && <span className="photo-viewer-note">{note}</span>}
              {/* its date, where it was, what for, then who took it (not "12 of 2,600": no help in so many) */}
              {photo.dated && <span className="caps">{formatDate(photo.date)}</span>}
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
              {/* the occasion, in its shortest form (unless a festival named the same is linked already) */}
              {photo.short && !photo.tags.some((t) => t.label.toLowerCase() === photo.short!.toLowerCase()) && (
                <span className="caps">{photo.short}</span>
              )}
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

/** One row of photos at the row's height (set in site.css), each its own
    shape, filling the width exactly, as on the home page: as many as fit,
    the last taking what is left (or, were that only a sliver, the others
    each a little wider instead). */
function PhotoRow({
  photos,
  tile,
  more,
  open,
  reveal,
}: {
  photos: Photo[];
  tile: (p: Photo, i: number, big?: boolean, width?: number) => ReactNode;
  more?: Props["moreLink"];
  open: (i: number) => void;
  reveal: boolean;
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
    <div ref={box} className={`photo-line${reveal ? " reveal" : ""}`}>
      {placed.map(({ i }, k) =>
        more && k === placed.length - 1 && (more.href || more.total > placed.length) ? (
          (() => {
            const inner = (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photos[i].small} alt="" loading="lazy" style={{ objectPosition: `${photos[i].focus[0]}% ${photos[i].focus[1]}%` }} />
                {/* how many more there are than the row shows (its last tile counting as one of the rest) */}
                <span>{more.total > placed.length - 1 ? `+${photoCount(more.total - (placed.length - 1))}` : "→"}</span>
              </>
            );
            return more.href ? (
              <Link key="more" className="photo-tile photo-line-more" href={more.href} title={more.title} style={{ width: widths[k] }}>
                {inner}
              </Link>
            ) : (
              <button key="more" className="photo-tile photo-line-more" onClick={() => open(i)} title={more.title} style={{ width: widths[k] }}>
                {inner}
              </button>
            );
          })()
        ) : (
          tile(photos[i], i, false, widths[k])
        )
      )}
    </div>
  );
}
