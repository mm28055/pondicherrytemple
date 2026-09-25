/* Content model — the shapes the site's pages work with.

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

   Everything is written in the admin (/admin) and stored in the database;
   src/lib/data.ts turns what is stored into these shapes. Ids here are the
   web addresses ("chetty-kovil"), and every "…HTML" field is the finished
   text from the editor. */

export type RegionId = string;

/** Local calendar a region's dates are labelled in. Dates are always stored
    as ordinary dates; the local month is a display label only. */
export type CalendarSystem = "tamil";

export interface Region {
  id: RegionId;
  name: string;
  calendar: CalendarSystem;
  /** Roughly how many temples the town has — "15 of 250". */
  totalTemples: number;
  intro: string; // HTML
  introText: string;
}

export type DeityGroup = "shiva" | "vishnu" | "amman" | "vinayaka" | "murugan";

export interface Temple {
  /** Web address, unique within its region: /pondicherry/chetty-kovil */
  id: string;
  region: RegionId;
  name: string;
  /** What the temple is called in town, if different. */
  knownAs?: string;
  deity: string;
  group: DeityGroup;
  street?: string;
  /** Short introduction (HTML). Temples without one have no page yet. */
  intro?: string;
  introText?: string;
  /** For a future town map; unused until every temple has one. */
  coordinates?: [lat: number, lng: number];
}

/* ---------- Festivals & rituals ---------- */

export type ObservanceKind = "festival" | "ritual";

export interface Observance {
  id: string; // web address: /festivals-and-rituals/brahmotsavam
  kind: ObservanceKind;
  name: string;
  /** The name in Tamil script, shown large. */
  tamil?: string;
  /** Other names it goes by, e.g. Damanotsavam for Davana utsavam. */
  alsoKnownAs?: string;
  /** A short gloss in English: "the great annual festival". */
  gloss: string;
  /** The explanation, as questions and answers (answers in HTML). */
  about?: { q: string; a: string }[];
}

/** A dated occasion the team was present for, at one temple. These build
    each temple's "year so far", and the "where we've seen it" list on each
    festival or ritual page. */
export interface Occasion {
  date: string; // yyyy-mm-dd
  region: RegionId;
  temple: string;
  label: string;
  observances: string[];
  note?: string; // the field note written about it, if any
}

/* ---------- Content ---------- */

/** Everything recorded in the field lives under Field Notes. */
export type FieldKind = "note" | "interview" | "video" | "audio" | "photos";

export interface FieldNote {
  id: string;
  kind: FieldKind;
  region: RegionId;
  date: string; // yyyy-mm-dd
  temples: string[];
  observances: string[];
  /** A one-line label for the occasion, shown under the title. */
  occasion: string;
  title: string;
  authors: string[];
  /** The opening words, for lists. */
  excerpt: string;
  /** The full text (HTML) — loaded only for the note's own page. */
  body?: string;
  /** Videos and audio recordings, played on the page. */
  videos?: FieldVideo[];
  photos?: Picture[];
}

/** A video or audio recording, with the still shown before it plays. */
export interface FieldVideo {
  type: "video" | "audio";
  src: string;
  poster?: string;
  caption?: string;
}

/** A finished short film — such as the Centre's Instagram reels. Unlike a
    field note's raw recordings, it is made to be watched on its own. */
export interface Film {
  id: string;
  region: RegionId;
  date: string; // yyyy-mm-dd
  temples: string[];
  observances: string[];
  title: string;
  madeBy?: string;
  /** The opening words of its text, for lists. */
  excerpt: string;
  /** The full text (HTML), shown beside the film. */
  body?: string;
  video: FieldVideo;
  /** The original Instagram post, if it came from there. */
  instagram?: string;
}

export interface Article {
  id: string;
  title: string;
  author: string;
  date: string;
  teaser: string;
  /** The full text (HTML) — loaded only for the article's own page. */
  body?: string;
  /** Tag a temple only if the article actually discusses it. */
  temples: string[];
  observances: string[];
}

/** An image shown on the site. Width and height are its size in pixels,
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
  /** Only for someone who has agreed to be named. */
  named?: { name: string };
  body: string; // HTML
  picture?: Picture;
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
}

/* ---------- Single pages, written in the admin (Settings) ---------- */

export interface HomePageText {
  headline: string;
  opening: string; // HTML
  quoteLabel?: string;
  quote?: string;
  quoteBy?: string;
  quoteAfter?: string;
  quoteLink?: { text: string; href: string };
  bookHeading?: string;
  bookText?: string;
}

export interface AboutPageText {
  lede: string;
  sections: { heading: string; anchor?: string; body: string /* HTML */ }[];
  team: { name: string; role?: string; bio?: string }[];
  contactText?: string;
  contactEmail?: string;
}
