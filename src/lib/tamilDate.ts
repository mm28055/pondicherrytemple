/* The Tamil solar calendar, worked out, so it never needs a new table. The
   one reckoning for the whole site: today's date, the months' first days
   (lib/calendar), the dates beside field notes.

   A Tamil month is the time the sun spends in one sidereal sign (Chithirai =
   Mesha, and so on), by the Vakya panchangam's own reckoning: a year of
   365d 15n 31v 15t, each month of its own fixed length. If the sun enters the
   sign before sunset the month begins that day, otherwise the next day (by
   Chennai's sunset). Checked against the Prokerala Tamil calendar, every month
   of 2025, 2026 and 2027 (scripts/check-tamil-months.ts). The true sun with
   the Lahiri ayanamsa, used until November 2026, began some months (Aavani
   and Purattasi 2026 among them) a day early. */

export const TAMIL_MONTHS = [
  { en: "Chithirai", ta: "சித்திரை" },
  { en: "Vaikasi", ta: "வைகாசி" },
  { en: "Aani", ta: "ஆனி" },
  { en: "Aadi", ta: "ஆடி" },
  { en: "Aavani", ta: "ஆவணி" },
  { en: "Purattasi", ta: "புரட்டாசி" },
  { en: "Aippasi", ta: "ஐப்பசி" },
  { en: "Karthikai", ta: "கார்த்திகை" },
  { en: "Margazhi", ta: "மார்கழி" },
  { en: "Thai", ta: "தை" },
  { en: "Masi", ta: "மாசி" },
  { en: "Panguni", ta: "பங்குனி" },
];

// The sixty-year cycle; Prabhava began in April 1987.
const YEAR_NAMES = [
  "Prabhava", "Vibhava", "Sukla", "Pramodhoota", "Prajotpatti", "Angirasa", "Srimukha", "Bhava",
  "Yuva", "Dhatu", "Isvara", "Bahudhanya", "Pramathi", "Vikrama", "Vishu", "Chitrabhanu",
  "Subhanu", "Tarana", "Parthiva", "Viya", "Sarvajit", "Sarvadhari", "Virodhi", "Vikruti",
  "Khara", "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukhi", "Hevilambi", "Vilambi",
  "Vikari", "Sarvari", "Plava", "Subhakrit", "Sobhakrit", "Krodhi", "Visvavasu", "Parabhava",
  "Plavanga", "Kilaka", "Saumya", "Sadharana", "Virodhikrit", "Paridhabi", "Pramadicha", "Ananda",
  "Rakshasa", "Nala", "Pingala", "Kalayukti", "Siddharthi", "Raudri", "Durmati", "Dundubhi",
  "Rudhirodgari", "Raktakshi", "Krodhana", "Akshaya",
];
// the same sixty, in Tamil
const YEAR_NAMES_TA = [
  "பிரபவ", "விபவ", "சுக்ல", "பிரமோதூத", "பிரசோற்பத்தி", "ஆங்கீரச", "ஸ்ரீமுக", "பவ",
  "யுவ", "தாது", "ஈஸ்வர", "வெகுதானிய", "பிரமாதி", "விக்கிரம", "விஷு", "சித்திரபானு",
  "சுபானு", "தாரண", "பார்த்திப", "விய", "சர்வசித்து", "சர்வதாரி", "விரோதி", "விக்ருதி",
  "கர", "நந்தன", "விஜய", "ஜய", "மன்மத", "துன்முகி", "ஹேவிளம்பி", "விளம்பி",
  "விகாரி", "சார்வரி", "பிலவ", "சுபகிருது", "சோபகிருது", "குரோதி", "விசுவாவசு", "பராபவ",
  "பிலவங்க", "கீலக", "சௌமிய", "சாதாரண", "விரோதகிருது", "பரிதாபி", "பிரமாதீச", "ஆனந்த",
  "ராட்சச", "நள", "பிங்கள", "காளயுக்தி", "சித்தார்த்தி", "ரௌத்திரி", "துன்மதி", "துந்துபி",
  "ருத்ரோத்காரி", "ரக்தாட்சி", "குரோதன", "அட்சய",
];

/** The name of the Tamil year that begins at Chithirai in a given year, in
    English and Tamil: 2026 is Parabhava, பராபவ. */
export function tamilYearName(startYear: number): { en: string; ta: string } {
  const i = (((startYear - 1987) % 60) + 60) % 60;
  return { en: YEAR_NAMES[i], ta: YEAR_NAMES_TA[i] };
}

