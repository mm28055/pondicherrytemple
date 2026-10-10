/* Local calendar labels. Dates are stored as ordinary ISO dates everywhere;
   a region's local month is only ever a display label, so adding a region
   with a different calendar means adding a table here — nothing else.

   Tamil solar months for 2026, by start date. Chithirai (14 Apr) and
   Vaikasi (15 May) are confirmed in the running log ("Varsha Pirappu",
   "Masam Pirappu"); the others are the usual sankranti dates and should be
   checked against a panchangam before they matter. */

import type { CalendarSystem } from "@/content/types";

const TAMIL_2026: { start: string; month: string }[] = [
  { start: "2026-02-13", month: "Masi" },
  { start: "2026-03-15", month: "Panguni" },
  { start: "2026-04-14", month: "Chithirai" },
  { start: "2026-05-15", month: "Vaikasi" },
  { start: "2026-06-15", month: "Aani" },
  { start: "2026-07-17", month: "Aadi" },
  { start: "2026-08-17", month: "Aavani" },
  { start: "2026-09-17", month: "Purattasi" },
  { start: "2026-10-17", month: "Aippasi" },
  { start: "2026-11-16", month: "Karthigai" },
  { start: "2026-12-16", month: "Margazhi" },
];

/** The local month a date falls in, or null if outside the known table. */
export function localMonth(calendar: CalendarSystem, isoDate: string): string | null {
  if (calendar !== "tamil") return null;
  let found: string | null = null;
  for (const m of TAMIL_2026) {
    if (isoDate >= m.start) found = m.month;
    else break;
  }
  // Dates before the table, or beyond a year after its last entry, get no label
  if (isoDate < TAMIL_2026[0].start || isoDate >= "2027-01-15") return null;
  return found;
}

/* The ritual year: the twelve Tamil solar months, one timeless year. Each
   begins when the sun enters a sign, on much the same day every year, so a
   date in any year can be placed in its month. `rasi` is where the month
   sits in the chart of the year (after the South Indian rasi kattam): row
   and column in a 4 × 4 square, Chithirai, the year's first month, in the
   top-left box, going round clockwise. */

export interface TamilMonth {
  slug: string;
  name: string;
  tamil: string;
  /** "mid-April to mid-May" */
  span: string;
  /** The day it usually begins, MM-DD. */
  starts: string;
  rasi: [row: number, col: number];
  /** The month's colour, taken from what it is known for: konrai gold,
      lamp flame, sugarcane green… Used for its heading and its motif. */
  colour: string;
}

export const TAMIL_MONTHS: TamilMonth[] = [
  { slug: "chithirai", name: "Chithirai", tamil: "சித்திரை", span: "mid-April to mid-May", starts: "04-14", rasi: [1, 1], colour: "#a87a0c" },
  { slug: "vaikasi", name: "Vaikasi", tamil: "வைகாசி", span: "mid-May to mid-June", starts: "05-15", rasi: [1, 2], colour: "#b5412b" },
  { slug: "aani", name: "Aani", tamil: "ஆனி", span: "mid-June to mid-July", starts: "06-15", rasi: [1, 3], colour: "#8a5a2b" },
  { slug: "aadi", name: "Aadi", tamil: "ஆடி", span: "mid-July to mid-August", starts: "07-17", rasi: [1, 4], colour: "#b3202e" },
  { slug: "aavani", name: "Aavani", tamil: "ஆவணி", span: "mid-August to mid-September", starts: "08-17", rasi: [2, 4], colour: "#9b2d3f" },
  { slug: "purattasi", name: "Purattasi", tamil: "புரட்டாசி", span: "mid-September to mid-October", starts: "09-17", rasi: [3, 4], colour: "#3b4f8c" },
  { slug: "aippasi", name: "Aippasi", tamil: "ஐப்பசி", span: "mid-October to mid-November", starts: "10-17", rasi: [4, 4], colour: "#4d6878" },
  { slug: "karthigai", name: "Karthigai", tamil: "கார்த்திகை", span: "mid-November to mid-December", starts: "11-16", rasi: [4, 3], colour: "#c0561b" },
  { slug: "margazhi", name: "Margazhi", tamil: "மார்கழி", span: "mid-December to mid-January", starts: "12-16", rasi: [4, 2], colour: "#9a4a68" },
  { slug: "thai", name: "Thai", tamil: "தை", span: "mid-January to mid-February", starts: "01-14", rasi: [4, 1], colour: "#4e7d34" },
  { slug: "masi", name: "Masi", tamil: "மாசி", span: "mid-February to mid-March", starts: "02-13", rasi: [3, 1], colour: "#1f5d7f" },
  { slug: "panguni", name: "Panguni", tamil: "பங்குனி", span: "mid-March to mid-April", starts: "03-15", rasi: [2, 1], colour: "#5f7a2e" },
];

