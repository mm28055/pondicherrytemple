/* ============================================================
   Data access layer — THE seam between pages and storage.

   Every page reads content through these functions and nothing else. They
   read the database the admin writes to (Payload, on Postgres) and hand the
   pages the plain shapes in src/content/types.ts, so no page knows where
   content is stored.

   The whole site rests on one idea: content is stored once and tagged
   with the temples and festivals/rituals it is about. Temple pages and
   festival pages are simply queries over those tags.

   Only published content is shown — except while an editor previews from
   the admin, when drafts are shown too.
   ============================================================ */

import config from "@payload-config";
import { draftMode } from "next/headers";
import { getPayload, type Where } from "payload";
import { cache } from "react";
import type * as P from "@/payload-types";
import type {
  Article,
  Book,
  EntryTopic,
  FieldNote,
  Film,
  Illustration,
  Observance,
  Occasion,
  Photo,
  Picture,
  Region,
  Temple,
  TempleEntry,
  HomePageText,
  AboutPageText,
} from "@/content/types";
import { openingText, plainText, toHTML, type LinkPaths } from "./richtext";
import { SECTION_INTROS, type SectionName } from "@/payload/sectionIntros";
import { TAMIL_MONTHS, tamilMonthOf, type TamilMonth } from "./calendar";

const byDateDesc = <T extends { date: string }>(a: T, b: T) => b.date.localeCompare(a.date);
const byDateAsc = <T extends { date: string }>(a: T, b: T) => a.date.localeCompare(b.date);

/* ---------- Reading the database ---------- */

const db = () => getPayload({ config });

/** True while an editor previews drafts (the admin's Preview button). */
async function previewing(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false; // outside a request, e.g. while listing pages to build
  }
}

/** For collections with drafts: published only, unless previewing. */
async function visible(): Promise<{ draft: boolean; where?: Where }> {
  const draft = await previewing();
  return draft ? { draft } : { draft, where: { _status: { equals: "published" } } };
}

// Linked documents: only what's needed to find their pages.
const populate = {
  temples: { slug: true, region: true },
  observances: { slug: true },
  "field-notes": { slug: true },
  articles: { slug: true },
  films: { slug: true },
  regions: { slug: true },
  users: { name: true },
} as const;

const base = { overrideAccess: true, pagination: false, populate } as const;

const rawRegions = cache(async () =>
  (await (await db()).find({ ...base, collection: "regions", depth: 0, sort: "createdAt" })).docs
);

// (joins: false — the admin's lists of each temple's pieces aren't needed here)
const rawTemples = cache(async () =>
  (
    await (await db()).find({
      ...base,
      ...(await visible()),
      collection: "temples",
      depth: 1,
      sort: "_order",
      joins: false,
    })
  ).docs
);

// (joins: false — the admin's lists of each festival's photographs aren't needed here)
const rawObservances = cache(async () =>
  (
    await (await db()).find({
      ...base,
      ...(await visible()),
      collection: "observances",
      depth: 1,
      sort: "createdAt",
      joins: false,
    })
  ).docs
);

const rawOccasions = cache(async () =>
  (await (await db()).find({ ...base, collection: "occasions", depth: 0, sort: "date" })).docs
);

// Lists of notes and articles skip their pictures and links; each one's own page loads those.
const rawNotes = cache(async () =>
  (await (await db()).find({ ...base, ...(await visible()), collection: "field-notes", depth: 0, sort: "-date" }))
    .docs
);

const rawArticles = cache(async () =>
  (await (await db()).find({ ...base, ...(await visible()), collection: "articles", depth: 0, sort: "-date" })).docs
);

const rawDrawings = cache(async () =>
  (await (await db()).find({ ...base, ...(await visible()), collection: "drawings", depth: 1, sort: "createdAt" }))
    .docs
);

const rawPieces = cache(async () =>
  (await (await db()).find({ ...base, ...(await visible()), collection: "temple-pieces", depth: 1, sort: "createdAt" }))
    .docs
);

