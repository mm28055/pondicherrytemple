/* THE ORIGINAL HAND-WRITTEN CONTENT'S SHAPES — used only by the files in
   this folder, which `npm run seed` copies into the database. The site
   itself now reads the database; its types are in src/content/types.ts.

   Content model.

   Two kinds of thing live on the site:
   - SUBJECTS: temples, and festivals & rituals ("observances").
   - CONTENT: field notes (which include interviews, videos, audio and
     photos — everything recorded in the field), articles, Abishek's
     drawings, and the short pieces on a temple page about the place itself
     ("The temple") and its people ("The people").

   Content is stored once and TAGGED with the subjects it is about. A temple
   page or a festival page is simply everything tagged with it, so nothing is
   ever linked by hand.

   Built for Pondicherry, structured for more: everything carries its
   `region`, and temple URLs are /[region]/[temple]. Festivals and rituals are
   not tied to a region — a Brahmotsavam is a Brahmotsavam everywhere — so
   their pages can later gather observations from every region.

   These types are the contract with the future backend (Payload + Neon). */

export type RegionId = "pondicherry";

/** Local calendar a region's dates are labelled in. Dates are always stored
    as ordinary ISO dates; the local month is a display label only. */
export type CalendarSystem = "tamil";

export type EditorialStatus = "awaiting-approval" | "approved";

export interface Region {
  id: RegionId;
  name: string;
  calendar: CalendarSystem;
  /** Roughly how many temples the town has — "15 of 250". */
  totalTemples: number;
  intro: string[];
}

export type DeityGroup = "shiva" | "vishnu" | "amman" | "vinayaka" | "murugan";

export interface Temple {
  /** URL slug, unique within its region: /pondicherry/chetty-koil */
  id: string;
  region: RegionId;
  name: string;
  /** What the temple is called in town, if different. */
  knownAs?: string;
  deity: string;
  group: DeityGroup;
  street?: string;
  /** Short introduction. Temples without one have no page yet. */
  intro?: string[];
  /** For a future town map; unused until every temple has one. */
  coordinates?: [lat: number, lng: number];
}

/* ---------- Festivals & rituals ---------- */

export type ObservanceKind = "festival" | "ritual";

export interface Observance {
  id: string; // URL slug: /festivals-and-rituals/brahmotsavam
  kind: ObservanceKind;
  name: string;
  /** The name in Tamil script, shown large. */
  tamil?: string;
  /** Other names it goes by, e.g. Damanotsavam for Davana utsavam. */
  alsoKnownAs?: string;
  /** A short gloss in English: "the great annual festival". */
  gloss: string;
  /** The explainer — plain questions and answers. Optional: a festival or
      ritual can have a page (where we've seen it, the notes) before its
      explainer is written. */
  about?: { q: string; a: string }[];
  editorial?: { status: EditorialStatus; note?: string };
}

/** A dated occasion the team was present for, at one temple. These build
    each temple's "year so far", and the "where we've seen it" list on each
    festival or ritual page. */
export interface Occasion {
  date: string; // ISO yyyy-mm-dd
  region: RegionId;
  temple: string;
  label: string;
  observances: string[];
  note?: string; // FieldNote id, if one was written
}

/* ---------- Content ---------- */

/** Everything recorded in the field lives under Field Notes. */
export type FieldKind = "note" | "interview" | "video" | "audio" | "photos";

export interface FieldNote {
  id: string; // URL slug, date-prefixed so it is unique
  kind: FieldKind;
  region: RegionId;
  date: string; // ISO
  temples: string[];
  observances: string[];
  /** A one-line label for the occasion, shown under the title. */
  occasion: string;
  title: string;
  authors: string[];
  /** Paragraphs, as HTML. A string starting "<h" is a subheading. */
  body: string[];
  /** For interviews, videos and recordings — played on the page. */
  media?: { type: "video" | "audio"; src: string; poster?: string; caption?: string };
  photos?: { src: string; caption?: string }[];
  editorial: {
    status: EditorialStatus;
    /** What was taken out of the running-log original, for the reviewer. */
    removed: string[];
  };
}

export interface Article {
  id: string;
  title: string;
  author: string;
  date: string;
  teaser: string;
  body: string[];
  /** Tag a temple only if the article actually discusses it. */
  temples: string[];
  observances: string[];
  editorial: { status: EditorialStatus };
}

/** An image shown on the site. Width and height are the file's pixel size,
    so the page keeps the space while the image loads. */
export interface Picture {
  src: string;
  width: number;
  height: number;
  /** What the image shows, for people who can't see it. */
  alt: string;
  caption?: string;
  /** "Drawing by Abishek P.", "Photograph: Arunaditya" */
  credit?: string;
}

/** Abishek P.'s drawings: the illustrated plan of each temple, and scenes
    that photographs cannot capture. A drawing appears at the top of every
    temple page and festival/ritual page it is tagged with; on a temple's own
    page its plan comes first, shown largest. */
export interface Illustration extends Picture {
  id: string;
  region: RegionId;
  kind: "plan" | "scene";
  title: string;
  temples: string[];
  observances: string[];
  editorial: { status: EditorialStatus };
}

/** The two sections a temple page can carry beyond its introduction:
    "The temple" (the place itself: shrines and images, the building, the
    tank, its stories) and "The people" (who keeps it going). */
export type EntryTopic = "temple" | "people";

export interface TempleEntry {
  id: string;
  region: RegionId;
  topic: EntryTopic;
  /** Every temple it concerns; it appears on each of their pages. */
  temples: string[];
  /** For people, their role: "The Bhattars", "The vahana keeper". */
  title: string;
  /** Only for someone who has agreed to be named — no consent, no name.
      `consent` records when and how it was given; it is never shown. */
  named?: { name: string; consent: string };
  /** Paragraphs, as HTML. */
  body: string[];
  picture?: Picture;
  /** Field notes it was written from (ids) — for the editors checking it;
      not shown on the site. */
  sources: string[];
  editorial: { status: EditorialStatus };
}

export interface BookPart {
  title: string;
  summary: string;
  link?: { href: string; label: string };
}

export interface Book {
  region: RegionId;
  status: string;
  byline: string;
  illustrations: string;
  parts: BookPart[];
  editorial: { status: EditorialStatus };
}
