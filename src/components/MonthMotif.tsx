import type { ReactNode } from "react";

/* A small line drawing for each Tamil month, of what the month is known
   for. Drawn in the month's colour (the `color` of whatever holds it).
   Placeholders in spirit: Abishek may one day draw them properly. */

const pt = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy - r * Math.sin(a)).toFixed(1)}`;
};

// Chithirai: konrai, the golden shower tree, in flower for the new year
const flower = (x: number, y: number, r: number) =>
  Array.from({ length: 5 }, (_, k) => 90 + k * 72)
    .map((a) => `M${x} ${y} Q${pt(x, y, r * 0.95, a - 38)} ${pt(x, y, r, a)} Q${pt(x, y, r * 0.95, a + 38)} ${x} ${y}`)
    .join(" ");
const konrai = (
  <>
    <path d="M50 4 C50 30 47 44 49 60 C50 72 51 82 50 92" />
    {[
      [50, 4, 36, 14, 10],
      [49, 26, 64, 30, 9.5],
      [48, 42, 34, 46, 9],
      [49, 58, 63, 62, 8],
      [50, 71, 38, 75, 7],
      [51, 82, 60, 86, 5.5],
    ].map(([sx, sy, x, y, r]) => (
      <g key={`${x}-${y}`}>
        <path d={`M${sx} ${sy} Q${(sx + x) / 2} ${sy - 2} ${x} ${y}`} />
        <path d={flower(x, y, r)} strokeWidth={1.8} />
      </g>
    ))}
    <circle cx={50} cy={94} r={2} className="fill" />
  </>
);

// Vaikasi: Murugan's vel, for Vaikasi Visakam
const vel = (
  <>
    <path d="M50 6 C62 22 64 38 50 54 C36 38 38 22 50 6 Z" />
    <path d="M50 18 L50 44" />
    <path d="M50 54 L50 95 M43 59 L57 59 M44 64 L56 64" />
  </>
);

// Aani: the ring of fire around Nataraja, and his drum, for Aani Thirumanjanam
const prabha = (
  <>
    <path d={`M${pt(50, 54, 30, -20)} A30 30 0 1 0 ${pt(50, 54, 30, 200)}`} />
    {Array.from({ length: 12 }, (_, i) => -20 + i * 20).map((a) => (
      <path
        key={a}
        d={`M${pt(50, 54, 31, a - 5)} Q${pt(50, 54, 37, a - 2)} ${pt(50, 54, 42, a)} Q${pt(50, 54, 37, a + 2)} ${pt(50, 54, 31, a + 5)}`}
      />
    ))}
    <path d="M42 44 L58 44 L42 64 L58 64 Z" />
    <path d="M16 88 L84 88" />
  </>
);

// Aadi: a lamp floating on the river in flood, for Aadi Perukku
const river = (
  <>
    <path d="M50 44 C44 36 47 28 50 20 C53 28 56 36 50 44 Z" />
    <path d="M33 50 L67 50 Q59 60 50 60 Q41 60 33 50 Z" />
    <path d="M8 64 Q18 56 28 64 T48 64 T68 64 T88 64" />
    <path d="M8 76 Q18 68 28 76 T48 76 T68 76 T88 76" />
    <path d="M8 88 Q18 80 28 88 T48 88 T68 88 T88 88" />
  </>
);

// Aavani: the kozhukattai made for Vinayaka Chaturthi
const kozhukattai = (
  <>
    <path d="M26 78 Q24 56 38 40 Q46 30 50 12 Q54 30 62 40 Q76 56 74 78 Q50 88 26 78 Z" />
    <path d="M50 12 Q42 40 36 80 M50 12 L50 84 M50 12 Q58 40 64 80" />
    <path d="M14 86 Q50 98 86 86" />
  </>
);

// Purattasi: Perumal's namam, for the Saturdays of Purattasi
const namam = (
  <>
    <path d="M32 14 L32 58 Q32 84 50 84 Q68 84 68 58 L68 14" strokeWidth={5} />
    <path d="M50 20 L50 72" strokeWidth={5} />
    <path d="M38 94 L62 94" />
  </>
);

// Aippasi: the first rains of the north-east monsoon
const rain = (
  <>
    <path d="M22 46 C11 46 11 30 25 31 C27 17 45 15 50 24 C56 14 76 18 74 32 C87 32 88 46 78 46 Z" />
    <path d="M28 56 L24 66 M42 56 L38 66 M56 56 L52 66 M70 56 L66 66 M35 74 L31 84 M49 74 L45 84 M63 74 L59 84" />
  </>
);

// Karthigai: the lamps of Karthigai Deepam
const lamp = (cx: number, cy: number) => (
  <g key={cx}>
    <path
      d={`M${cx} ${cy - 5} C${cx - 5} ${cy - 11} ${cx - 2} ${cy - 17} ${cx} ${cy - 24} C${cx + 2} ${cy - 17} ${cx + 5} ${cy - 11} ${cx} ${cy - 5} Z`}
    />
    <path
      d={`M${cx - 12} ${cy} L${cx + 14} ${cy} L${cx + 18} ${cy - 4} M${cx + 14} ${cy} Q${cx + 8} ${cy + 10} ${cx} ${cy + 10} Q${cx - 8} ${cy + 10} ${cx - 12} ${cy} Z`}
    />
  </g>
);
const lamps = (
  <>
    {lamp(20, 72)}
    {lamp(50, 56)}
    {lamp(80, 72)}
    <path d="M8 90 L92 90" />
  </>
);

// Margazhi: the kolam drawn at dawn, loops round a grid of dots
const kolam = (
  <>
    {[30, 50, 70].flatMap((x) =>
      [30, 50, 70].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r={2.2} className="fill" />),
    )}
    <path d="M50 50 C38 38 39 14 50 14 C61 14 62 38 50 50 C62 38 86 39 86 50 C86 61 62 62 50 50 C62 62 61 86 50 86 C39 86 38 62 50 50 C38 62 14 61 14 50 C14 39 38 38 50 50 Z" />
    {[
      [30, 30],
      [70, 30],
      [30, 70],
      [70, 70],
    ].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r={8} />
    ))}
  </>
);

// Thai: the pongal pot boiling over, and sugarcane
const pongal = (
  <>
    <path d="M32 44 Q16 58 25 76 Q33 90 50 90 Q67 90 75 76 Q84 58 68 44 Z" />
    <path d="M33 38 L67 38 L66 44 L34 44 Z" />
    <path d="M34 38 Q35 28 42 32 Q46 22 52 30 Q58 22 62 32 Q68 28 66 38" />
    <path d="M25 62 Q50 72 75 62" />
    <path d="M86 94 L77 10 M79 72 L86 71 M81 52 L88 51 M79 32 L86 31" strokeWidth={2} />
    <path d="M77 12 Q66 6 58 14 M77 12 Q88 4 95 10" />
  </>
);

// Masi: the full moon over the sea, for Masi Magam
const sea = (
  <>
    <circle cx={50} cy={28} r={14} />
    <path d="M10 54 L90 54" />
    <path d="M42 62 L58 62 M45 68 L55 68" />
    <path d="M8 78 Q18 70 28 78 T48 78 T68 78 T88 78" />
    <path d="M8 90 Q18 82 28 90 T48 90 T68 90 T88 90" />
  </>
);

// Panguni: a thoranam of mango leaves, for the weddings of Panguni Uthiram
const thoranam = (() => {
  const y = (x: number) => {
    const t = (x - 6) / 88;
    return 20 + 28 * t * (1 - t);
  };
  return (
    <>
      <path d="M6 20 Q50 34 94 20" />
      {[14, 26, 38, 50, 62, 74, 86].map((x, i) => {
        const y0 = y(x);
        const len = i % 2 ? 26 : 36;
        return (
          <path
            key={x}
            d={`M${x} ${y0} C${x - 7} ${y0 + len * 0.3} ${x - 4} ${y0 + len * 0.75} ${x} ${y0 + len} C${x + 4} ${y0 + len * 0.75} ${x + 7} ${y0 + len * 0.3} ${x} ${y0} Z M${x} ${y0 + 4} L${x} ${y0 + len - 4}`}
          />
        );
      })}
    </>
  );
})();

const MOTIFS: Record<string, { art: ReactNode; label: string }> = {
  chithirai: { art: konrai, label: "Konrai flowers" },
  vaikasi: { art: vel, label: "Murugan's vel" },
  aani: { art: prabha, label: "Nataraja's ring of fire" },
  aadi: { art: river, label: "A lamp on the river" },
  aavani: { art: kozhukattai, label: "A kozhukattai" },
  purattasi: { art: namam, label: "Perumal's namam" },
  aippasi: { art: rain, label: "The first rains" },
  karthigai: { art: lamps, label: "Karthigai lamps" },
  margazhi: { art: kolam, label: "A kolam" },
  thai: { art: pongal, label: "The pongal pot" },
  masi: { art: sea, label: "The full moon over the sea" },
  panguni: { art: thoranam, label: "A thoranam of mango leaves" },
};

export function MonthMotif({ month, className }: { month: string; className?: string }) {
  const m = MOTIFS[month];
  if (!m) return null;
  return (
    <svg
      className={`motif${className ? ` ${className}` : ""}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label={m.label}
    >
      {m.art}
    </svg>
  );
}