const rawBooks = cache(async () =>
  (await (await db()).find({ ...base, ...(await visible()), collection: "books", depth: 0 })).docs
);

/** One document by its web address, with its pictures and links. */
async function rawOne<C extends "field-notes" | "articles" | "films">(collection: C, slug: string) {
  const { draft, where } = await visible();
  const bySlug: Where = { slug: { equals: slug } };
  const { docs } = await (await db()).find({
    collection,
    draft,
    where: where ? { and: [bySlug, where] } : bySlug,
    depth: 2, // (2 reaches each video's still frame)
    limit: 1,
    overrideAccess: true,
    populate,
  });
  return docs[0] ?? null;
}

/** Every photograph (not videos or files): the ones tagged with a temple or
    festival, and the ones in field notes, are picked out below. */
const rawPhotos = cache(async () =>
  (
    await (await db()).find({
      ...base,
      collection: "media",
      depth: 0,
      where: { mimeType: { contains: "image" } },
      sort: "-createdAt",
    })
  ).docs
);

/** Films, with their video files and still frames (so depth 2). */
const rawFilms = cache(async () =>
  (await (await db()).find({ ...base, ...(await visible()), collection: "films", depth: 2, sort: "-date" })).docs
);

/* ---------- From stored documents to the site's shapes ---------- */

type Ref = number | { id: number } | null | undefined;
const idOf = (ref: Ref) => (ref && typeof ref === "object" ? ref.id : (ref ?? undefined));

/** Web addresses of everything visible, by database id. Anything not visible
    (unpublished, or deleted) is missing here, so tags pointing at it drop out. */
const lookups = cache(async () => {
  const [regions, temples, observances, notes] = await Promise.all([
    rawRegions(),
    rawTemples(),
    rawObservances(),
    rawNotes(),
  ]);
  const regionSlug = new Map(regions.map((r) => [r.id, r.slug ?? ""]));
  const regionOf = (ref: Ref) => regionSlug.get(idOf(ref) ?? -1) ?? "";
  const templeSlug = new Map(temples.filter((t) => t.slug).map((t) => [t.id, t.slug!]));
  const templeRegion = new Map(temples.map((t) => [t.id, regionOf(t.region)]));
  const paths: LinkPaths = {
    temple: (id) => (templeSlug.has(id) ? `/${templeRegion.get(id)}/${templeSlug.get(id)}` : null),
  };
  return {
    regionOf,
    templeSlug,
    templeKey: new Map(temples.filter((t) => t.slug).map((t) => [t.id, `${regionOf(t.region)}/${t.slug}`])),
    observanceSlug: new Map(observances.filter((o) => o.slug).map((o) => [o.id, o.slug!])),
    noteSlug: new Map(notes.filter((n) => n.slug).map((n) => [n.id, n.slug!])),
    paths,
  };
});

type Lookups = Awaited<ReturnType<typeof lookups>>;

function slugs(refs: Ref[] | null | undefined, map: Map<number, string>): string[] {
  return (refs ?? []).map((ref) => map.get(idOf(ref) ?? -1)).filter((s): s is string => Boolean(s));
}

/** Dates are stored as moments; the site shows the day it was in Pondicherry. */
const dayOf = (moment: string) => new Date(moment).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

function toPicture(ref: number | P.Media | null | undefined): Picture | undefined {
  if (!ref || typeof ref !== "object" || !ref.url || ref.consent === "withhold") return undefined;
  const large = ref.sizes?.large;
  return {
    src: large?.url ?? ref.url,
    width: large?.width ?? ref.width ?? 0,
    height: large?.height ?? ref.height ?? 0,
    alt: ref.alt ?? "",
    caption: ref.caption ?? undefined,
    credit: ref.credit ?? undefined,
  };
}

const toRegion = (r: P.Region, L: Lookups): Region => ({
  id: r.slug ?? "",
  name: r.name,
  calendar: r.calendar,
  totalTemples: r.totalTemples ?? 0,
  intro: toHTML(r.intro, L.paths),
  introText: plainText(r.intro),
});

