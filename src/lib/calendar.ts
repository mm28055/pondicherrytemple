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
   sits in the South Indian chart (the rasi kattam): row and column in a
   4 × 4 square, Meenam top-left, going round clockwise. */

export interface TamilMonth {
  slug: string;
  name: string;
  tamil: string;
  /** "mid-April to mid-May" */
  span: string;
  /** The day it usually begins, MM-DD. */
  starts: string;
  rasi: [row: number, col: number];
}

export const TAMIL_MONTHS: TamilMonth[] = [
  { slug: "chithirai", name: "Chithirai", tamil: "சித்திரை", span: "mid-April to mid-May", starts: "04-14", rasi: [1, 2] },
  { slug: "vaikasi", name: "Vaikasi", tamil: "வைகாசி", span: "mid-May to mid-June", starts: "05-15", rasi: [1, 3] },
  { slug: "aani", name: "Aani", tamil: "ஆனி", span: "mid-June to mid-July", starts: "06-15", rasi: [1, 4] },
  { slug: "aadi", name: "Aadi", tamil: "ஆடி", span: "mid-July to mid-August", starts: "07-17", rasi: [2, 4] },
  { slug: "aavani", name: "Aavani", tamil: "ஆவணி", span: "mid-August to mid-September", starts: "08-17", rasi: [3, 4] },
  { slug: "purattasi", name: "Purattasi", tamil: "புரட்டாசி", span: "mid-September to mid-October", starts: "09-17", rasi: [4, 4] },
  { slug: "aippasi", name: "Aippasi", tamil: "ஐப்பசி", span: "mid-October to mid-November", starts: "10-17", rasi: [4, 3] },
  { slug: "karthigai", name: "Karthigai", tamil: "கார்த்திகை", span: "mid-November to mid-December", starts: "11-16", rasi: [4, 2] },
  { slug: "margazhi", name: "Margazhi", tamil: "மார்கழி", span: "mid-December to mid-January", starts: "12-16", rasi: [4, 1] },
  { slug: "thai", name: "Thai", tamil: "தை", span: "mid-January to mid-February", starts: "01-14", rasi: [3, 1] },
  { slug: "masi", name: "Masi", tamil: "மாசி", span: "mid-February to mid-March", starts: "02-13", rasi: [2, 1] },
  { slug: "panguni", name: "Panguni", tamil: "பங்குனி", span: "mid-March to mid-April", starts: "03-15", rasi: [1, 1] },
];

/** The Tamil month (its slug) a date in any year falls in. */
export function tamilMonthOf(isoDate: string): string {
  const day = isoDate.slice(5, 10);
  const byStart = [...TAMIL_MONTHS].sort((a, b) => a.starts.localeCompare(b.starts));
  let found = byStart[byStart.length - 1]; // before Thai begins: still Margazhi
  for (const m of byStart) if (day >= m.starts) found = m;
  return found.slug;
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
