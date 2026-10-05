"use client";

import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import type { ObservanceRowData } from "@/lib/view";

export type GalleryItem = {
  row: ObservanceRowData;
  kind: "festival" | "ritual";
  /** its photograph, if it has one yet */
  photo?: { src: string; alt: string; focus: [number, number] };
};

/** The festivals and rituals, led by their photographs. The most seen opens
    the page, its photograph the full width, its names over it; the rest
    follow together, A to Z, in a mosaic, each marked "festival" or
    "ritual" in small red letters. A search above narrows them as you type
    (by name, in English or Tamil, by what it is, or by "festival" or
    "ritual"); while searching, every match takes its place in the mosaic.
    The mosaic is two columns of photographs, each at its own shape, none
    smaller than a square. */
export function ObservanceGallery({
  lead,
  items,
  head,
}: {
  lead: GalleryItem;
  items: GalleryItem[];
  /** the page's heading and introduction: the search sits under them, on the right */
  head: ReactNode;
}) {
  const [q, setQ] = useState("");
  const words = q.trim().toLowerCase();
  const matches = (it: GalleryItem) =>
    [it.row.name, it.row.tamil ?? "", it.row.gloss, it.kind]
      .join(" ")
      .toLowerCase()
      .includes(words);
  const shown = words
    ? [lead, ...items]
        .filter(matches)
        .sort((a, b) => a.row.name.localeCompare(b.row.name))
    : items;

  return (
    <>
      <header className="page-head gallery-head">
        {head}
        <div className="gallery-search">
          {words && (
            <span className="gallery-count">
              {shown.length === 0 ? "Nothing found" : `${shown.length} found`}
            </span>
          )}
          <label className="gallery-find">
            {/* a magnifying glass */}
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
              <circle
                cx="10.5"
                cy="10.5"
                r="6.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              />
              <path
                d="M15.5 15.5 L21 21"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              aria-label="Search the festivals and rituals"
            />
          </label>
        </div>
      </header>

      <section className="section">
        {!words && <Card it={lead} lead />}
        <div className="gallery mosaic">
          {shown.map((it) => (
            <Card key={it.row.id} it={it} />
          ))}
        </div>
      </section>
    </>
  );
}

function Card({ it, lead = false }: { it: GalleryItem; lead?: boolean }) {
  const { row, photo, kind } = it;
  return (
    <Link
      href={row.href ?? `/festivals-and-rituals/${row.id}`}
      className={`gallery-card${lead ? " lead" : ""}${photo ? "" : " no-photo"}`}
    >
      <span className="gallery-pic">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.src}
            alt={photo.alt}
            loading={lead ? "eager" : "lazy"}
            style={
              {
                objectPosition: `${photo.focus[0]}% ${photo.focus[1]}%`,
              } as CSSProperties
            }
          />
        ) : (
          <>
            <span className="gallery-stand-in" lang="ta" aria-hidden="true">
              {row.tamil ?? row.name}
            </span>
            <span className="gallery-to-come">Photograph to come</span>
          </>
        )}
      </span>
      <span className="gallery-text">
        {/* festival or ritual: straight under the photograph */}
        <span className="gallery-kind">{kind}</span>
        {/* its Tamil name and its English one, side by side, a small red dot
            between (on the lead, one above the other) */}
        <span className={lead ? "gallery-names stacked" : "gallery-names"}>
          <span className="gallery-tamil" lang="ta">
            {row.tamil ?? row.name}
          </span>
          {row.tamil && (
            <>
              {!lead && <span className="gallery-dot" aria-hidden="true" />}
              <span className="gallery-name">{row.name}</span>
            </>
          )}
        </span>
        <span className="gallery-gloss">{row.gloss}</span>
        <span className="caps gallery-seen">
          {row.seenAt} temple{row.seenAt === 1 ? "" : "s"}
        </span>
      </span>
    </Link>
  );
}