const toTemple = (t: P.Temple, L: Lookups): Temple => ({
  id: t.slug ?? "",
  region: L.regionOf(t.region),
  name: t.name,
  knownAs: t.knownAs ?? undefined,
  deity: t.deity,
  group: t.deityGroup,
  street: t.street ?? undefined,
  intro: toHTML(t.intro, L.paths) || undefined,
  introText: plainText(t.intro) || undefined,
  coordinates:
    t.coordinates?.lat != null && t.coordinates?.lng != null
      ? [t.coordinates.lat, t.coordinates.lng]
      : undefined,
});

const toObservance = (o: P.Observance, L: Lookups): Observance => ({
  id: o.slug ?? "",
  kind: o.kind,
  name: o.name,
  tamil: o.tamil ?? undefined,
  alsoKnownAs: o.alsoKnownAs ?? undefined,
  gloss: o.gloss,
  about: o.about?.map((x) => ({ q: x.question, a: toHTML(x.answer, L.paths) })),
  months: (o.months ?? []).filter((m) => m !== "year"),
  throughYear: (o.months ?? []).includes("year"),
});

const toOccasion = (o: P.Occasion, L: Lookups): Occasion => ({
  date: dayOf(o.date),
  region: L.regionOf(o.region),
  temple: L.templeSlug.get(idOf(o.temple) ?? -1) ?? "",
  label: o.label,
  observances: slugs(o.observances, L.observanceSlug),
  note: L.noteSlug.get(idOf(o.fieldNote) ?? -1),
});

function toFieldNote(n: P.FieldNote, L: Lookups, full: boolean): FieldNote {
  const note: FieldNote = {
    id: n.slug ?? "",
    kind: n.kind ?? "note",
    region: L.regionOf(n.region),
    date: dayOf(n.date),
    temples: slugs(n.temples, L.templeSlug),
    observances: slugs(n.observances, L.observanceSlug),
    occasion: n.occasion,
    title: n.title,
    authors: n.authors ?? [],
    excerpt: openingText(n.body),
  };
  if (!full) return note;
  // An older single recording, if any, comes first.
  const files = [n.recording, ...(n.videos ?? [])].filter(
    (m): m is P.Media => typeof m === "object" && m !== null && Boolean(m.url) && m.consent !== "withhold"
  );
  return {
    ...note,
    body: toHTML(n.body, L.paths),
    videos: files.map((m) => ({
      type: m.mimeType?.startsWith("audio/") ? ("audio" as const) : ("video" as const),
      src: m.url!,
      poster: toPicture(m === n.recording ? n.poster : m.poster)?.src,
      caption: (m === n.recording ? n.recordingCaption : null) ?? m.caption ?? undefined,
    })),
    photos: (n.photos ?? []).map(toPicture).filter((p): p is Picture => Boolean(p)),
  };
}

const toArticle = (a: P.Article, L: Lookups, full: boolean): Article => ({
  id: a.slug ?? "",
  title: a.title,
  author: a.author,
  date: dayOf(a.date),
  teaser: a.teaser,
  temples: slugs(a.temples, L.templeSlug),
  observances: slugs(a.observances, L.observanceSlug),
  body: full ? toHTML(a.body, L.paths) : undefined,
});

function toFilm(f: P.Film, L: Lookups, full: boolean): Film | null {
  const m = f.video;
  if (!m || typeof m !== "object" || !m.url || m.consent === "withhold") return null;
  return {
    id: f.slug ?? "",
    region: L.regionOf(f.region),
    date: dayOf(f.date),
    temples: slugs(f.temples, L.templeSlug),
    observances: slugs(f.observances, L.observanceSlug),
    title: f.title,
    madeBy: f.madeBy ?? undefined,
    excerpt: openingText(f.body),
    body: full ? toHTML(f.body, L.paths) : undefined,
    video: { type: "video", src: m.url, poster: toPicture(m.poster)?.src, caption: m.caption ?? undefined },
    instagram: f.instagram?.link ?? undefined,
  };
}

