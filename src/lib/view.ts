/* Plain view-models for list rows, prepared on the server so the same row
   components render in server pages and in the client-side filter. */

import type { Article, CalendarSystem, FieldNote, Film, Observance, Temple } from "@/content/types";
import { FIELD_KIND_LABELS } from "@/content/labels";
import { dateParts, formatDate, localMonth } from "./calendar";
import { festivalPath } from "@/lib/festivals";

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
  /** `where` with each temple by its shortest name: on a phone, in place of `where` */
  whereShort?: string;
  title: string;
  excerpt: string;
  by: string;
  /** A field note's first photograph, shown at the right on the Field Notes page. */
  picture?: { src: string; alt: string };
  /** More of its words, for the Field Notes page: as many as fit beside the picture. */
  longExcerpt?: string;
}

/** "The temples of Pondicherry", but "The temples in and around Pondicherry"
    for a region named "In and around …". */
export function templesOf(regionName: string) {
  return /^(in and )?around\s/i.test(regionName)
    ? `The temples ${regionName.charAt(0).toLowerCase()}${regionName.slice(1)}`
    : `The temples of ${regionName}`;
}

/** A temple's name without "Koil", "Thirukoil" or "Devasthanam", for short
    labels such as the Films page's filters: "Vedapuriswara Koil" → "Vedapuriswara".
    A "Known as" name ("Chetty Koil") is how the town says it, so it stays whole. */
export function shortTempleName(t: Temple) {
  if (t.knownAs) return t.knownAs;
  return t.name.replace(/\s*\b(thiru)?koil\b|\s*\bdevasthanam\b/gi, "").replace(/\s+/g, " ").trim() || t.name;
}

function excerpt(text: string, max = 180) {
  return text.length > max ? text.slice(0, max).replace(/\s+\S*$/, "") + "…" : text;
}

/* A row says each thing once: on a day whose note has no title of its own
   (its title only the temple and the occasion, "Vedapuriswara Koyil
   Brahmotsavam Day 4"), the temple stays in the line above, the title is
   the occasion, and the opening words that say it again are left out. */

/** As a pattern: the words of `text`, whatever is between them. */
const wordsOf = (text: string) =>
  text
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("[^\\p{L}\\p{N}]+");
/** `text` without `lead` at its start (and what follows it, like ": "), when
    it starts with it and more is left; `sentence`: only a whole sentence
    ("Brahmotsavam Day 4. We saw…", not "Brahmotsavam Day 4 began…"). */
function withoutLead(text: string, lead: string, sentence = false) {
  const words = wordsOf(lead);
  if (!words) return text;
  const after = sentence ? "\\s*[.:!–—]+\\s*" : "(?:\\s*[:,;–—-]\\s*|\\s+)";
  const rest = text.replace(new RegExp(`^\\s*${words}${after}`, "iu"), "");
  return rest.trim() ? rest : text;
}
/** Whether `text` has the words of `part` in it, in order. */
const hasWords = (text: string, part: string) =>
  Boolean(wordsOf(part)) && new RegExp(`(^|[^\\p{L}\\p{N}])${wordsOf(part)}(?![\\p{L}\\p{N}])`, "iu").test(text);

export function noteRow(n: FieldNote, temples: Temple[], calendar: CalendarSystem): NoteRowData {
  const d = dateParts(n.date);
  const tagged = n.temples.map((id) => temples.find((t) => t.id === id)).filter((t) => t !== undefined);
  const places = tagged.map((t) => t.knownAs ?? t.name);
  const placesShort = tagged.map((t) => t.shortName ?? t.knownAs ?? t.name);
  // the title without its temple's name in front (the line above has it)
  // (the longest of its names it starts with, and only that: not "Vedapuriswara" out of "Vedapuriswara Koyil's…")
  const names = tagged.flatMap((t) => [t.knownAs, t.name, t.shortName]).filter((s): s is string => Boolean(s));
  const lead = names
    .sort((a, b) => b.length - a.length)
    .find((name) => new RegExp(`^\\s*${wordsOf(name)}(?![\\p{L}\\p{N}])`, "iu").test(n.title));
  // only from a title that is the temple and the occasion: "Vedapuriswara gets ready…" keeps its temple
  const rest = lead ? withoutLead(n.title, lead) : n.title;
  const title = rest !== n.title && hasWords(rest, n.occasion) ? rest : n.title;
  // the occasion in the line above only when the title does not say it
  const occasion = hasWords(title, n.occasion) ? "" : n.occasion;
  // the opening words, when they are the title or the occasion again ("Brahmotsavam Day 4. We saw…")
  const opening = withoutLead(withoutLead(n.excerpt, title, true), n.occasion, true);
  return {
    id: n.id,
    href: `/field-notes/${n.id}`,
    kind: n.kind,
    kindLabel: FIELD_KIND_LABELS[n.kind].one,
    date: n.date,
    day: d.day,
    shortMonth: `${d.shortMonth} ${d.year}`,
    local: localMonth(calendar, n.date),
    where: [places.join(", "), occasion].filter(Boolean).join(" · "),
    whereShort: [placesShort.join(", "), occasion].filter(Boolean).join(" · "),
    title,
    excerpt: excerpt(opening),
    by: "", // always Deepa or Arun: lists of field notes leave out who wrote each one
    picture: n.lead && { src: n.lead.src, alt: n.lead.alt },
    longExcerpt: n.summary,
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
  /** its page, once the festivals' pages are published */
  href?: string;
  tamil?: string;
  name: string;
  gloss: string;
  seenAt: number;
}

export function observanceRow(o: Observance, seenAt: number): ObservanceRowData {
  return {
    id: o.id,
    href: festivalPath(o.id),
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
