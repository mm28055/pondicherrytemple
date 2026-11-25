import { MONTHS_TA, KINDS_TA, streetTa, templeFormalTa, templeShortTa, templeTa } from "@/content/homeTa";
import { dateTa } from "./dateTa";
import { formatDays } from "./calendar";

export { dateTa };
import { occasionTa, openingTa, titleTa } from "@/content/notesTa";
import { filmTextTa } from "@/content/filmsTa";
import { said } from "@/content/saidTa";
import { TEMPLE_TA } from "@/content/templeTa";
import type { FieldNote, Film, Observance, Photo, PhotoFilter, Temple } from "@/content/types";
import { CREDITS_TA } from "@/content/hiddenTa";
import { tamilOf } from "./tamilPages";
import { tamilDate } from "./tamilDate";
import { filmTile, type FilmTile, type NoteRowData } from "./view";

/** Days together ("17, 18 செப்டம்பர் 2026"). */
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const daysTa = (days: string[]) =>
  formatDays(days).replace(/ & /g, ", ").replace(/[A-Z][a-z]+/g, (m) => MONTHS_TA[MONTHS_EN.indexOf(m)] ?? m);

/** A temple with its names and street in Tamil. */
export function tamilTemple(t: Temple): Temple {
  const name = templeTa(t.id, t.knownAs ?? t.name);
  return { ...t, knownAs: name, name: templeFormalTa(t.id) ?? name, shortName: templeShortTa(t.id, t.shortName ?? name), street: streetTa(t.id, t.street) };
}

/** A temple's name, in Tamil. */
export const nameOf = (t: Temple) => templeTa(t.id, t.knownAs ?? t.name);
export const madeByTa = (by?: string | null) => (by === "Centre for Shaiva Studies" ? "சைவ ஆய்வு மையம்" : (by ?? undefined));
/** "கார்த்திகை 6" */
export const tamilDateOf = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const t = tamilDate(y, m, d);
  return `${t.month.ta} ${t.day}`;
};

/** A film's tile, in Tamil. */
export function filmTileTa(f: Film, temples: Temple[]): FilmTile {
  const tile = filmTile(f, temples);
  const where = f.temples.map((id) => temples.find((t) => t.id === id)).filter((t) => t !== undefined);
  return {
    ...tile,
    title: titleTa(f.id, f.title),
    date: dateTa(f.date),
    where: where.map(nameOf).join(", "),
    href: tamilOf(tile.href) ?? tile.href,
    html: filmTextTa(f.id, tile.html ?? "") ?? tile.html,
    madeBy: madeByTa(f.madeBy),
  };
}

/** Photographs with what is said of them in Tamil: their temples, festivals, occasion and note. */
export function photosTa(photos: Photo[], temples: Temple[], observances: Observance[]): Photo[] {
  const names = new Map<string, string>();
  for (const o of observances) names.set(o.name, o.tamil || said(o.name));
  for (const t of temples) for (const n of [t.name, t.knownAs]) if (n) names.set(n, nameOf(t));
  const short = new Map<string, string>();
  for (const t of temples) for (const n of [t.name, t.knownAs, t.shortName]) if (n) short.set(n, templeShortTa(t.id, t.shortName ?? t.knownAs ?? t.name));
  const place = (p: string) => short.get(p) ?? p.split(/(, | and )/).map((x) => (x === " and " ? ", " : (short.get(x) ?? x))).join("");
  const memo = new Map<string, string>();
  const occasion = (o: string) => {
    if (!memo.has(o)) memo.set(o, occasionTa(o));
    return memo.get(o)!;
  };
  return photos.map((p) => ({
    ...p,
    tags: p.tags.map((t) => ({ ...t, label: names.get(t.label) ?? short.get(t.label) ?? t.label })),
    occasion: p.occasion && occasion(p.occasion),
    short: p.short && occasion(p.short),
    place: p.place && place(p.place),
    credit: p.credit && (CREDITS_TA[p.credit] ?? p.credit),
    note: p.note && { ...p.note, title: titleTa(p.note.href.replace("/field-notes/", ""), p.note.title) },
  }));
}

/** The choices of the photographs' bar, in Tamil. */
export function filtersTa(filters: PhotoFilter[], temples: Temple[], observances: Observance[]): PhotoFilter[] {
  return filters.map((f) => ({
    ...f,
    label: f.key === "temples" ? "கோயில்" : f.key === "observances" ? TEMPLE_TA.festivalFilter : f.key === "years" ? TEMPLE_TA.yearFilter : f.label,
    options: f.options.map((o) => {
      const t = f.key === "temples" ? temples.find((x) => `${x.region}/${x.id}` === o.id) : undefined;
      const ob = f.key === "observances" ? observances.find((x) => x.id === o.id) : undefined;
      return t ? { ...o, label: nameOf(t), short: templeShortTa(t.id, t.shortName ?? t.name) } : ob ? { ...o, label: ob.tamil || said(ob.name) } : o;
    }),
  }));
}

const MONTHS_SHORT = ["ஜன.", "பிப்.", "மார்ச்", "ஏப்.", "மே", "ஜூன்", "ஜூலை", "ஆக.", "செப்.", "அக்.", "நவ.", "டிச."];

/** A row of a list (a field note, film or article) in Tamil: its date,
    temples, occasion, title and, if it has them, its opening lines. `short`:
    the month shortened, for the narrow date beside a field note. */
export function rowTa(row: NoteRowData, temples: Temple[], item?: FieldNote | Film, short = false): NoteRowData {
  const tagged = (item?.temples ?? []).map((id) => temples.find((t) => t.id === id)).filter((t) => t !== undefined);
  // (the occasion only where the English row has it: not when its title says it)
  const occasion = item && "occasion" in item && row.where.split(" · ").includes(item.occasion) ? occasionTa(item.occasion) : "";
  const [y, m, d] = row.date.slice(0, 10).split("-").map(Number);
  const t = tamilDate(y, m, d);
  const line = (names: string[]) => [names.join(", "), occasion].filter(Boolean).join(" · ");
  return {
    ...row,
    kindLabel: KINDS_TA[row.kind] ?? row.kindLabel,
    shortMonth: `${(short ? MONTHS_SHORT : MONTHS_TA)[m - 1]} ${y}`,
    local: row.local && `${t.month.ta} ${t.day}`,
    where: line(tagged.map((x) => templeTa(x.id, x.knownAs ?? x.name))),
    whereShort: line(tagged.map((x) => templeShortTa(x.id, x.shortName ?? x.knownAs ?? x.name))),
    title: titleTa(row.id, row.title),
    excerpt: openingTa(row.id),
  };
}
