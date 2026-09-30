/* Plain view-models for list rows, prepared on the server so the same row
   components render in server pages and in the client-side filter. */

import type { Article, CalendarSystem, FieldNote, Film, Observance, Temple } from "@/content/types";
import { FIELD_KIND_LABELS } from "@/content/labels";
import { dateParts, formatDate, localMonth } from "./calendar";

export interface NoteRowData {
  id: string;
  href: string;
  kind: string;
  kindLabel: string;
  date: string;
  day: number;
  shortMonth: string;
  local: string | null;
  where: string;
  title: string;
  excerpt: string;
  by: string;
}

/** "The temples of Pondicherry", but "The temples in and around Pondicherry"
    for a region named "In and around …". */
export function templesOf(regionName: string) {
  return /^(in and )?around\s/i.test(regionName)
    ? `The temples ${regionName.charAt(0).toLowerCase()}${regionName.slice(1)}`
    : `The temples of ${regionName}`;
}

function excerpt(text: string, max = 180) {
  return text.length > max ? text.slice(0, max).replace(/\s+\S*$/, "") + "…" : text;
}

export function noteRow(n: FieldNote, temples: Temple[], calendar: CalendarSystem): NoteRowData {
  const d = dateParts(n.date);
  const places = n.temples
    .map((id) => temples.find((t) => t.id === id))
    .filter((t) => t !== undefined)
    .map((t) => t.knownAs ?? t.name);
  return {
    id: n.id,
    href: `/field-notes/${n.id}`,
    kind: n.kind,
    kindLabel: FIELD_KIND_LABELS[n.kind].one,
    date: n.date,
    day: d.day,
    shortMonth: `${d.shortMonth} ${d.year}`,
    local: localMonth(calendar, n.date),
    where: [places.join(", "), n.occasion].filter(Boolean).join(" · "),
    title: n.title,
    excerpt: excerpt(n.excerpt),
    by: n.authors.join(" and "),
  };
}

export function articleRow(a: Article, calendar: CalendarSystem): NoteRowData {
  const d = dateParts(a.date);
  return {
    id: a.id,
    href: `/articles/${a.id}`,
    kind: "article",
    kindLabel: "Article",
    date: a.date,
    day: d.day,
    shortMonth: `${d.shortMonth} ${d.year}`,
    local: localMonth(calendar, a.date),
    where: "",
    title: a.title,
    excerpt: a.teaser,
    by: a.author,
  };
}

export interface ObservanceRowData {
  id: string;
  href: string;
  tamil?: string;
  name: string;
  gloss: string;
  seenAt: number;
}

export function observanceRow(o: Observance, seenAt: number): ObservanceRowData {
  return {
    id: o.id,
    href: `/festivals-and-rituals/${o.id}`,
    tamil: o.tamil,
    name: o.name,
    gloss: o.gloss,
    seenAt,
  };
}

/** Where a film was made, by temple name: "Vedapuriswara Koil, Chetty Koil". */
function placesOf(ids: string[], temples: Temple[]) {
  return ids
    .map((id) => temples.find((t) => t.id === id))
    .filter((t) => t !== undefined)
    .map((t) => t.knownAs ?? t.name)
    .join(", ");
}

/** A film in a list (the home page's "Just added"). */
export function filmRow(f: Film, temples: Temple[], calendar: CalendarSystem): NoteRowData {
  const d = dateParts(f.date);
  return {
    id: f.id,
    href: `/films/${f.id}`,
    kind: "film",
    kindLabel: "Film",
    date: f.date,
    day: d.day,
    shortMonth: `${d.shortMonth} ${d.year}`,
    local: localMonth(calendar, f.date),
    where: placesOf(f.temples, temples),
    title: f.title,
    excerpt: excerpt(f.excerpt),
    by: f.madeBy ?? "",
  };
}

/** A film on a wall of films (the Films tab, and temple and festival pages). */
export interface FilmTile {
  key: string;
  src: string;
  poster?: string;
  title: string;
  date: string;
  where: string;
  href: string;
  temples: string[];
  observances: string[];
  /** The film's words (HTML), shown beside it when it opens. */
  html?: string;
  madeBy?: string;
  instagram?: string;
}

export function filmTile(f: Film, temples: Temple[]): FilmTile {
  return {
    key: f.id,
    src: f.video.src,
    poster: f.video.poster,
    title: f.title,
    date: formatDate(f.date),
    where: placesOf(f.temples, temples),
    href: `/films/${f.id}`,
    temples: f.temples,
    observances: f.observances,
    html: f.body || undefined,
    madeBy: f.madeBy,
    instagram: f.instagram,
  };
}