function toIllustration(d: P.Drawing, L: Lookups): Illustration | null {
  const picture = toPicture(d.image);
  if (!picture) return null;
  return {
    ...picture,
    id: String(d.id),
    region: L.regionOf(d.region),
    kind: d.kind,
    title: d.title,
    caption: d.caption ?? undefined,
    credit: d.credit ?? undefined,
    temples: slugs(d.temples, L.templeSlug),
    observances: slugs(d.observances, L.observanceSlug),
  };
}

const toTempleEntry = (e: P.TemplePiece, L: Lookups): TempleEntry => ({
  id: String(e.id),
  region: L.regionOf(e.region),
  topic: e.topic,
  temples: slugs(e.temples, L.templeSlug),
  title: e.title,
  // A name is shown only when consent has been recorded with it.
  named: e.named?.name && e.named.consent ? { name: e.named.name } : undefined,
  body: toHTML(e.body, L.paths),
  picture: toPicture(e.picture),
});

const toBook = (b: P.Book, L: Lookups): Book => ({
  region: L.regionOf(b.region),
  status: b.status,
  byline: b.byline,
  illustrations: b.illustrations ?? "",
  parts: (b.parts ?? []).map((p) => ({
    title: p.title,
    summary: p.summary,
    link: p.link?.href ? { href: p.link.href, label: p.link.label || p.link.href } : undefined,
  })),
});

/* ---------- The site's shapes, ready for the pages ---------- */

const regions = cache(async () => {
  const L = await lookups();
  return (await rawRegions()).filter((r) => r.slug).map((r) => toRegion(r, L));
});

const temples = cache(async () => {
  const L = await lookups();
  return (await rawTemples()).filter((t) => t.slug).map((t) => toTemple(t, L));
});

const observances = cache(async () => {
  const L = await lookups();
  return (await rawObservances()).filter((o) => o.slug).map((o) => toObservance(o, L));
});

// Only occasions at a visible temple.
const occasions = cache(async () => {
  const L = await lookups();
  return (await rawOccasions()).map((o) => toOccasion(o, L)).filter((o) => o.temple);
});

const fieldNotes = cache(async () => {
  const L = await lookups();
  return (await rawNotes()).filter((n) => n.slug).map((n) => toFieldNote(n, L, false));
});

const articles = cache(async () => {
  const L = await lookups();
  return (await rawArticles()).filter((a) => a.slug).map((a) => toArticle(a, L, false));
});

const films = cache(async () => {
  const L = await lookups();
  // with their full text: a film opens over the page with its words beside it
  return (await rawFilms()).filter((f) => f.slug).map((f) => toFilm(f, L, true)).filter((f): f is Film => f !== null);
});

const illustrations = cache(async () => {
  const L = await lookups();
  return (await rawDrawings()).map((d) => toIllustration(d, L)).filter((d): d is Illustration => d !== null);
});

/* A photo shows wherever it is tagged itself, and wherever each visible
   field note it is in is tagged. */
const photos = cache(async () => {
  const L = await lookups();
  const notesWith = new Map<number, P.FieldNote[]>(); // newest note first
  for (const n of await rawNotes()) {
    if (!n.slug) continue;
    for (const ref of n.photos ?? []) {
      const id = idOf(ref);
      if (id !== undefined) notesWith.set(id, [...(notesWith.get(id) ?? []), n]);
    }
  }
  const out: Photo[] = [];
  for (const m of await rawPhotos()) {
    const picture = toPicture(m);
    if (!picture) continue;
    const notes = notesWith.get(m.id) ?? [];
    const temples = new Set(slugs(m.temples, L.templeKey));
    const observances = new Set(slugs(m.observances, L.observanceSlug));
    for (const n of notes) {
      slugs(n.temples, L.templeKey).forEach((t) => temples.add(t));
      slugs(n.observances, L.observanceSlug).forEach((o) => observances.add(o));
    }
    if (!temples.size && !observances.size) continue;
    const note = notes[0];
    out.push({
      ...picture,
      id: String(m.id),
      thumb: m.sizes?.card?.url ?? picture.src,
      focus: [m.focalX ?? 50, m.focalY ?? 50],
      temples: [...temples],
      observances: [...observances],
      date: dayOf(note?.date ?? m.createdAt),
      note: note ? { href: `/field-notes/${note.slug}`, title: note.title } : undefined,
    });
  }
  return out.sort(byDateDesc);
});

