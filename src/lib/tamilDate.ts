/* Today's date in the Tamil solar calendar, worked out from the sun, so it
   never needs a new table.

   A Tamil month is the time the sun spends in one sidereal sign (Chithirai =
   Mesha, and so on), measured with the Lahiri ayanamsa. By the usual rule, if
   the sun enters a sign before sunset the month begins that day, otherwise
   the next day. Sunset is taken as 6 pm in Pondicherry, and the sun's
   position comes from Meeus's short formula (good to about 0.01°, a quarter
   of an hour), so on the rare day a sankranti falls right at dusk the day
   number can be one out. */

export const TAMIL_MONTHS = [
  { en: "Chithirai", ta: "சித்திரை" },
  { en: "Vaikasi", ta: "வைகாசி" },
  { en: "Aani", ta: "ஆனி" },
  { en: "Aadi", ta: "ஆடி" },
  { en: "Aavani", ta: "ஆவணி" },
  { en: "Purattasi", ta: "புரட்டாசி" },
  { en: "Aippasi", ta: "ஐப்பசி" },
  { en: "Karthigai", ta: "கார்த்திகை" },
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

const rad = (d: number) => (d * Math.PI) / 180;
const DAY = 86_400_000;

/** The sun's sidereal (Lahiri) longitude, in degrees, at a moment. */
function siderealSun(ms: number): number {
  const jd = ms / DAY + 2440587.5;
  const t = (jd - 2451545) / 36525;
  const l0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
  const m = rad(357.52911 + 35999.05029 * t - 0.0001537 * t * t);
  const c =
    (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(m) +
    (0.019993 - 0.000101 * t) * Math.sin(2 * m) +
    0.000289 * Math.sin(3 * m);
  const apparent = l0 + c - 0.00569 - 0.00478 * Math.sin(rad(125.04 - 1934.136 * t));
  const ayanamsa = 23.853 + ((jd - 2451545) / 365.25) * (50.29 / 3600);
  return (((apparent - ayanamsa) % 360) + 360) % 360;
}

/** Which sign (0 = Mesha) the sun is in at 6 pm India time on a civil date. */
function signAtDusk(y: number, m: number, d: number): number {
  return Math.floor(siderealSun(Date.UTC(y, m - 1, d, 12, 30)) / 30); // 18:00 IST = 12:30 UTC
}

export interface TamilDate {
  day: number;
  month: { en: string; ta: string };
  year: string;
}

/** The Tamil date for a civil date in India (year, month 1–12, day). */
export function tamilDate(y: number, m: number, d: number): TamilDate {
  const sign = signAtDusk(y, m, d);
  let day = 1;
  // Walk back to the first day of this month
  for (let back = 1; back < 35; back++) {
    const prev = new Date(Date.UTC(y, m - 1, d - back));
    if (signAtDusk(prev.getUTCFullYear(), prev.getUTCMonth() + 1, prev.getUTCDate()) !== sign) break;
    day++;
  }
  // The year turns at Chithirai; Thai, Masi and Panguni belong to the year begun the April before
  const startYear = m <= 4 && sign >= 9 ? y - 1 : y;
  return { day, month: TAMIL_MONTHS[sign], year: YEAR_NAMES[(((startYear - 1987) % 60) + 60) % 60] };
}

/** Today in India, as a civil date. */
export function todayInIndia(now = Date.now()): { y: number; m: number; d: number; weekday: number } {
  const ist = new Date(now + 5.5 * 3_600_000);
  return { y: ist.getUTCFullYear(), m: ist.getUTCMonth() + 1, d: ist.getUTCDate(), weekday: ist.getUTCDay() };
}
