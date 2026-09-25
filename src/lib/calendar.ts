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