const templeEntries = cache(async () => {
  const L = await lookups();
  return (await rawPieces()).map((e) => toTempleEntry(e, L));
});

/* ---------- Regions ---------- */

export async function getRegions(): Promise<Region[]> {
  return regions();
}

export async function getRegion(id: string): Promise<Region | null> {
  return (await regions()).find((r) => r.id === id) ?? null;
}

/* ---------- Temples ---------- */

/** In the order set in the admin. */
export async function getTemples(regionId: string): Promise<Temple[]> {
  return (await temples()).filter((t) => t.region === regionId);
}

export async function getTemple(regionId: string, id: string): Promise<Temple | null> {
  return (await temples()).find((t) => t.region === regionId && t.id === id) ?? null;
}

/** A temple gets its own page once it has an introduction. */
export function hasPage(t: Temple): boolean {
  return Boolean(t.introText);
}

export async function getTemplesWithPages(regionId: string): Promise<Temple[]> {
  return (await getTemples(regionId)).filter(hasPage);
}

/* ---------- Festivals & rituals ---------- */

export async function getObservances(): Promise<Observance[]> {
  return observances();
}

export async function getObservance(id: string): Promise<Observance | null> {
  return (await observances()).find((o) => o.id === id) ?? null;
}

/** Look up several observances by id, dropping unknown ids. */
export async function getObservancesById(ids: string[]): Promise<Observance[]> {
  const all = await observances();
  return ids.map((id) => all.find((o) => o.id === id)).filter((o) => o !== undefined);
}

/* ---------- Occasions: dated attendance ---------- */

/** A temple's year so far, oldest first. */
export async function getOccasionsForTemple(regionId: string, templeId: string): Promise<Occasion[]> {
  return (await occasions()).filter((o) => o.region === regionId && o.temple === templeId).sort(byDateAsc);
}

/** Every occasion involving a festival or ritual, oldest first. */
export async function getOccasionsForObservance(observanceId: string): Promise<Occasion[]> {
  return (await occasions()).filter((o) => o.observances.includes(observanceId)).sort(byDateAsc);
}

/* ---------- The ritual year ---------- */

export interface MonthEntry {
  observance: Observance;
  /** The dates the team saw it in this month, oldest first. */
  seen: Occasion[];
}

/** Every festival and ritual placed in its Tamil months — the months set in
    the admin, and every month the team has seen it in — plus the ones done
    all through the year, which belong to no month. One timeless year:
    dates from every year fall into the same twelve months. */
export async function getRitualYear(): Promise<{
  months: { month: TamilMonth; entries: MonthEntry[] }[];
  throughYear: Observance[];
}> {
  const all = await observances();
  const seenAll = await occasions();
  const months = TAMIL_MONTHS.map((month) => ({ month, entries: [] as MonthEntry[] }));
  for (const o of all) {
    if (o.throughYear) continue;
    const seen = seenAll.filter((x) => x.observances.includes(o.id)).sort(byDateAsc);
    const inMonths = new Set([...o.months, ...seen.map((x) => tamilMonthOf(x.date))]);
    for (const m of months) {
      if (inMonths.has(m.month.slug)) {
        m.entries.push({ observance: o, seen: seen.filter((x) => tamilMonthOf(x.date) === m.month.slug) });
      }
    }
  }
  // festivals first; then the most often seen
  for (const m of months) {
    m.entries.sort(
      (a, b) =>
        Number(a.observance.kind === "ritual") - Number(b.observance.kind === "ritual") ||
        b.seen.length - a.seen.length ||
        a.observance.name.localeCompare(b.observance.name)
    );
  }
  return { months, throughYear: all.filter((o) => o.throughYear) };
}

