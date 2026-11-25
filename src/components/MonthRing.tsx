import Link from "next/link";
import type { CSSProperties } from "react";
import { MonthMotif } from "@/components/MonthMotif";

export type RingMonth = { slug: string; name: string; colour: string; href: string | null; now: boolean };

/** On a phone, the Calendar's twelve months as a circle: equal slices, each
    in its month's tint, Chithirai at the top, going clockwise; white lines
    between them; the month we are in dark. Each opens its page (a month
    before the documentation began does not). Today is
    in the middle. (On a computer: the chart, components/RitualYear.) */
const C = 190; // the drawing is 380 × 380, the circle's centre in its middle
const OUTER = 188;
const INNER = 90;

const at = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return [C + r * Math.sin(a), C - r * Math.cos(a)].map((v) => v.toFixed(2)).join(" ");
};
const slice = (deg: number) =>
  `M${at(deg - 15, OUTER)} A${OUTER} ${OUTER} 0 0 1 ${at(deg + 15, OUTER)} L${at(deg + 15, INNER)} A${INNER} ${INNER} 0 0 0 ${at(deg - 15, INNER)} Z`;

/* Each drawing as it stands still, without the room for its movement, so
   that it is centred by what is seen. */
const FRAMES: Record<string, string> = {
  chithirai: "16.7 7.1 65.3 91.2",
  vaikasi: "38.9 4.7 22.1 91.6",
  aani: "6.7 11.3 86.6 78",
  aadi: "6 11 88 64.1",
  aavani: "12.7 10.7 74.6 82.6",
  purattasi: "29.5 11.5 41 83.8",
  aippasi: "12.8 17.1 73.2 68.2",
  karthigai: "6.7 30.7 92.6 60.6",
  margazhi: "12.7 12.7 74.6 74.6",
  thai: "20.5 1 79.5 95.3",
  masi: "6.7 12.7 84.6 82.6",
  panguni: "4.7 18.7 90.6 45.1",
};

/* Where each slice's drawing and name stand, from the circle's centre: the
   drawing's middle on the line down the middle of its slice (as near as the
   names' clear room allows), the name under it. The same for a slice and
   its mirror image, left and right. */
const SPOTS = [
  { x: 0, y: -158, nameX: 0 }, // Chithirai
  { x: 74, y: -134, nameX: 71 }, // Vaikasi, Panguni
  { x: 131, y: -79, nameX: 130 }, // Aani, Masi
  { x: 141, y: -6.5, nameX: 141 }, // Aadi, Thai
  { x: 130, y: 68, nameX: 130 }, // Aavani, Margazhi
  { x: 72, y: 121, nameX: 74 }, // Purattasi, Karthikai
  { x: 0, y: 139, nameX: 0 }, // Aippasi
];
const WIDE = 36; // the room for a drawing
const HIGH = 32;
const GAP = 5; // between the drawing and the name
const CAPS = 8; // the name's capitals

const place = (x: number, y: number) => ({
  left: `${(((C + x) / 380) * 100).toFixed(2)}%`,
  top: `${(((C + y) / 380) * 100).toFixed(2)}%`,
});
const spots = (slug: string, i: number) => {
  const [, , w, h] = FRAMES[slug].split(" ").map(Number);
  const high = Math.min(HIGH, (WIDE * h) / w); // the drawing's own height
  const apart = high / 2 + GAP + CAPS / 2;
  const { x, y, nameX } = SPOTS[i <= 6 ? i : 12 - i];
  const side = i <= 6 ? 1 : -1;
  return { drawing: place(x * side, y), name: place(nameX * side, y + apart) };
};

export function MonthRing({
  months,
  today,
  year,
}: {
  months: RingMonth[];
  /** in the year we are in: today */
  today: { ta: string; en: string; date: string } | null;
  /** in another year: the year, in the middle */
  year: { label: string; ta: string; en: string };
}) {
  return (
    <div className="ring">
      <svg className="ring-slices" viewBox="0 0 380 380">
        {months.map((m, i) => {
          const path = (
            <path
              d={slice(i * 30)}
              className={`ring-slice${m.now ? " now" : ""}${m.href ? "" : " before"}`}
              style={{ "--m": m.colour } as CSSProperties}
            />
          );
          return m.href ? (
            <Link key={m.slug} href={m.href} aria-label={m.name}>
              {path}
            </Link>
          ) : (
            <g key={m.slug}>{path}</g>
          );
        })}
        {/* the white lines, all of one width */}
        <g className="ring-lines">
          {months.map((m, i) => (
            <path key={m.slug} d={`M${at(i * 30 + 15, INNER)} L${at(i * 30 + 15, OUTER + 1)}`} />
          ))}
          <circle cx={C} cy={C} r={INNER} />
        </g>
      </svg>
      {months.map((m, i) => {
        const spot = spots(m.slug, i);
        return (
          <div
            key={m.slug}
            className={`ring-month${m.now ? " now" : ""}${m.href ? "" : " before"}`}
            style={{ "--m": m.colour } as CSSProperties}
            aria-hidden="true"
          >
            <span className="ring-drawing" style={spot.drawing}>
              <MonthMotif month={m.slug} frame={FRAMES[m.slug]} />
            </span>
            <span className="ring-name" style={spot.name}>
              {m.name}
            </span>
          </div>
        );
      })}
      <div className="ring-centre">
        <span className="ring-ta" lang="ta">
          {today ? today.ta : year.ta}
        </span>
        <span className="caps" lang="en">
          {today ? today.en : year.en}
        </span>
        <span className="ring-date">{today ? today.date : year.label}</span>
      </div>
    </div>
  );
}