/** The Tamil month (its slug) a date in any year falls in. */
export function tamilMonthOf(isoDate: string): string {
  const day = isoDate.slice(5, 10);
  const byStart = [...TAMIL_MONTHS].sort((a, b) => a.starts.localeCompare(b.starts));
  let found = byStart[byStart.length - 1]; // before Thai begins: still Margazhi
  for (const m of byStart) if (day >= m.starts) found = m;
  return found.slug;
}

const DAY = 86_400_000;
const toISO = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const fromISO = (iso: string) => Date.parse(`${iso}T00:00:00Z`);

/** A month's first and last day in the year it begins (Margazhi runs into
    the next January). */
export function monthDates(slug: string, startYear: number): { first: string; last: string } {
  const at = TAMIL_MONTHS.findIndex((m) => m.slug === slug);
  const m = TAMIL_MONTHS[at];
  const next = TAMIL_MONTHS[(at + 1) % 12];
  const first = `${startYear}-${m.starts}`;
  const nextYear = next.starts < m.starts ? startYear + 1 : startYear;
  return { first, last: toISO(fromISO(`${nextYear}-${next.starts}`) - DAY) };
}

/** The year in which the month containing this date began. */
export function monthYearOf(isoDate: string): number {
  const m = TAMIL_MONTHS.find((x) => x.slug === tamilMonthOf(isoDate))!;
  const year = Number(isoDate.slice(0, 4));
  return isoDate.slice(5, 10) < m.starts ? year - 1 : year;
}

/** Every day from first to last, as ISO dates. */
export function daysBetween(first: string, last: string): string[] {
  const out: string[] = [];
  for (let t = fromISO(first); t <= fromISO(last); t += DAY) out.push(toISO(t));
  return out;
}

/* Full and new moons, by Meeus's "Astronomical Algorithms" (ch. 49), to
   within a few minutes. A moon falls on the day it happens in India; a
   temple's panchangam, reckoning by the tithi at sunrise, can keep
   pournami or amavasai a day either side. */

const rad = (deg: number) => (deg * Math.PI) / 180;

function moonAt(k: number): number {
  const full = k % 1 !== 0;
  const T = k / 1236.85;
  const jde =
    2451550.09766 + 29.530588861 * k + 0.00015437 * T ** 2 - 0.00000015 * T ** 3 + 0.00000000073 * T ** 4;
  const E = 1 - 0.002516 * T - 0.0000074 * T ** 2;
  const M = rad(2.5534 + 29.1053567 * k - 0.0000014 * T ** 2);
  const Mp = rad(201.5643 + 385.81693528 * k + 0.0107582 * T ** 2 + 0.00001238 * T ** 3);
  const F = rad(160.7108 + 390.67050284 * k - 0.0016118 * T ** 2 - 0.00000227 * T ** 3);
  const O = rad(124.7746 - 1.56375588 * k + 0.0020672 * T ** 2);
  const [a, b, c, d] = full ? [-0.40614, 0.17302, 0.01614, 0.01043] : [-0.4072, 0.17241, 0.01608, 0.01039];
  const [e, f, g] = full ? [0.00734, -0.00515, 0.00209] : [0.00739, -0.00514, 0.00208];
  const correction =
    a * Math.sin(Mp) +
    b * E * Math.sin(M) +
    c * Math.sin(2 * Mp) +
    d * Math.sin(2 * F) +
    e * E * Math.sin(Mp - M) +
    f * E * Math.sin(Mp + M) +
    g * E * E * Math.sin(2 * M) -
    0.00111 * Math.sin(Mp - 2 * F) -
    0.00057 * Math.sin(Mp + 2 * F) +
    0.00056 * E * Math.sin(2 * Mp + M) -
    0.00042 * Math.sin(3 * Mp) +
    0.00042 * E * Math.sin(M + 2 * F) +
    0.00038 * E * Math.sin(M - 2 * F) -
    0.00024 * E * Math.sin(2 * Mp - M) -
    0.00017 * Math.sin(O);
  return jde + correction;
}

/** The full and new moons between two dates: ISO day (in India) → which. */
export function moonsBetween(first: string, last: string): Map<string, "full" | "new"> {
  const out = new Map<string, "full" | "new">();
  const year = Number(first.slice(0, 4)) + (Number(first.slice(5, 7)) - 1) / 12;
  const k0 = Math.floor((year - 2000) * 12.3685) - 1;
  for (let k = k0; k <= k0 + 3; k += 0.5) {
    const ms = (moonAt(k) - 2440587.5) * DAY + 5.5 * 3_600_000; // Indian time
    const day = toISO(ms);
    if (day >= first && day <= last) out.set(day, k % 1 === 0 ? "new" : "full");
  }
  return out;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "23 March 2026" — spelled out, no locale surprises between server and browser. */
export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function dateParts(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return { day: d, month: MONTHS[m - 1], shortMonth: MONTHS[m - 1].slice(0, 3), year: y };
}