/** Every date the team was present that falls in a Tamil month, in any year. */
export async function getOccasionsInMonth(monthSlug: string): Promise<Occasion[]> {
  return (await occasions()).filter((o) => tamilMonthOf(o.date) === monthSlug).sort(byDateAsc);
}

/** The festivals and rituals seen at a temple, in the order first seen. */
export async function getObservancesForTemple(regionId: string, templeId: string): Promise<Observance[]> {
  const ids: string[] = [];
  for (const o of await getOccasionsForTemple(regionId, templeId)) {
    for (const id of o.observances) if (!ids.includes(id)) ids.push(id);
  }
  for (const n of await getFieldNotesForTemple(regionId, templeId)) {
    for (const id of n.observances) if (!ids.includes(id)) ids.push(id);
  }
  return getObservancesById(ids);
}

/** How many temples a festival or ritual has been seen at. */
export async function countTemplesForObservance(observanceId: string): Promise<number> {
  const seen = new Set(
    (await occasions()).filter((o) => o.observances.includes(observanceId)).map((o) => `${o.region}/${o.temple}`)
  );
  return seen.size;
}

/* ---------- Field notes (notes, interviews, videos, recordings, photos) ---------- */

/** Newest first. */
export async function getFieldNotes(regionId?: string): Promise<FieldNote[]> {
  return (await fieldNotes()).filter((n) => !regionId || n.region === regionId).sort(byDateDesc);
}

/** One note, with its full text, recording and photographs. */
export async function getFieldNote(id: string): Promise<FieldNote | null> {
  const doc = await rawOne("field-notes", id);
  return doc ? toFieldNote(doc, await lookups(), true) : null;
}

export async function getFieldNotesForTemple(regionId: string, templeId: string): Promise<FieldNote[]> {
  return (await getFieldNotes(regionId)).filter((n) => n.temples.includes(templeId));
}

export async function getFieldNotesForObservance(observanceId: string): Promise<FieldNote[]> {
  return (await getFieldNotes()).filter((n) => n.observances.includes(observanceId));
}

/* ---------- Drawings ---------- */

/** Drawings tagged with a temple: its plan first, then the rest. */
export async function getIllustrationsForTemple(regionId: string, templeId: string): Promise<Illustration[]> {
  return (await illustrations())
    .filter((d) => d.region === regionId && d.temples.includes(templeId))
    .sort((a, b) => Number(b.kind === "plan") - Number(a.kind === "plan"));
}

export async function getIllustrationsForObservance(observanceId: string): Promise<Illustration[]> {
  return (await illustrations()).filter((d) => d.observances.includes(observanceId));
}

/* ---------- The temple, and its people ---------- */

export async function getTempleEntries(
  regionId: string,
  templeId: string,
  topic: EntryTopic
): Promise<TempleEntry[]> {
  return (await templeEntries()).filter(
    (e) => e.region === regionId && e.topic === topic && e.temples.includes(templeId)
  );
}

/* ---------- Articles ---------- */

/** Newest first. */
export async function getArticles(): Promise<Article[]> {
  return articles();
}

/** One article, with its full text. */
export async function getArticle(id: string): Promise<Article | null> {
  const doc = await rawOne("articles", id);
  return doc ? toArticle(doc, await lookups(), true) : null;
}

export async function getArticlesForTemple(templeId: string): Promise<Article[]> {
  return (await getArticles()).filter((a) => a.temples.includes(templeId));
}

export async function getArticlesForObservance(observanceId: string): Promise<Article[]> {
  return (await getArticles()).filter((a) => a.observances.includes(observanceId));
}

/* ---------- Films ---------- */

/** Newest first. */
export async function getFilms(regionId?: string): Promise<Film[]> {
  return (await films()).filter((f) => !regionId || f.region === regionId);
}

/** One film, with its full text. */
export async function getFilm(id: string): Promise<Film | null> {
  const doc = await rawOne("films", id);
  return doc ? toFilm(doc, await lookups(), true) : null;
}

export async function getFilmsForTemple(regionId: string, templeId: string): Promise<Film[]> {
  return (await getFilms(regionId)).filter((f) => f.temples.includes(templeId));
}

