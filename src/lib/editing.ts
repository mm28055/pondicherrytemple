/* Admin2: the site itself, editable (decided 20 November 2026).

   Signing in at /admin2 turns on the admin's preview (drafts shown, every
   page read fresh from the database) and marks this browser as editing
   (the EDIT_COOKIE). Pages then show their texts as editable boxes
   (components/edit); a double-click opens one, Save writes it through
   /next/edit into the same entries the admin (/admin) edits — one database,
   so each sees the other's changes at once.

   Only for what is allowed to be edited here (EDITABLE); the visitor never
   sees any of it: without preview on, nothing here even reads the cookie,
   so pages stay built ahead as before. */

import config from "@payload-config";
import { cookies, draftMode } from "next/headers";
import { getPayload } from "payload";
import { editHTML, type RichText } from "./richtext";

export const EDIT_COOKIE = "sthalam-edit";

/** What a box holds: a line, several lines (a box of the admin's that keeps
    its line breaks), or text written in the admin's editor. */
export type EditKind = "text" | "long" | "rich" | "number" | "add-ids" | "date";

/** What can be edited on the page, by collection: each field (a path into
    a list, "ritualDay.2.time", for a field of one of its rows) and its kind. */
export const EDITABLE: Record<string, [RegExp, EditKind][]> = {
  temples: [
    [/^(knownAs|name|street|dayStandard|dayNotesHeading)$/, "text"],
    [/^(dayIntro|dayNotes)$/, "long"],
    [/^ritualDay\.\d+\.(kalam|tamil|time)$/, "text"],
    [/^ritualDay\.\d+\.(timingNote|whatHappens|naivedyam)$/, "long"],
    [/^intro$/, "rich"],
    // a festival's length here (From the ritual calendar): a row's days, or a
    // new row for a festival with none ("festivalLengths.new.<festival>.<month or any>")
    [/^festivalLengths\.(\d+\.days|new\.\d+\.[a-z]+)$/, "number"],
  ],
  // a photo's own details, from the photo viewer
  media: [
    [/^(caption|credit)$/, "text"],
    [/^description$/, "long"],
    [/^takenOn$/, "date"],
  ],
  // the site's own pages (single entries in /admin: Site pages), as "global:<its name>"
  "global:home-page": [
    [/^(headline|quoteLabel|quoteBy|quoteLinkText|quoteLink|bookHeading|bookText)$/, "text"],
    [/^(quote|quoteAfter)$/, "long"],
    [/^opening$/, "rich"],
  ],
  "global:about-page": [
    [/^(sections\.\d+\.heading|team\.\d+\.(name|role))$/, "text"],
    [/^(lede|contactText|team\.\d+\.bio)$/, "long"],
    [/^sections\.\d+\.body$/, "rich"],
  ],
  "global:section-descriptions": [[/^(observances|fieldNotes|films|articles|books)$/, "long"]],
  // a festival's or ritual's page: its names and few words (its names also in Ritual Cycles, above)
  // a day: its line below the festival's name in the Ritual Year
  occasions: [[/^yearNote$/, "text"]],
  "field-notes": [
    [/^(title|occasion)$/, "text"],
    [/^body$/, "rich"],
    // photos added in Admin2 to a note with no photo set: put in its Photographs
    [/^photos\.add$/, "add-ids"],
  ],
  // a festival's or ritual's names, wherever they are shown
  observances: [[/^(name|tamil|alsoKnownAs|gloss)$/, "text"]],
  // a regular ritual's names: for every temple, or at one temple only
  "weekly-rituals": [
    [/^(what|tamil)$/, "text"],
    [/^atTemples\.\d+\.(name|tamil)$/, "text"],
    [/^atTemples\.\d+\.times\.\d+\.(on|time|details)$/, "text"],
    [/^(about|atTemples\.\d+\.about)$/, "long"],
  ],
};

export const editKind = (collection: string, field: string): EditKind | undefined =>
  EDITABLE[collection]?.find(([path]) => path.test(field))?.[1];

/** True while this browser is in Admin2. */
export async function isEditing(): Promise<boolean> {
  try {
    if (!(await draftMode()).isEnabled) return false;
    return (await cookies()).get(EDIT_COOKIE)?.value === "1";
  } catch {
    return false; // outside a request, e.g. while listing pages to build
  }
}

