import type { Photo } from "@/content/types";

/* A long list of photographs (the Photographs page has thousands), packed
   small for the page to carry: what photos share (their temples, festivals,
   tags, day and note: a photo set's photos share all of it) is written once,
   as a group; each photo keeps only its own, its three files' names written
   from the part they share ("DSC_1234-" + "1800x1200.jpg", "480x320.jpg",
   "960x640.jpg"), after the address all of them begin with. Unpacked in the
   browser into the same photos (unpackPhotos). */

type Group = [
  temples: number[],
  observances: number[],
  deities: number[],
  tags: [label: number, href: number][],
  date: number,
  dated: 0 | 1,
  note: [href: number, title: number] | 0,
  set: number,
  occasion: number,
  place: number,
  short: number,
];
// id, group, width, height, the files' shared start, then each one's end, alt, caption, credit, featured, focus
type Row = [number, number, number, number, number, string, string, string, number, number, number, 0 | 1, number?, number?];

export type PhotoPack = { base: string; words: string[]; groups: Group[]; photos: Row[] };

const commonStart = (xs: string[]) => {
  let n = 0;
  while (xs.every((x) => n < x.length && x[n] === xs[0][n])) n++;
  return xs[0].slice(0, n);
};

export function packPhotos(list: Photo[]): PhotoPack {
  const words: string[] = [];
  const index = new Map<string, number>();
  const w = (s: string | undefined) => {
    if (s === undefined) return -1;
    if (!index.has(s)) index.set(s, words.push(s) - 1);
    return index.get(s)!;
  };
  const files = list.flatMap((p) => [p.src, p.small, p.medium]);
  // the address they all begin with, up to its last "/"
  const start = files.length ? commonStart(files) : "";
  const base = start.slice(0, start.lastIndexOf("/") + 1);
  const groups: Group[] = [];
  const groupOf = new Map<string, number>();
  const photos = list.map((p): Row => {
    const g: Group = [
      p.temples.map(w),
      p.observances.map(w),
      p.deities.map(w),
      p.tags.map((t) => [w(t.label), w(t.href)]),
      w(p.date),
      p.dated ? 1 : 0,
      p.note ? [w(p.note.href), w(p.note.title)] : 0,
      w(p.set),
      w(p.occasion),
      w(p.place),
      w(p.short),
    ];
    const key = JSON.stringify(g);
    if (!groupOf.has(key)) groupOf.set(key, groups.push(g) - 1);
    const [src, small, medium] = [p.src, p.small, p.medium].map((f) => f.slice(base.length));
    const shared = commonStart([src, small, medium]);
    const row: Row = [
      Number(p.id),
      groupOf.get(key)!,
      p.width,
      p.height,
      w(shared),
      src.slice(shared.length),
      small.slice(shared.length),
      medium.slice(shared.length),
      w(p.alt || undefined),
      w(p.caption),
      w(p.credit),
      p.featured ? 1 : 0,
    ];
    if (p.focus[0] !== 50 || p.focus[1] !== 50) row.push(p.focus[0], p.focus[1]);
    return row;
  });
  return { base, words, groups, photos };
}

export function unpackPhotos({ base, words, groups, photos }: PhotoPack): Photo[] {
  const w = (i: number) => (i < 0 ? undefined : words[i]);
  return photos.map(([id, g, width, height, shared, src, small, medium, alt, caption, credit, featured, fx, fy]) => {
    const [temples, observances, deities, tags, date, dated, note, set, occasion, place, short] = groups[g];
    const start = base + (w(shared) ?? "");
    return {
      id: String(id),
      src: start + src,
      small: start + small,
      medium: start + medium,
      width,
      height,
      alt: w(alt) ?? "",
      caption: w(caption),
      credit: w(credit),
      focus: [fx ?? 50, fy ?? 50],
      temples: temples.map((i) => words[i]),
      observances: observances.map((i) => words[i]),
      deities: deities.map((i) => words[i]),
      tags: tags.map(([label, href]) => ({ label: words[label], href: w(href) })),
      date: words[date],
      dated: dated === 1,
      featured: featured === 1,
      note: note ? { href: words[note[0]], title: words[note[1]] } : undefined,
      set: w(set),
      occasion: w(occasion),
      place: w(place),
      short: w(short),
    };
  });
}

/** The day or event a photograph is of: its set's, as named on the day at
    its temples, so two sets of one day, temple and name (a morning's and an
    evening's folder of one occasion) are one event, under one heading; else
    its day's. */
export const eventOf = (p: Photo) =>
  `${p.dated ? p.date : ""}|${p.set ? `${p.place ?? ""}|${(p.occasion ?? p.set).trim().toLowerCase()}` : ""}`;

/** How many photographs the strips of the home and Field Notes pages go
    through: one from each of the latest events. */
export const STRIP_PHOTOS = 200;

/** One photograph from each of the latest days or events of a list in order,
    newest first (a set's, or a day's), chosen at random among its own, up to
    `n`: so a strip or row shows that many events, not one event's many
    photographs alike. With fewer than `n` events, a second from each in
    turn, then a third, and so on, so a row with few events is still full.
    Chosen afresh each time the page is built. */
export function onePerEvent(list: Photo[], n: number): Photo[] {
  const events: Photo[][] = [];
  for (const p of list) {
    const last = events.at(-1);
    if (last && eventOf(last[0]) === eventOf(p)) last.push(p);
    else if (events.length === n) break;
    else events.push([p]);
  }
  // each event's photographs in a random order, then one from each, round by round
  const shuffled = events.map((e) => [...e].sort(() => Math.random() - 0.5));
  const chosen = new Set<Photo>();
  for (let round = 0; chosen.size < n && shuffled.some((e) => e.length > round); round++)
    for (const e of shuffled) if (e[round] && chosen.size < n) chosen.add(e[round]);
  // in the list's order, newest first
  return list.filter((p) => chosen.has(p));
}

/** The first few photographs a "lead" wall shows (those marked "Show first"
    first), so a page carries only those, not all of them. */
export const leadPhotos = (list: Photo[], n = 6) => [...list.filter((p) => p.featured), ...list.filter((p) => !p.featured)].slice(0, n);

/** The latest day or event of a list in order, newest first (a temple's):
    its photographs, those marked "Show first" first, and what to head them
    with, its date and occasion. With fewer than `n`, the event before it
    too, so the large-photo layout is kept full. */
export function latestEvent(list: Photo[], n = 6) {
  const events: Photo[][] = [];
  for (const p of list) {
    const last = events[events.length - 1];
    if (last && eventOf(last[0]) === eventOf(p)) last.push(p);
    else if (events.length === 2) break;
    else events.push([p]);
  }
  const shown = events[0] && events[0].length < n && events[1] ? events.slice(0, 2) : events.slice(0, 1);
  return {
    photos: shown.flatMap((e) => leadPhotos(e, n)).slice(0, n),
    heads: shown.map(([p]) => ({ date: p.dated ? p.date : undefined, occasion: p.occasion })),
  };
}

/** A count of photographs, the same wherever one is given: exact to 999,
    then 1.2K, 12K. */
export function photoCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10000) return `${(Math.floor(n / 100) / 10).toFixed(1).replace(/\.0$/, "")}K`;
  return `${Math.floor(n / 1000)}K`;
}