export async function getFilmsForObservance(observanceId: string): Promise<Film[]> {
  return (await getFilms()).filter((f) => f.observances.includes(observanceId));
}

/* ---------- Photographs ---------- */

export async function getPhotosForTemple(regionId: string, templeId: string): Promise<Photo[]> {
  return (await photos()).filter((p) => p.temples.includes(`${regionId}/${templeId}`));
}

export async function getPhotosForObservance(observanceId: string): Promise<Photo[]> {
  return (await photos()).filter((p) => p.observances.includes(observanceId));
}

/* ---------- Newest additions (the home page) ---------- */

export type LatestItem =
  | { type: "field-note"; date: string; item: FieldNote }
  | { type: "article"; date: string; item: Article }
  | { type: "film"; date: string; item: Film };

/** Films dated before this are the Centre's older Instagram posts, brought in
    all at once in September 2026 — not new to anyone, so they stay out of
    "Just added". Films posted from this day on show up there by themselves. */
const FILMS_NEW_FROM = "2026-09-26";

/** Everything, newest first — keeps the home page current with no upkeep. */
export async function getLatest(limit: number): Promise<LatestItem[]> {
  const items: LatestItem[] = [
    ...(await getFieldNotes()).map((n) => ({ type: "field-note" as const, date: n.date, item: n })),
    ...(await getArticles()).map((a) => ({ type: "article" as const, date: a.date, item: a })),
    ...(await getFilms())
      .filter((f) => f.date >= FILMS_NEW_FROM)
      .map((f) => ({ type: "film" as const, date: f.date, item: f })),
  ];
  return items.sort(byDateDesc).slice(0, limit);
}

/* ---------- The book ---------- */

export async function getBook(regionId: string): Promise<Book | null> {
  const L = await lookups();
  const book = (await rawBooks()).find((b) => L.regionOf(b.region) === regionId);
  return book ? toBook(book, L) : null;
}

/* ---------- The Home and About pages (Settings in the admin) ---------- */

/** The line under a section page's title, as saved under Section
    descriptions; the original text if that box is empty. */
export async function getSectionIntro(name: SectionName): Promise<string> {
  const original = SECTION_INTROS.find((s) => s.name === name)!.text;
  try {
    const g = await (await db()).findGlobal({ slug: "section-descriptions", depth: 0, overrideAccess: true });
    return g[name]?.trim() || original;
  } catch {
    return original;
  }
}

/** The home page's words, or null if not yet written. */
export async function getHomePage(): Promise<HomePageText | null> {
  const g = await (await db()).findGlobal({ slug: "home-page", depth: 1, overrideAccess: true });
  if (!g.headline) return null;
  const L = await lookups();
  return {
    headline: g.headline,
    headlineItalic: g.headlineItalic !== false,
    opening: toHTML(g.opening, L.paths),
    quoteLabel: g.quoteLabel || undefined,
    quote: g.quote ?? undefined,
    quoteBy: g.quoteBy || undefined,
    quoteAfter: g.quoteAfter || undefined,
    quoteLink: g.quoteLinkText && g.quoteLink ? { text: g.quoteLinkText, href: g.quoteLink } : undefined,
    bookHeading: g.bookHeading ?? undefined,
    bookText: g.bookText ?? undefined,
  };
}

/** The About page's words, or null if not yet written. */
export async function getAboutPage(): Promise<AboutPageText | null> {
  const g = await (await db()).findGlobal({ slug: "about-page", depth: 1, overrideAccess: true });
  if (!g.lede) return null;
  const L = await lookups();
  return {
    lede: g.lede,
    sections: (g.sections ?? []).map((s) => ({
      heading: s.heading,
      anchor: s.anchor || undefined,
      body: toHTML(s.body, L.paths),
    })),
    team: (g.team ?? []).map((p) => ({ name: p.name, role: p.role ?? undefined, bio: p.bio ?? undefined })),
    contactText: g.contactText ?? undefined,
    contactEmail: g.contactEmail ?? undefined,
  };
}