const rad = (d: number) => (d * Math.PI) / 180;
const DAY = 86_400_000;

// the months' lengths, in days, nadis and vinadis (Vakyakarana)
const LENGTHS = [
  [30, 55, 32], [31, 24, 12], [31, 36, 38], [31, 28, 12], [31, 2, 10], [30, 27, 22],
  [29, 54, 7], [29, 30, 24], [29, 20, 53], [29, 27, 16], [29, 48, 24], [30, 20, 21],
].map(([d, n, v]) => d + n / 60 + v / 3600);
const YEAR_DAYS = 365 + 15 / 60 + 31 / 3600 + 15 / 216_000;
// the start of the Kali era, sunrise at Ujjain, less the Vakya's constant (2d 8n 51v 15t)
const KALI = 588465.75 - (2 + 8 / 60 + 51 / 3600 + 15 / 216_000);
const UJJAIN_TO_IST = (82.5 - 75.77) / 360;

/** When the sun sets in Chennai on a civil day, as a part of the day (IST);
    good to a minute or two. */
function sunset(ms: number): number {
  const n = (ms - Date.UTC(2000, 0, 1, 12)) / DAY;
  const g = rad((357.529 + 0.98560028 * n) % 360);
  const q = (280.459 + 0.98564736 * n) % 360;
  const l = rad(q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g));
  const dec = Math.asin(Math.sin(rad(23.44)) * Math.sin(l));
  const ra = Math.atan2(Math.cos(rad(23.44)) * Math.sin(l), Math.cos(l)) / rad(1);
  const slow = -((((q - ra + 180) % 360) + 360) % 360) + 180; // degrees the sun is behind the clock
  const lat = rad(13.0827);
  const h = Math.acos((Math.sin(rad(-0.833)) - Math.sin(lat) * Math.sin(dec)) / (Math.cos(lat) * Math.cos(dec)));
  return 0.5 + (82.5 - 80.2707) / 360 + slow / 360 + h / (2 * Math.PI);
}

const starts = new Map<number, number>();
/** The first day (UTC midnight, ms) of a month (0 = Chithirai) in the Tamil
    year that begins in April of a given year (Thai of 2026 is January 2027). */
function startOf(month: number, year: number): number {
  const key = year * 12 + month;
  let day = starts.get(key);
  if (day === undefined) {
    let jd = KALI + YEAR_DAYS * (year + 3101) + UJJAIN_TO_IST;
    for (let i = 0; i < month; i++) jd += LENGTHS[i];
    const enters = (jd - 2440587.5) * DAY; // the Indian clock, kept as UTC
    day = Math.floor(enters / DAY) * DAY;
    if ((enters - day) / DAY >= sunset(day)) day += DAY;
    starts.set(key, day);
  }
  return day;
}

/** The first day (ISO) of a month (0 = Chithirai) that begins in a civil
    year: Thai (9), Masi and Panguni belong to the Tamil year before. */
export function tamilMonthStart(month: number, civilYear: number): string {
  return new Date(startOf(month, month >= 9 ? civilYear - 1 : civilYear)).toISOString().slice(0, 10);
}

/** The month a civil date is in (0 = Chithirai), the Tamil year it belongs
    to (the year of its April), and the day in the month. */
export function tamilPlace(y: number, m: number, d: number): { month: number; year: number; day: number } {
  const at = Date.UTC(y, m - 1, d);
  const year = at >= startOf(0, y) ? y : y - 1;
  let month = 11;
  while (startOf(month, year) > at) month--;
  return { month, year, day: Math.round((at - startOf(month, year)) / DAY) + 1 };
}

export interface TamilDate {
  day: number;
  month: { en: string; ta: string };
  year: string;
}

/** The Tamil date for a civil date in India (year, month 1–12, day). */
export function tamilDate(y: number, m: number, d: number): TamilDate {
  const p = tamilPlace(y, m, d);
  return { day: p.day, month: TAMIL_MONTHS[p.month], year: tamilYearName(p.year).en };
}

/** Today in India, as a civil date. */
export function todayInIndia(now = Date.now()): { y: number; m: number; d: number; weekday: number } {
  const ist = new Date(now + 5.5 * 3_600_000);
  return { y: ist.getUTCFullYear(), m: ist.getUTCMonth() + 1, d: ist.getUTCDate(), weekday: ist.getUTCDay() };
}

/** Today in India, as an ISO date. */
export function todayISO(): string {
  const { y, m, d } = todayInIndia();
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
