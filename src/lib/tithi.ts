/* The tithis kept each month: the lunar days, reckoned as a Tamil
   panchangam reckons them, for Pondicherry. A tithi is a twelfth of the
   moon's way round from the sun (thirty in a lunar month, fifteen waxing,
   shukla paksha or valarpirai, and fifteen waning, krishna paksha or
   theipirai); it is kept on the day it holds at the hour that matters for
   it: most at sunrise; Shashti three muhurtas after it (if it lasts less,
   the day before); Vinayaka Chaturthi at madhyahna; Pradosham and Theipirai
   Ashtami at sunset; Sankatahara Chaturthi at moonrise; the month's
   Shivaratri at midnight. Checked against the Prokerala Tamil calendar
   (Chennai), February 2026 to December 2028: every day it marks, and its
   lists of dates, agree (scripts/check-tithis.ts). */

import type { TithiKey } from "@/lib/tithiNames";
import { Body, EclipticGeoMoon, Observer, SearchRiseSet, SunPosition, type AstroTime } from "astronomy-engine";

/** Each kept tithi: its number among the thirty
    (1–15 waxing, to the full moon; 16–30 waning, to the new moon), and the
    hour it is reckoned at. */
export const TITHIS: Record<TithiKey, { n: number; at: Hour }> = {
  "vinayaka-chaturthi": { n: 4, at: "madhyahna" },
  "panchami-s": { n: 5, at: "sunrise" },
  shashti: { n: 6, at: "trimuhurta" },
  "pradosham-s": { n: 13, at: "sunset" },
  pournami: { n: 15, at: "sunrise" },
  "sankatahara-chaturthi": { n: 19, at: "moonrise" },
  "panchami-k": { n: 20, at: "sunrise" },
  "ashtami-k": { n: 23, at: "sunset" },
  "pradosham-k": { n: 28, at: "sunset" },
  shivaratri: { n: 29, at: "midnight" },
  amavasya: { n: 30, at: "sunrise" },
};

/* The hours: sunrise; three muhurtas (2 hours 24 minutes) after it; the
   start of madhyahna, the middle of the day's five parts; sunset; moonrise;
   and midnight, halfway through the night. */
type Hour = "sunrise" | "trimuhurta" | "madhyahna" | "sunset" | "moonrise" | "midnight";

const PONDICHERRY = new Observer(11.934, 79.83, 0);
const DAY = 86_400_000;
const IST = 5.5 * 3_600_000;

/** The tithi at a moment: 1–30. */
export function tithiAt(t: Date | AstroTime): number {
  const gap = (((EclipticGeoMoon(t).lon - SunPosition(t).elon) % 360) + 360) % 360;
  return Math.floor(gap / 12) + 1;
}

/** The hours of a day that tithis are reckoned by, in Pondicherry. */
function hoursOf(iso: string, where: Observer) {
  const midnight = new Date(Date.parse(`${iso}T00:00:00Z`) - IST);
  const rise = SearchRiseSet(Body.Sun, where, +1, midnight, 1)!.date;
  const set = SearchRiseSet(Body.Sun, where, -1, rise, 1)!.date;
  const nextRise = SearchRiseSet(Body.Sun, where, +1, new Date(midnight.getTime() + DAY), 1)!.date;
  // the moon's first rising after the sun has set (on Sankatahara Chaturthi, a few hours into the night)
  const moonrise = SearchRiseSet(Body.Moon, where, +1, set, 1)?.date ?? set;
  return {
    sunrise: rise,
    trimuhurta: new Date(rise.getTime() + 144 * 60_000),
    madhyahna: new Date(rise.getTime() + ((set.getTime() - rise.getTime()) * 2) / 5),
    sunset: set,
    moonrise,
    midnight: new Date((set.getTime() + nextRise.getTime()) / 2),
  };
}

/** The kept tithis between two dates (ISO, inclusive): day → its tithis.
    A tithi is kept on the first day it holds at its hour. One that holds at
    that hour on no day at all (it begins and ends between two of them) is
    kept on the day it begins. */
export function tithisBetween(first: string, last: string, where: Observer = PONDICHERRY): Map<string, TithiKey[]> {
  const days: string[] = [];
  for (let t = Date.parse(`${first}T00:00:00Z`) - DAY; t <= Date.parse(`${last}T00:00:00Z`) + DAY; t += DAY)
    days.push(new Date(t).toISOString().slice(0, 10));
  const at = days.map((d) => {
    const h = hoursOf(d, where);
    return Object.fromEntries(Object.entries(h).map(([k, v]) => [k, tithiAt(v)])) as Record<Hour, number>;
  });
  const out = new Map<string, TithiKey[]>();
  const keys = Object.keys(TITHIS) as TithiKey[];
  const next = (n: number) => (n % 30) + 1;
  for (let i = 1; i < days.length - 1; i++) {
    if (days[i] < first || days[i] > last) continue;
    for (const k of keys) {
      const { n, at: hour } = TITHIS[k];
      const now = at[i][hour], before = at[i - 1][hour], after = at[i + 1][hour];
      const holds = now === n && before !== n;
      const passedOver = next(now) === n && after === next(n); // skipped between this day's hour and the next
      if (holds || passedOver) out.set(days[i], [...(out.get(days[i]) ?? []), k]);
    }
  }
  return out;
}


/* The nakshatras: the moon's place among the stars, in 27 equal parts of
   the zodiac, reckoned from the fixed stars (sidereally, with the Lahiri
   ayanamsa, as Tamil panchangams reckon it), not from the equinox. */

/** The Lahiri ayanamsa, in degrees: the equinox's drift from the stars. */
function ayanamsa(t: Date): number {
  const T = (t.getTime() - Date.UTC(2000, 0, 1, 12)) / (36525 * DAY);
  return 23.85306 + 1.39697 * T + 0.0003086 * T * T;
}

/** The nakshatra at a moment: 0–26 (Asvini to Revathi). */
export function nakshatraAt(t: Date): number {
  const lon = (((EclipticGeoMoon(t).lon - ayanamsa(t)) % 360) + 360) % 360;
  return Math.floor(lon / (360 / 27));
}

/** Each day's nakshatras between two dates (ISO, inclusive): the one at its
    sunrise, then any that begin before the next sunrise. */
export function nakshatrasBetween(first: string, last: string, where: Observer = PONDICHERRY): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  const rise = (iso: string) => SearchRiseSet(Body.Sun, where, +1, new Date(Date.parse(`${iso}T00:00:00Z`) - IST), 1)!.date;
  let next = rise(first);
  for (let t = Date.parse(`${first}T00:00:00Z`); t <= Date.parse(`${last}T00:00:00Z`); t += DAY) {
    const day = new Date(t).toISOString().slice(0, 10);
    const start = next;
    next = rise(new Date(t + DAY).toISOString().slice(0, 10));
    const from = nakshatraAt(start), to = nakshatraAt(next);
    const list = [from];
    for (let n = from; n !== to; ) list.push((n = (n + 1) % 27));
    out[day] = list;
  }
  return out;
}
