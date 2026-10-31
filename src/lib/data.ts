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
import { unstable_cache } from "next/cache";
import { getPayload, type Payload, type Where } from "payload";
import { PHOTOS_TAG, SITE_CONTENT_TAG } from "./siteCache";
import { cache } from "react";
import type * as P from "@/payload-types";
import type {
  Article,
  Book,
  DeityGroup,
  EntryTopic,
  FieldNote,
  Film,
  Illustration,
  Observance,
  Occasion,
  Photo,
  PhotoFilter,
  Picture,
  Region,
  RegionId,
  Facing,
  Temple,
  TempleEntry,
  HomePageText,
  AboutPageText,
} from "@/content/types";
import { openingText, plainText, toHTML, type LinkPaths } from "./richtext";
import { DEITY_GROUP_LABELS } from "@/content/labels";
import { SECTION_INTROS, type SectionName } from "@/payload/sectionIntros";
import { seeded } from "./mahotsavam";
import { monthDates, monthYearOf, TAMIL_MONTHS, tamilMonthOf, type TamilMonth } from "./calendar";
import { festivalPath } from "./festivals";
import { eventOf } from "./photoPack";
import type { TithiKey } from "./tithiNames";
import type { SpecialIconKey } from "./specialIcons";

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

/* What the site reads from the database is kept between visits (Next's data
   cache), each query by its own terms, until anything is saved or deleted in
   the admin (payload/revalidate clears it all, SITE_CONTENT_TAG): so pages
   built or rebuilt read the database only after a change, not each time. An
   editor previewing drafts reads it fresh; so does this laptop's copy of the
   site (`next dev`), whose database the scripts change from outside it. */
const fresh = async (draft?: boolean) => Boolean(draft) || process.env.NODE_ENV === "development" || (await previewing());
const findTagged = (tag: string) =>
  (async (args: Parameters<Payload["find"]>[0]) => {
    const load = async () => (await db()).find(args);
    if (await fresh(args.draft)) return load();
    return unstable_cache(load, ["find", JSON.stringify(args)], { tags: [tag] })();
  }) as Payload["find"];
const find = findTagged(SITE_CONTENT_TAG);
// the photographs, under their own tag (lib/siteCache)
const findPhotos = findTagged(PHOTOS_TAG);
const findGlobal = (async (args: Parameters<Payload["findGlobal"]>[0]) => {
  const load = async () => (await db()).findGlobal(args);
  if (await fresh(args.draft)) return load();
  return unstable_cache(load, ["findGlobal", JSON.stringify(args)], { tags: [SITE_CONTENT_TAG] })();
}) as Payload["findGlobal"];

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
  (await find({ ...base, collection: "regions", depth: 0, sort: "createdAt" })).docs
);