/** An entry's latest text (its draft, if it has one), for an editable box. */
export async function getEditable(collection: "temples" | "field-notes" | "observances", slug: string) {
  const payload = await getPayload({ config });
  const found = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    draft: true,
    depth: 1,
    limit: 1,
    overrideAccess: true,
  });
  const doc = found.docs[0] as unknown as Record<string, unknown> | undefined;
  if (!doc) return null;
  return {
    id: doc.id as number,
    status: (doc._status as string | undefined) ?? "published",
    text: (field: string) => (typeof doc[field] === "string" ? (doc[field] as string) : ""),
    rich: (field: string) => editHTML(doc[field] as RichText),
    /** the entries a field links to, by number (a note's temples, its festivals) */
    refs: (field: string) =>
      (Array.isArray(doc[field]) ? (doc[field] as unknown[]) : [])
        .map((r) => (r && typeof r === "object" ? (r as { id: number }).id : r))
        .filter((x): x is number => typeof x === "number"),
  };
}

/** One of the site's own pages (Home, About, Section descriptions), for
    its editable boxes: each field by its path ("sections.2.body"). */
export async function getEditableGlobal(slug: "home-page" | "about-page" | "section-descriptions") {
  const payload = await getPayload({ config });
  const doc = (await payload.findGlobal({ slug, depth: 1, overrideAccess: true })) as unknown as Record<string, unknown>;
  const at = (path: string) => path.split(".").reduce<unknown>((v, k) => (v && typeof v === "object" ? (v as Record<string, unknown>)[k] : undefined), doc);
  return {
    collection: `global:${slug}`,
    id: slug,
    text: (path: string) => {
      const v = at(path);
      return typeof v === "string" ? v : "";
    },
    rich: (path: string) => editHTML(at(path) as RichText),
  };
}

/** For a temple's Ritual Cycles in Admin2: where each name shown comes
    from. Festivals and rituals by their web address (their entry's number);
    regular rituals by their entry, with the row for this temple and whether
    that row gives a name or Tamil of its own here. */
export type YearEdit = {
  temple: number;
  observances: Record<string, number>;
  /** the temple's festival lengths: each row's festival, its month if only for one, and its place */
  lengths: { row: number; festival: number; month?: string }[];
  rituals: Record<
    string,
    { row: number; name: boolean; tamil: boolean; about: boolean; times: { on: string; time: string; details: string }[] }
  >;
};

export async function getYearEdit(templeId: number): Promise<YearEdit> {
  const payload = await getPayload({ config });
  const [obs, rituals, temple] = await Promise.all([
    payload.find({ collection: "observances", draft: true, depth: 0, limit: 0, overrideAccess: true, select: { slug: true } }),
    payload.find({
      collection: "weekly-rituals",
      depth: 0,
      limit: 0,
      overrideAccess: true,
      where: { "atTemples.temple": { equals: templeId } },
    }),
    payload.findByID({ collection: "temples", id: templeId, draft: true, depth: 0, overrideAccess: true }),
  ]);
  const idOf = (v: unknown) => (v && typeof v === "object" ? (v as { id: number }).id : (v as number));
  return {
    temple: templeId,
    lengths: (temple.festivalLengths ?? []).map((r, row) => ({ row, festival: idOf(r.festival), month: r.month ?? undefined })),
    observances: Object.fromEntries(obs.docs.flatMap((o) => (o.slug ? [[o.slug, o.id]] : []))),
    rituals: Object.fromEntries(
      rituals.docs.flatMap((r) => {
        const row = (r.atTemples ?? []).findIndex((at) => idOf(at.temple) === templeId);
        if (row < 0) return [];
        const at = r.atTemples![row];
        const t = (v: string | null | undefined) => v?.trim() ?? "";
        return [
          [
            String(r.id),
            {
              row,
              name: Boolean(t(at.name)),
              tamil: Boolean(t(at.tamil)),
              about: Boolean(t(at.about)),
              // its times here, as the page has them, to find which one a line is
              times: (at.times ?? []).map((x) => ({ on: t(x.on), time: t(x.time), details: t(x.details) })),
            },
          ],
        ];
      }),
    ),
  };
}