// (joins: false — the admin's lists of each temple's pieces aren't needed here)
const rawTemples = cache(async () =>
  (
    await find({
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
    await find({
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
  (await find({ ...base, collection: "occasions", depth: 0, sort: "date" })).docs
);

// Lists of notes and articles skip their pictures and links; each one's own page loads those.
const rawNotes = cache(async () =>
  (await find({ ...base, ...(await visible()), collection: "field-notes", depth: 0, sort: "-date" }))
    .docs
);

const rawArticles = cache(async () =>
  (await find({ ...base, ...(await visible()), collection: "articles", depth: 0, sort: "-date" })).docs
);

const rawDrawings = cache(async () =>
  (await find({ ...base, ...(await visible()), collection: "drawings", depth: 1, sort: "createdAt" }))
    .docs
);

const rawPieces = cache(async () =>
  (await find({ ...base, ...(await visible()), collection: "temple-pieces", depth: 1, sort: "createdAt" }))
    .docs
);

const rawBooks = cache(async () =>
  (await find({ ...base, ...(await visible()), collection: "books", depth: 0 })).docs
);

/** One document by its web address, with its pictures and links. */
async function rawOne<C extends "field-notes" | "articles" | "films">(collection: C, slug: string) {
  const { draft, where } = await visible();
  const bySlug: Where = { slug: { equals: slug } };
  const { docs } = await find({
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

/** Every photograph (not videos or files): the ones in a photo set, tagged
    with a temple or festival, or in a field note, are picked out below.
    Read a part at a time, each part kept on its own (the data cache keeps
    nothing over 2 MB), with only what the site shows of each. */
const PHOTO_PART = 1000; // about 1 KB each: 1 MB a part, well under the limit
const rawPhotos = cache(async () => {
  const out: P.Media[] = [];
  for (let page = 1; ; page++) {
    const { docs, hasNextPage } = await findPhotos({
      collection: "media",
      depth: 0,
      overrideAccess: true,
      where: { mimeType: { contains: "image" } },
      sort: "id",
      limit: PHOTO_PART,
      page,
      // (prefix, _objectKey: the folder some files are kept in, as a film's still uploaded with it, without which its address leads nowhere)
      select: {
        filename: true, prefix: true, _objectKey: true, url: true, width: true, height: true, focalX: true, focalY: true,
        alt: true, caption: true, credit: true, consent: true, featured: true, takenOn: true, takenAt: true, position: true,
        temples: true, observances: true, set: true, createdAt: true,
        sizes: {
          thumbnail: { url: true, filename: true },
          card: { url: true, filename: true },
          large: { url: true, filename: true, width: true, height: true },
        },
      },
    });
    out.push(...(docs as P.Media[]));
    if (!hasNextPage) return out;
  }
});

/** The photo sets: each day's or event's photographs, as kept in their folders. */
const rawSets = cache(async () =>
  (await find({ ...base, collection: "photo-sets", depth: 0, sort: "-date", joins: false })).docs
);

/** Films, with their video files and still frames (so depth 2). */
const rawFilms = cache(async () =>
  (await find({ ...base, ...(await visible()), collection: "films", depth: 2, sort: "-date" })).docs
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

/** Dates are stored as moments; the site shows the day it was in Pondicherry.
    (Each worked out once: it is asked of the same few moments thousands of
    times over, for the photographs, and working it out is slow.) */
const days = new Map<string, string>();
const dayOf = (moment: string) => {
  let day = days.get(moment);
  if (day === undefined) {
    day = new Date(moment).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    days.set(moment, day);
  }
  return day;
};

function toPicture(ref: number | P.Media | null | undefined): Picture | undefined {
  if (!ref || typeof ref !== "object" || !ref.url || ref.consent === "withhold") return undefined;
  const large = ref.sizes?.large;
  return {
    src: large?.url ?? ref.url,
    width: large?.width ?? ref.width ?? 0,
    height: large?.height ?? ref.height ?? 0,
    alt: ref.alt ?? "",
    caption: ref.caption ?? undefined,
    credit: shownCredit(ref.credit),
  };
}

/** The team's own photographs are not credited on the site: their credit
    is kept with each photo (who took it), but shown only for anyone else's. */
const TEAM_CREDITS = ["Photograph: Deepa", "Photograph: Arunaditya"];
const shownCredit = (credit?: string | null) =>
  credit && !TEAM_CREDITS.includes(credit.trim()) ? credit : undefined;

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
  // A box cleared in the admin is saved as "", which would hide the name.
  knownAs: t.knownAs?.trim() || undefined,
  shortName: t.shortName?.trim() || undefined,
  deity: t.deity ?? undefined,
  group: t.deityGroup,
  street: t.street?.trim() || undefined,
  faces: t.faces ?? "east",
  intro: toHTML(t.intro, L.paths) || undefined,
  introText: plainText(t.intro) || undefined,
  coordinates:
    t.coordinates?.lat != null && t.coordinates?.lng != null
      ? [t.coordinates.lat, t.coordinates.lng]
      : undefined,
  listed: t.listed !== false,
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
  recurs: o.recurs ?? "yearly",
  recursWhen: o.recursWhen ?? undefined,
});

const toOccasion = (o: P.Occasion, L: Lookups): Occasion => ({
  date: dayOf(o.date),
  region: L.regionOf(o.region),
  temple: L.templeSlug.get(idOf(o.temple) ?? -1) ?? "",
  townWide: !o.temple,
  label: o.label,
  observances: slugs(o.observances, L.observanceSlug),
  note: L.noteSlug.get(idOf(o.fieldNote) ?? -1),
  tbc: Boolean(o.tbc),
  schedule: (o.schedule ?? []).map(({ time, what }) => ({ time, what })),
  notInYear: Boolean(o.notInYear),
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
    // left empty on a day with nothing more to say than its occasion
    title: n.title?.trim() || n.occasion,
    authors: n.authors ?? [],
    excerpt: openingText(n.body),
    // For the Field Notes page, which shows as much as fits beside the photograph.
    summary: plainText(n.body).slice(0, 1500),
    // For lists: its first photograph (if any can be shown); for a list's
    // notes, read without their photographs, filled in from them (fieldNotes)
    lead: (n.photos ?? []).map((ref) => (typeof ref === "object" ? toPicture(ref) : undefined)).find((p): p is Picture => Boolean(p)),
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
  // the copy made for the site (cut to the drawing, its paper clear), or the image as uploaded
  const picture = toPicture(d.shown) ?? toPicture(d.image);
  if (!picture) return null;
  return {
    ...picture,
    id: String(d.id),
    region: L.regionOf(d.region),
    kind: d.kind,
    stackOrder: d._drawings_drawings_order ?? undefined,
    coverOnly: d.coverOnly === true || undefined,
    faces: (d.faces as Facing | null | undefined) ?? undefined,
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
  date: dayOf(e.date ?? e.createdAt),
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

// Only occasions at a visible temple, and those of the whole town. Each
// leads to the field note about it: the one chosen in the admin, or else the
// field note written at the same temple on the same day.
const occasions = cache(async () => {
  const L = await lookups();
  const notes = await fieldNotes();
  return (await rawOccasions())
    .map((o) => toOccasion(o, L))
    .filter((o) => o.temple || o.townWide)
    .map((o) =>
      o.note || !o.temple ? o : { ...o, note: notes.find((n) => n.date === o.date && n.temples.includes(o.temple))?.id }
    );
});

// (a note's first photograph, for lists: its own, or else the first of its photo sets')
const fieldNotes = cache(async () => {
  const L = await lookups();
  const { byNote } = await photoData();
  return (await rawNotes())
    .filter((n) => n.slug)
    .map((n) => toFieldNote(n, L, false))
    // (its 960 px copy: lists show it small)
    .map((n) => {
      const first = byNote.get(n.id)?.[0];
      return n.lead || !first ? n : { ...n, lead: { ...first, src: first.medium } };
    });
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
   field note it is in is tagged. A photo in a photo set shows where its set
   does: at the set's temples; beside the field note chosen for the set, or
   else each one of the same day at one of its temples (so a note's photos
   come by themselves the day it is published); and at the festivals and
   rituals of that day at its temples, from "The year so far", with those
   chosen for the set and those of its notes. A set of Pondicherry's Hindu
   Ethos takes only the tags chosen for it. Photos in a set show on the
   Photographs page even with no tags at all. */

/** A set's occasion in its shortest form, for the photo viewer, where its
    "Short name" is not filled in: up to the first comma, and no further than
    "Day 5" ("Navaratri Day 9, Saraswati Alankaram": "Navaratri Day 9"); a
    month's name kept with what follows it ("Adi, Friday1": "Adi Friday1"),
    and a day's number with what comes before ("Andu Vizha, Day 2"); of
    two things done, the first. */
const MONTH_FIRST = /^(?:adi|aadi|aavani|avani|purattasi|aippasi|karthigai|margazhi|thai|masi|panguni|chithirai|vaikasi|aani)$/i;
function shortOccasion(title: string) {
  const parts = title.split(",").map((p) => p.trim()).filter(Boolean);
  let first = parts[0] ?? "";
  if (parts[1] && (MONTH_FIRST.test(first) || /^day \d+$/i.test(parts[1]))) first = `${first} ${parts[1]}`;
  first = first.match(/^(.*?\bday \d+)\b/i)?.[1] ?? first;
  // and of two, the first ("Pournami Abhishekam and Satyanarayana Puja")
  return first.split(/\s+and\s+/i)[0];
}

async function buildPhotoData() {
  const L = await lookups();
  const notes = await rawNotes();
  const notesWith = new Map<number, P.FieldNote[]>(); // newest note first
  for (const n of notes) {
    if (!n.slug) continue;
    for (const ref of n.photos ?? []) {
      const id = idOf(ref);
      if (id !== undefined) notesWith.set(id, [...(notesWith.get(id) ?? []), n]);
    }
  }
  // each set's own place: its temples, festivals, notes and day
  const ids = (refs: Ref[] | null | undefined) => (refs ?? []).map(idOf).filter((id): id is number => id !== undefined);
  const occasionsOn = new Map<string, P.Occasion[]>();
  for (const o of await rawOccasions()) {
    const day = dayOf(o.date);
    occasionsOn.set(day, [...(occasionsOn.get(day) ?? []), o]);
  }
  const sets = new Map(
    (await rawSets()).map((s) => {
      const day = s.date ? dayOf(s.date) : undefined;
      const temples = ids(s.temples);
      const chosen = idOf(s.fieldNote);
      // (that day's occasions at its temples may name their note, too)
      const dayHere = day ? (occasionsOn.get(day) ?? []).filter((o) => temples.includes(idOf(o.temple) ?? -1)) : [];
      const named = dayHere.map((o) => idOf(o.fieldNote));
      const setNotes = notes.filter(
        (n) =>
          n.slug &&
          (chosen !== undefined
            ? n.id === chosen
            : (Boolean(day) && dayOf(n.date) === day && ids(n.temples).some((t) => temples.includes(t))) || named.includes(n.id))
      );
      const observances = new Set(slugs(s.observances, L.observanceSlug));
      if (!s.ethos) for (const o of dayHere) slugs(o.observances, L.observanceSlug).forEach((x) => observances.add(x));
      return [s.id, { set: s, day, temples, notes: setNotes, observances }] as const;
    })
  );

  const templeByKey = new Map((await temples()).map((t) => [`${t.region}/${t.id}`, t]));
  const observanceById = new Map((await observances()).map((o) => [o.id, o]));
  // a set's temple, or two, by their shortest names (more: none, a whole town's event)
  const placeOf = (ids: number[]) => {
    const names = ids.flatMap((id) => {
      const t = templeByKey.get(L.templeKey.get(id) ?? "");
      return t ? [t.shortName ?? t.knownAs ?? t.name] : [];
    });
    return names.length && names.length <= 2 ? names.join(" and ") : undefined;
  };
  const out: Photo[] = [];
  const byNote = new Map<string, Photo[]>();
  const timeOf = new Map<Photo, string>(); // when the camera says each was taken, for the order within a day
  const placeIn = new Map<Photo, number>(); // its place in its set, as arranged in the admin's photo grid
  // the sets of each day at each temple: a photo in no set (a film's still) is
  // shown with the one set of its day at its temple, as part of that event
  // (of a day divided into several sets, the first of them that has photos)
  const setsOfDay = new Map<string, Set<typeof sets extends Map<unknown, infer V> ? V : never>>();
  for (const entry of sets.values())
    for (const t of entry.temples) {
      const key = `${entry.day}|${L.templeKey.get(t)}`;
      setsOfDay.set(key, (setsOfDay.get(key) ?? new Set()).add(entry));
    }
  const raw = await rawPhotos();
  const filled = new Set(raw.map((m) => idOf(m.set)));
  for (const m of raw) {
    const picture = toPicture(m);
    if (!picture) continue;
    const inSet = sets.get(idOf(m.set) ?? -1);
    const notes = [...(notesWith.get(m.id) ?? []), ...(inSet?.notes ?? [])].filter((n, i, all) => all.indexOf(n) === i);
    const temples = new Set(slugs(m.temples, L.templeKey));
    const observances = new Set(slugs(m.observances, L.observanceSlug));
    inSet?.temples.forEach((t) => L.templeKey.has(t) && temples.add(L.templeKey.get(t)!));
    inSet?.observances.forEach((o) => observances.add(o));
    // a photo of its own temple (or set's) is that temple's alone: a note of
    // two temples does not put it on the other's page too
    const ownTemples = temples.size > 0;
    for (const n of notes) {
      if (!ownTemples) slugs(n.temples, L.templeKey).forEach((t) => temples.add(t));
      slugs(n.observances, L.observanceSlug).forEach((o) => observances.add(o));
    }
    if (!inSet && !temples.size && !observances.size) continue;
    const note = [...notes].sort((a, b) => b.date.localeCompare(a.date))[0];
    const taken = m.takenOn ?? inSet?.day ?? note?.date;
    const ofDay = inSet
      ? undefined
      : (() => {
          const found = [...new Set([...temples].flatMap((key) => [...(setsOfDay.get(`${taken ? dayOf(taken) : ""}|${key}`) ?? [])]))];
          const withPhotos = found.filter((e) => filled.has(e.set.id)).sort((a, b) => a.set.id - b.set.id);
          return taken && found.length === 1 ? found[0] : taken ? withPhotos[0] : undefined;
        })();
    const event = inSet ?? ofDay;
    const photo: Photo = {
      ...picture,
      id: String(m.id),
      small: m.sizes?.thumbnail?.url ?? picture.src,
      medium: m.sizes?.card?.url ?? picture.src,
      focus: [m.focalX ?? 50, m.focalY ?? 50],
      temples: [...temples],
      observances: [...observances],
      deities: [...new Set([...temples].flatMap((key) => templeByKey.get(key)?.group ?? []))],
      tags: [
        ...[...temples].flatMap((key) => {
          const t = templeByKey.get(key);
          return t ? [{ label: t.knownAs ?? t.name, href: hasPage(t) ? `/${t.region}/${t.id}` : undefined }] : [];
        }),
        ...[...observances].flatMap((id) => {
          const o = observanceById.get(id);
          return o ? [{ label: o.name, href: festivalPath(o.id) }] : [];
        }),
      ],
      date: dayOf(taken ?? m.createdAt),
      dated: Boolean(taken),
      featured: Boolean(m.featured),
      note: note ? { href: `/field-notes/${note.slug}`, title: note.title?.trim() || note.occasion } : undefined,
      set: event ? String(event.set.id) : undefined,
      occasion: event?.set.title || undefined,
      short: event ? event.set.short?.trim() || shortOccasion(event.set.title) : undefined,
      place: event ? placeOf(event.temples) : undefined,
    };
    out.push(photo);
    if (m.takenAt) timeOf.set(photo, m.takenAt);
    if (typeof m.position === "number") placeIn.set(photo, m.position);
    for (const n of notes) byNote.set(n.slug!, [...(byNote.get(n.slug!) ?? []), photo]);
  }
  // newest day first, those of no known day after all the rest; a day's
  // photos in the order they were taken (by the camera's time, else as
  // numbered by the camera and brought in)
  // and each day's events kept together (two sets of one name, one event:
  // lib/photoPack, eventOf), in the order they began (or, a day divided into
  // several sets, in their places in it: "Place in its day"); within an
  // event, set by set, each as arranged in its photo grid, if it has been
  const began = new Map<string, string>();
  const setBegan = new Map<string, string>();
  for (const p of out) {
    const t = timeOf.get(p) ?? "~";
    if (p.set && !(began.get(eventOf(p))! <= t)) began.set(eventOf(p), t);
    if (p.set && !(setBegan.get(p.set)! <= t)) setBegan.set(p.set, t);
  }
  const dayPlace = new Map<string, number>();
  for (const p of out) {
    const n = p.set ? sets.get(Number(p.set))?.set.dayOrder : undefined;
    if (typeof n === "number" && !(dayPlace.get(eventOf(p))! <= n)) dayPlace.set(eventOf(p), n);
  }
  const place = (p: Photo) => (dayPlace.has(eventOf(p)) ? String(dayPlace.get(eventOf(p))).padStart(4, "0") : "~");
  const startOf = (p: Photo) => (p.set ? `${place(p)}|${began.get(eventOf(p))}|${eventOf(p)}` : "");
  const inSetOrder = (a: Photo, b: Photo) =>
    (a.set && b.set ? `${setBegan.get(a.set)}|${a.set}`.localeCompare(`${setBegan.get(b.set)}|${b.set}`) : 0) ||
    (a.set && a.set === b.set ? (placeIn.get(a) ?? Infinity) - (placeIn.get(b) ?? Infinity) : 0) ||
    (timeOf.get(a) ?? "").localeCompare(timeOf.get(b) ?? "") ||
    Number(a.id) - Number(b.id);
  const list = out.sort(
    (a, b) =>
      Number(b.dated) - Number(a.dated) ||
      b.date.localeCompare(a.date) ||
      startOf(a).localeCompare(startOf(b)) ||
      inSetOrder(a, b)
  );
  for (const [, list] of byNote) list.sort(inSetOrder);
  return { list, byNote, sets };
}

/* Working the photographs out takes a while (there are thousands), so it is
   done once and kept, across visits, until anything it rests on changes: a
   photo, a photo set, a field note, an occasion, a temple or a festival (each
   one's latest change, and how many there are), or drafts being previewed. */
const PHOTO_SOURCES = ["media", "photo-sets", "field-notes", "occasions", "temples", "observances"] as const;
let keptPhotos: { key: string; data: ReturnType<typeof buildPhotoData> } | null = null;
const photoData = cache(async () => {
  const draft = await previewing();
  const marks = await Promise.all(
    PHOTO_SOURCES.map(async (collection) => {
      const { docs, totalDocs } = await (collection === "media" ? findPhotos : find)({
        collection,
        depth: 0,
        limit: 1,
        sort: "-updatedAt",
        overrideAccess: true,
        draft,
        select: { updatedAt: true },
      });
      return `${totalDocs}@${docs[0]?.updatedAt ?? ""}`;
    })
  );
  const key = [draft, ...marks].join("|");
  if (keptPhotos?.key !== key) {
    const data = buildPhotoData();
    keptPhotos = { key, data };
    data.catch(() => keptPhotos?.data === data && (keptPhotos = null)); // a failed one is tried again next time
  }
  return keptPhotos.data;
});

const photos = cache(async () => (await photoData()).list);

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
/** A region's temples, the one with the newest field note first; those with
    none yet after them, in the order they are arranged in the admin. */
export async function getTemples(regionId: string): Promise<Temple[]> {
  const latest = new Map<string, string>();
  for (const n of await fieldNotes()) {
    for (const t of n.temples) if ((latest.get(t) ?? "") < n.date) latest.set(t, n.date);
  }
  return (await temples())
    .filter((t) => t.region === regionId)
    .map((t, i) => ({ t, i, d: latest.get(t.id) ?? "" }))
    .sort((a, b) => b.d.localeCompare(a.d) || a.i - b.i)
    .map(({ t }) => t);
}

export async function getTemple(regionId: string, id: string): Promise<Temple | null> {
  return (await temples()).find((t) => t.region === regionId && t.id === id) ?? null;
}

/** A temple gets its own page once it has an introduction. */
/** Every temple has a page: one of the town's, its full page (with a note
    in place of its introduction until that is written); one in and around
    the town, a simpler one (its field notes, photographs and films). */
export function hasPage(_t: Temple): boolean {
  return true;
}

/** Whether a temple is one "in and around" the town: part of the story, not
    at the centre of the documentation. */
export function isAround(t: Temple): boolean {
  return t.region.startsWith("in-and-around-");
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

/** Where the line of months shown begins (as the first day of a month):
    Masi 2026, the month before the team's first day (in Panguni 2026); or,
    should anything ever be recorded before then, the month it falls in. */
export async function getLineBegins(): Promise<string> {
  const set = monthDates("masi", 2026).first;
  const first = (await occasions()).map((o) => o.date).sort()[0];
  const recorded = first ? monthDates(tamilMonthOf(first), monthYearOf(first)).first : set;
  return recorded < set ? recorded : set;
}

/** The nakshatrams kept specially in a Tamil month (set in the admin as rules): month → nakshatram names. */
export const getSpecialNakshatras = cache(async (): Promise<Record<string, { name: string; nakshatram: string; icon: SpecialIconKey | null }[]>> => {
  const docs = (await find({ ...base, collection: "special-nakshatras", depth: 0 })).docs;
  const out: Record<string, { name: string; nakshatram: string; icon: SpecialIconKey | null }[]> = {};
  for (const d of docs) (out[d.month] ??= []).push({ name: d.name, nakshatram: d.nakshatram, icon: d.replaceIcon && d.icon ? (d.icon as SpecialIconKey) : null });
  return out;
});

/** The tithis kept as great days, by Tamil month (rules set in the admin):
    month → its rules, each a tithi and the day's name in English and Tamil. */
export type SpecialTithi = { name: string; tamil: string; tithi: TithiKey; nakshatram: string | null; icon: SpecialIconKey | null };
export const getSpecialTithis = cache(async (): Promise<Record<string, SpecialTithi[]>> => {
  const docs = (await find({ ...base, collection: "special-tithis", depth: 0 })).docs;
  const out: Record<string, SpecialTithi[]> = {};
  for (const d of docs) (out[d.month] ??= []).push({ name: d.name, tamil: d.tamil ?? "", tithi: d.tithi as TithiKey, nakshatram: d.nakshatram ?? null, icon: d.replaceIcon && d.icon ? (d.icon as SpecialIconKey) : null });
  return out;
});

/** What the temples do again and again, as set in the admin ("Regular
    repeating rituals"), once for each time it is done at a temple (a ritual
    has a section for each of its temples, each with one or more times): how
    often (every week, twice a month, every month), its days of the week
    (sun…sat) or what it falls on (a tithi, a nakshatram), when in the day
    and anything particular to that time; its name, Tamil and few words
    there; its temples (named, with their pages: several, where it is done
    at the same time and in the same way at each) and festivals. */
export type RegularRitual = {
  id: string;
  what: string;
  tamil?: string;
  often: "weekly" | "fortnightly" | "monthly";
  days: string[];
  on: string;
  time: string;
  /** particular to this time (its "Details" in the admin) */
  details?: string;
  /** to be confirmed */
  tbc: boolean;
  /** a few words on it, for a temple's Ritual Year */
  about?: string;
  /** the set it belongs to (Pancha Paruva Utsavam), and its Tamil */
  partOf?: string;
  partOfTamil?: string;
  temples: { key: string; name: string; href: string | null }[];
  observances: { id: string; name: string }[];
};
export type WeeklyRitual = RegularRitual;
/** The weekly ones (Varam), under every month's calendar. */
export const getWeeklyRituals = cache(async (): Promise<WeeklyRitual[]> => (await getRegularRituals()).filter((r) => r.often === "weekly"));
export const getRegularRituals = cache(async (): Promise<RegularRitual[]> => {
  const [docs, temples, L, obs] = await Promise.all([
    (async () => (await find({ ...base, collection: "weekly-rituals", depth: 0 })).docs)(),
    rawTemples(),
    lookups(),
    observances(),
  ]);
  const byId = new Map(temples.map((t) => [t.id, t]));
  const text = (v: string | null | undefined) => v?.trim() || undefined;
  const each = docs.flatMap((d) => {
    const observances = (d.observances ?? [])
      .map((ref) => obs.find((o) => o.id === L.observanceSlug.get(idOf(ref) ?? -1)))
      .filter((o) => o !== undefined)
      .map((o) => ({ id: o.id, name: o.name }));
    return (d.atTemples ?? []).flatMap((at) => {
      const t = byId.get(idOf(at.temple) ?? -1);
      if (!t) return [];
      // the festival or ritual it is at this temple (a day of the week's entry: each its own), or the entry's
      const here = (at.observances ?? [])
        .map((ref) => obs.find((o) => o.id === L.observanceSlug.get(idOf(ref) ?? -1)))
        .filter((o) => o !== undefined)
        .map((o) => ({ id: o.id, name: o.name }));
      const temple = { key: L.templeKey.get(t.id) ?? "", name: t.knownAs || t.name, href: L.paths.temple(t.id) };
      return (at.times ?? []).map(
        (time): RegularRitual => ({
          id: String(d.id),
          what: text(at.name) ?? d.what,
          tamil: text(at.tamil) ?? text(d.tamil),
          often: d.often ?? "weekly",
          // the day of the week, for what is done every week: the entry's ("Fridays")
          days: (d.often ?? "weekly") === "weekly" && d.weekday ? [d.weekday] : [],
          on: text(time.on) ?? "",
          time: text(time.time) ?? "",
          details: text(time.details),
          tbc: Boolean(at.tbc),
          about: text(at.about) ?? text(d.about),
          partOf: at.panchaParvam ? "Pancha Paruva Utsavam" : undefined,
          partOfTamil: at.panchaParvam ? "பஞ்ச பருவ உற்சவம்" : undefined,
          temples: [temple],
          observances: here.length ? here : observances,
        }),
      );
    });
  });
  // the same ritual, at the same time and in the same way at several temples: once, with them all
  const once = new Map<string, RegularRitual>();
  for (const r of each) {
    const key = JSON.stringify([r.id, r.what, r.tamil, r.days, r.on, r.time, r.details, r.tbc, r.about, r.partOf]);
    const had = once.get(key);
    if (had) had.temples.push(...r.temples);
    else once.set(key, r);
  }
  return [...once.values()];
});

/** Every date the team was present, oldest first. */
export async function getOccasions(): Promise<Occasion[]> {
  return [...(await occasions())].sort(byDateAsc);
}

/** Every date the team was present that falls in a Tamil month, in any year. */
export async function getOccasionsInMonth(monthSlug: string): Promise<Occasion[]> {
  return (await occasions()).filter((o) => tamilMonthOf(o.date) === monthSlug).sort(byDateAsc);
}

/** A temple's ritual year, as its page shows it: the twelve months of one
    timeless year, Chithirai to Panguni, and under each what was seen there
    (in any year), each once with the number of days it was seen. Each day counts as one thing: the first
    of its festivals and rituals (in the order they are tagged) that comes
    once a year; failing that, one that comes every month; failing that,
    every week. Rites done within other events (a purappadu, an abhishekam)
    are never what a day counts as (set in the admin: "In a temple's Ritual
    Year") — except on a day that has nothing else: then the day is listed
    under its own name, as written ("Sunday Bhairava Abhishekam"), and leads
    to its rite's one page (the Abhishekam); when the name begins with a day
    of the week, it comes every week ("Every Sunday"), and the day is said
    there only ("Bhairava Abhishekam • Every Sunday"). A thing's days are
    taken as one run while they follow each other (a day or two apart at
    most), and the run goes in the Tamil month that holds the most of them
    (Ramanujar Utsavam, from the last day of Panguni into Chithirai, in
    Chithirai). In each month the yearly ones come first, in the order they
    began. Apart from the months (`regular`), once each: everything that
    comes every month or every week. */
/** `observance`: what it is, and where it leads (none, for a regular ritual
    not linked to one); `name`, `tamil`, `recurs` and `when`, for a day listed
    under its own name (an instance of a rite) or a regular ritual, in place of
    its festival's or ritual's. */
export type TempleYearEntry = {
  observance?: Observance;
  days: number;
  name?: string;
  tamil?: string;
  recurs?: Observance["recurs"];
  when?: string;
  /** a few words on it (a regular ritual's, from the admin) */
  about?: string;
  /** to be confirmed */
  tbc?: boolean;
  /** a regular ritual's days of the week (sun…sat), what it falls on, and when in the day */
  weekdays?: string[];
  on?: string;
  time?: string;
  /** anything particular to this time */
  details?: string;
  /** the set it belongs to (Pancha Paruva Utsavam), and its Tamil */
  partOf?: string;
  partOfTamil?: string;
};
export type TempleYearMonth = { month: TamilMonth; festivals: TempleYearEntry[] };
export type TempleRitualYear = { months: TempleYearMonth[]; regular: TempleYearEntry[] };
export async function getTempleRitualYear(regionId: string, templeId: string): Promise<TempleRitualYear> {
  // (a day left out of it in the admin, like the eve of a festival, is not counted)
  const seen = (await getOccasionsForTemple(regionId, templeId)).filter((o) => !o.notInYear);
  const all = await getObservancesById([...new Set(seen.flatMap((o) => o.observances))]);
  const byId = new Map(all.map((o) => [o.id, o]));
  const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  // what each day counts as: a festival or ritual of its own; or, on a day
  // of rites alone, the day under its own name, as an instance of the first
  type What = { key: string; observance: Observance; name?: string; recurs?: Observance["recurs"]; when?: string };
  const dayOf = (o: Occasion): What | undefined => {
    const tagged = o.observances.map((id) => byId.get(id)).filter((x): x is Observance => Boolean(x));
    const own =
      tagged.find((x) => x.recurs === "yearly") ??
      tagged.find((x) => x.recurs === "monthly") ??
      tagged.find((x) => x.recurs === "weekly");
    if (own) return { key: own.id, observance: own };
    const rite = tagged[0];
    if (!rite) return undefined;
    const day = WEEKDAYS.find((d) => o.label.toLowerCase().startsWith(d.toLowerCase()));
    return {
      key: `${rite.id}|${o.label}`,
      observance: rite,
      // the day of the week said once, in "Every Friday", not in its name too
      name: day ? o.label.slice(day.length).replace(/^[\s,:;·–—-]+/, "") || rite.name : o.label,
      ...(day ? { recurs: "weekly" as const, when: `Every ${day}` } : { recurs: "yearly" as const }),
    };
  };
  // the temple's regular rituals (set in the admin: every week, twice a
  // month, every month): each listed under every month; a recorded day that
  // is one of them (its festival or ritual, or its name in the day's)
  // counts as it, and is not listed again
  const key = `${regionId}/${templeId}`;
  const regular = (await getRegularRituals()).filter((r) => r.temples.some((t) => t.key === key));
  const linked = new Map((await getObservancesById([...new Set(regular.flatMap((r) => r.observances.map((x) => x.id)))])).map((o) => [o.id, o]));
  const plain = (s: string) => ` ${s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
  const weekday = (iso: string) => ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][new Date(`${iso}T00:00:00Z`).getUTCDay()];
  const isRegular = (o: Occasion) =>
    regular.some(
      (r) =>
        // its name in the day's, or (for a monthly one) the day it falls on
        plain(o.label).includes(plain(r.what)) ||
        (r.often !== "weekly" && r.on.length > 3 && plain(o.label).includes(plain(r.on))) ||
        r.observances.some((x) => {
          if (!o.observances.includes(x.id)) return false;
          // a rite (a purappadu, an abhishekam) only on the regular ritual's own day of the week
          const rite = linked.get(x.id)?.recurs === "rite";
          return !rite || (r.often === "weekly" && r.days.includes(weekday(o.date)));
        }),
    );
  const DAYS: Record<string, string> = { sun: "Sunday", mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday" };
  const regularEntries: TempleYearEntry[] = regular
    .sort((a, b) => ["weekly", "fortnightly", "monthly"].indexOf(a.often) - ["weekly", "fortnightly", "monthly"].indexOf(b.often))
    .map((r) => {
      const observance = r.observances[0] ? linked.get(r.observances[0].id) : undefined;
      const when =
        r.often === "weekly"
          ? `Every ${r.days.map((d) => DAYS[d] ?? d).join(" and ")}`
          : `${r.often === "fortnightly" ? "Twice a month" : "Every month"}${r.on ? `, on ${r.on}` : ""}`;
      return {
        observance,
        days: 0,
        name: r.what,
        tamil: r.tamil ?? observance?.tamil,
        recurs: r.often === "weekly" ? ("weekly" as const) : ("monthly" as const),
        when: r.time ? `${when}, ${r.time}` : when,
        about: r.about,
        tbc: r.tbc,
        weekdays: r.days,
        on: r.on,
        time: r.time,
        details: r.details,
        partOf: r.partOf,
        partOfTamil: r.partOfTamil,
      };
    });

  const whatOf = new Map<string, What>();
  const datesOf = new Map<string, Set<string>>();
  for (const o of seen) {
    const what = dayOf(o);
    if (!what) continue;
    // a day of one of the regular rituals: counted there, not again. So too a
    // day of rites alone listed under its own name ("Puja for Punarpoosam…",
    // tagged Purappadu): counted with the yearly, it would otherwise stay
    // among the festivals although it is the monthly Punarpoosam
    const ownName = what.name !== undefined;
    if (((what.recurs ?? what.observance.recurs) !== "yearly" || ownName) && isRegular(o)) continue;
    whatOf.set(what.key, what);
    datesOf.set(what.key, (datesOf.get(what.key) ?? new Set<string>()).add(o.date));
  }
  const DAY = 86400000;
  // the twelve months of one timeless year, by slug; what was seen in each
  // (from any year), each with how far into its month it began (for its
  // order; before the month began, for a run that began in the one before)
  const months = new Map<string, (TempleYearEntry & { key: string; start: number })[]>(TAMIL_MONTHS.map((m) => [m.slug, []]));
  for (const [id, set] of datesOf) {
    const { observance, name, recurs, when } = whatOf.get(id)!;
    // the days that follow each other, as runs
    const runs: string[][] = [];
    for (const d of [...set].sort()) {
      const run = runs[runs.length - 1];
      if (run && Date.parse(d) - Date.parse(run[run.length - 1]) <= 2 * DAY) run.push(d);
      else runs.push([d]);
    }
    for (const run of runs) {
      // the month (in its year) that holds the most of the run's days; on a tie, the first
      const count = new Map<string, number>();
      for (const d of run) {
        const key = monthDates(tamilMonthOf(d), monthYearOf(d)).first;
        count.set(key, (count.get(key) ?? 0) + 1);
      }
      const first = [...count].reduce((a, b) => (b[1] > a[1] ? b : a))[0]; // the first day of the month it goes in
      const entries = months.get(tamilMonthOf(first))!;
      const had = entries.find((x) => x.key === id);
      if (had) had.days += run.length;
      else entries.push({ key: id, observance, name, recurs, when, days: run.length, start: Date.parse(run[0]) - Date.parse(first) });
    }
  }
  // what comes every month or every week comes in each of them: listed under
  // every month, after its festivals (in the order first seen)
  const recurringOf = (e: TempleYearEntry) => (e.recurs ?? e.observance?.recurs) !== "yearly";
  const clean = ({ key: _key, start: _start, ...entry }: TempleYearEntry & { key: string; start: number }) => entry;
  const recurring = [
    ...regularEntries,
    ...[...months.values()]
      .flat()
      .filter(recurringOf)
      .filter((e, i, all) => all.findIndex((x) => x.key === e.key) === i)
      .map(clean),
  ];
  return {
    months: TAMIL_MONTHS.map((month) => ({
      month,
      festivals: months.get(month.slug)!.filter((e) => !recurringOf(e)).sort((a, b) => a.start - b.start).map(clean),
    })),
    regular: recurring,
  };
}

/** How many temples a festival or ritual has been seen at. */
export async function countTemplesForObservance(observanceId: string): Promise<number> {
  const seen = new Set(
    (await occasions())
      .filter((o) => o.observances.includes(observanceId) && !o.townWide)
      .map((o) => `${o.region}/${o.temple}`)
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

export async function getFieldNotesForTemple(_regionId: string, templeId: string): Promise<FieldNote[]> {
  // by the temple alone: a note may be about temples in town and around it
  return (await getFieldNotes()).filter((n) => n.temples.includes(templeId));
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

/** Stand-ins until a temple's layouts are drawn: its own layouts, then the
    placeholder plan, to make a stack of one to three (how many, chosen by the
    temple, so it stays the same from one visit to the next). A temple with
    three or more of its own shows only its own. The placeholder is drawn
    north at the top for a temple facing east, its entrance at the foot
    (upright); for one facing north or south, turned, its entrance at the
    right or the left (lying down); for one facing west, turned round, its
    entrance at the top. */
const PLACEHOLDER = {
  east: { src: "/placeholders/temple-layout.svg", width: 1200, height: 1500 },
  north: { src: "/placeholders/temple-layout-north.svg", width: 1500, height: 1200 },
  south: { src: "/placeholders/temple-layout-south.svg", width: 1500, height: 1200 },
  west: { src: "/placeholders/temple-layout-west.svg", width: 1200, height: 1500 },
} as const;
export function withPlaceholderLayouts(templeId: string, regionId: RegionId, own: Illustration[], faces: Temple["faces"] = "east"): Illustration[] {
  const n = Math.max(own.length, 1 + Math.floor(seeded(`layouts-${templeId}`)() * 3));
  const stand = Array.from({ length: n - own.length }, (_, k): Illustration => ({
    id: `placeholder-${templeId}-${k + 1}`,
    ...PLACEHOLDER[faces],
    alt: "A placeholder: a generic temple plan, until this temple's layout is drawn",
    region: regionId,
    kind: "plan",
    title: "Temple layout (a placeholder until it is drawn)",
    temples: [templeId],
    observances: [],
  }));
  return [...own, ...stand];
}

/** A temple's layouts (its drawings of the plan), for the stack in the header
    of its page: in the order they are dragged into in the temple's Drawings
    tab in the admin (the first on top), then any not placed yet, oldest
    first. */
export function layoutsOf(drawings: Illustration[]): Illustration[] {
  const placed = (a?: string, b?: string) => (a === b ? 0 : a === undefined ? 1 : b === undefined ? -1 : a < b ? -1 : 1);
  return drawings
    .filter((d) => d.kind === "plan")
    .sort((a, b) => placed(a.stackOrder, b.stackOrder) || Number(a.id) - Number(b.id));
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

/** Everything on a temple's "The Temple and its Stories" page — its
    histories, the place, its people, its stories and songs — newest first. */
export async function getTempleStories(regionId: string, templeId: string): Promise<TempleEntry[]> {
  return (await templeEntries())
    .filter((e) => e.region === regionId && e.temples.includes(templeId))
    .sort(byDateDesc);
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

/** A field note's photographs: those of its photo sets (the same day, at
    its temples), and any put in the note itself; in the order taken. */
export async function getPhotosForNote(noteId: string): Promise<Photo[]> {
  return (await photoData()).byNote.get(noteId) ?? [];
}

/** The photo sets of the Town's Cultural and Spiritual Ethos in a region, newest first,
    each with its photographs, and the field notes written of it, in the
    order of their days (a card's name opens them). */
export async function getEthosSets(
  regionId: string
): Promise<{ id: string; title: string; dates: string[]; photos: Photo[]; notes: string[] }[]> {
  const L = await lookups();
  const { list, sets } = await photoData();
  // sets of the same name, one card (each kept in its own folder: "Vinayaka
  // Pandals" on the 17th and the 18th), its photographs those of all of them
  const cards = new Map<string, { id: string; title: string; dates: string[]; photos: Photo[]; notes: P.FieldNote[] }>();
  for (const { set, day, notes } of sets.values()) {
    if (!set.ethos || L.regionOf(set.region) !== regionId) continue;
    const photos = list.filter((p) => p.set === String(set.id));
    if (!photos.length) continue;
    const key = set.title.trim().toLowerCase();
    const card = cards.get(key) ?? { id: String(set.id), title: set.title, dates: [], photos: [], notes: [] };
    if (day && !card.dates.includes(day)) card.dates.push(day);
    card.photos.push(...photos);
    for (const n of notes) if (!card.notes.includes(n)) card.notes.push(n);
    cards.set(key, card);
  }
  const order = new Map(list.map((p, i) => [p.id, i]));
  return [...cards.values()]
    .map((c) => ({
      ...c,
      dates: c.dates.sort(),
      photos: c.photos.sort((a, b) => order.get(a.id)! - order.get(b.id)!),
      notes: c.notes.sort((a, b) => a.date.localeCompare(b.date)).map((n) => n.slug!),
    }))
    .sort((a, b) => (b.dates.at(-1) ?? "").localeCompare(a.dates.at(-1) ?? ""));
}


/** The notes after this one of the same event of the town (an Ethos card of
    several days, "Vinayaka Pandals" on the 17th and the 18th), in the order of
    their days: shown under it, its card opening them all. */
export async function getEventNotesAfter(slug: string): Promise<FieldNote[]> {
  const { sets } = await photoData();
  const byTitle = new Map<string, Set<string>>();
  for (const { set, notes } of sets.values()) {
    if (!set.ethos) continue;
    const key = `${set.region ?? ""}|${set.title.trim().toLowerCase()}`;
    const here = byTitle.get(key) ?? new Set<string>();
    for (const n of notes) if (n.slug) here.add(n.slug);
    byTitle.set(key, here);
  }
  const event = [...byTitle.values()].find((s) => s.has(slug) && s.size > 1);
  if (!event) return [];
  const all = (await Promise.all([...event].map((s) => getFieldNote(s)))).filter((n): n is FieldNote => n !== null);
  const self = all.find((n) => n.id === slug);
  return all.filter((n) => self && n.date > self.date).sort((a, b) => a.date.localeCompare(b.date));
}

/** Every photograph that may be shown. */
export async function getPhotos(): Promise<Photo[]> {
  return photos();
}

/** Stand-ins, for a page with no photographs of its own yet: `n` of the
    site's photographs, picked at random but always the same for `seed`. */
export async function getDummyPhotos(seed: string, n: number): Promise<Photo[]> {
  const r = seeded(seed);
  return (await photos())
    .map((p) => ({ p, k: r() }))
    .sort((a, b) => a.k - b.k)
    .slice(0, n)
    .map(({ p }) => p);
}

/** Every photograph of the festivals and rituals (any tagged with one). */
export async function getObservancePhotos(): Promise<Photo[]> {
  return (await photos()).filter((p) => p.observances.length > 0);
}

export async function getPhotosForObservance(observanceId: string): Promise<Photo[]> {
  return (await photos()).filter((p) => p.observances.includes(observanceId));
}

/** The ways a page of photographs can be narrowed, each a row of buttons:
    only the rows that offer a real choice (two options or more). */
export async function getPhotoFilters(list: Photo[], keys: PhotoFilter["key"][]): Promise<PhotoFilter[]> {
  const templeByKey = new Map((await temples()).map((t) => [`${t.region}/${t.id}`, t]));
  const observanceById = new Map((await observances()).map((o) => [o.id, o]));
  const rows: Record<
    PhotoFilter["key"],
    { label: string; of: (p: Photo) => string[]; name: (id: string) => string; short?: (id: string) => string | undefined }
  > = {
    temples: {
      label: "Temple",
      of: (p) => p.temples,
      name: (id) => templeByKey.get(id)?.knownAs ?? templeByKey.get(id)?.name ?? id,
      short: (id) => templeByKey.get(id)?.shortName,
    },
    observances: { label: "Festival/Ritual", of: (p) => p.observances, name: (id) => observanceById.get(id)?.name ?? id },
    deities: { label: "Deity", of: (p) => p.deities, name: (id) => DEITY_GROUP_LABELS[id as DeityGroup] ?? id },
    years: { label: "Year", of: (p) => [p.date.slice(0, 4)], name: (id) => id },
  };
  return keys
    .map((key) => {
      const counts = new Map<string, number>();
      for (const p of list) for (const id of rows[key].of(p)) counts.set(id, (counts.get(id) ?? 0) + 1);
      const options = [...counts]
        .map(([id, count]) => ({ id, label: rows[key].name(id), short: rows[key].short?.(id), count }))
        .sort((a, b) => (key === "years" ? b.id.localeCompare(a.id) : b.count - a.count));
      return { key, label: rows[key].label, options };
    })
    .filter((f) => f.options.length > 1);
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
    const g = await findGlobal({ slug: "section-descriptions", depth: 0, overrideAccess: true });
    return g[name]?.trim() || original;
  } catch {
    return original;
  }
}

/** Varam: what each day of the week is like (sun…sat), as written in the
    admin; a day not yet written is left out. */
export async function getVaramDays(): Promise<Record<string, string>> {
  try {
    const g = (await findGlobal({ slug: "varam", depth: 0, overrideAccess: true })) as unknown as Record<string, unknown>;
    return Object.fromEntries(
      ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
        .map((d) => [d, typeof g[d] === "string" ? (g[d] as string).trim() : ""])
        .filter(([, t]) => t)
    );
  } catch {
    return {};
  }
}

/** The home page's words, or null if not yet written. */
export async function getHomePage(): Promise<HomePageText | null> {
  const g = await findGlobal({ slug: "home-page", depth: 1, overrideAccess: true });
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
  const g = await findGlobal({ slug: "about-page", depth: 1, overrideAccess: true });
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
