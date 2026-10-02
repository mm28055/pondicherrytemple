import type { CSSProperties, ReactNode } from "react";

/* A small line drawing for each Tamil month, of what the month is known
   for. Drawn in the month's colour (the `color` of whatever holds it).
   Placeholders in spirit: Abishek may one day draw them properly.
   The parts that move when a drawing comes alive (the lamps' flames, the
   rain, the pongal boiling over …) carry an "m-…" class; site.css has the
   movements. "--i" staggers a row of like parts. */

const n = (i: number) => ({ "--i": i }) as CSSProperties;

const pt = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy - r * Math.sin(a)).toFixed(1)}`;
};

// Chithirai: a sprig of artemisia (davanam), as it is offered at the shrine:
// pale stems curving up from one base; each leaf feathery like a carrot's, on
// a curving stalk, its lobes split again into fine fingers; round buds nod at
// the tips. Pointed at, it burns down to a little pile of ash, and grows
// again out of the ash.
const r1 = (v: number) => Math.round(v * 10) / 10;
const frond = (x: number, y: number, deg: number, L: number) => {
  const c = L * 0.16; // how much the leaf's stalk curves up
  const at = (t: number) => [t * L, -2 * t * (1 - t) * c];
  const parts: string[] = [`M0 0 Q${r1(L / 2)} ${r1(-c)} ${L} 0`];
  [0.2, 0.42, 0.62, 0.8].forEach((t, k) => {
    const [px, py] = at(t);
    const a = (L / 3.3) * (1 - k * 0.18); // each lobe shorter towards the tip
    for (const side of [-1, 1]) {
      // the lobe, out and forward; then two fingers off it, and its tip
      const dx = 0.62 * a,
        dy = side * 0.78 * a;
      const ex = px + dx,
        ey = py + dy;
      parts.push(`M${r1(px)} ${r1(py)} L${r1(ex)} ${r1(ey)}`);
      const mx = px + dx * 0.5,
        my = py + dy * 0.5;
      const f = a * 0.38;
      parts.push(`M${r1(mx)} ${r1(my)} l${r1(f * 0.95)} ${r1(side * f * 0.3)}`);
      parts.push(
        `M${r1(mx)} ${r1(my)} l${r1(-f * 0.25)} ${r1(side * f * 0.95)}`,
      );
    }
  });
  return (
    <path
      key={`${x}-${y}`}
      transform={`translate(${x} ${y}) rotate(${deg})`}
      strokeWidth={1.5}
      d={parts.join(" ")}
    />
  );
};
const bud = (sx: number, sy: number, x: number, y: number, i: number) => (
  <g key={`${x}-${y}`}>
    <path
      d={`M${sx} ${sy} Q${(sx + x) / 2} ${Math.min(sy, y) - 3} ${x} ${y}`}
      strokeWidth={1.8}
    />
    <circle cx={x} cy={y} r={2.9} className="fill m-bud" style={n(i)} />
  </g>
);
// The ash: fine grains in a low heap, thickest in the middle, a few scattered
// at its edges. Placed by a fixed pseudo-random sequence, so it is always the
// same heap.
const ASH: [number, number, number][] = (() => {
  let seed = 7;
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const out: [number, number, number][] = [];
  for (let k = 0; k < 320; k++) {
    const u = rand() * 2 - 1; // across the heap, -1 to 1
    const x = 50 + u * 32 + (rand() - 0.5) * 3;
    const top = 97 - 9 * (1 - u * u) ** 1.8; // the heap's low, soft curve
    const y = 97 - rand() ** 0.8 * (97 - top);
    out.push([r1(x), r1(y), Math.round((0.32 + rand() * 0.4) * 100) / 100]);
  }
  return out;
})();
const artemisia = (
  <>
    <g className="m-regrow">
      {/* the stems, from one base, each with its own bends */}
      <path d="M50 97 C46 80 54 64 49 46 C46 34 52 26 50 18" />
      <path
        d="M49 84 C38 76 42 62 35 52 C29 44 32 36 29 28"
        strokeWidth={2.2}
      />
      <path
        d="M50 78 C62 72 57 58 64 48 C70 40 67 34 71 26"
        strokeWidth={2.2}
      />
      {/* the feathery leaves */}
      {frond(49, 90, -150, 28)}
      {frond(50, 86, -32, 27)}
      {frond(51, 68, -148, 21)}
      {frond(51, 63, -34, 21)}
      {frond(48, 42, -125, 14)}
      {frond(39, 64, -172, 17)}
      {frond(32, 42, -165, 14)}
      {frond(59, 58, -8, 17)}
      {frond(67, 41, -14, 14)}
      {/* the buds, nodding at the tips */}
      {bud(50, 18, 50, 10, 0)}
      {bud(49, 23, 43, 16, 6)}
      {bud(50, 27, 58, 19, 1)}
      {bud(29, 28, 25, 19, 2)}
      {bud(31, 34, 22, 30, 3)}
      {bud(71, 26, 75, 17, 4)}
      {bud(69, 32, 78, 28, 5)}
    </g>
    {/* the ash it burns down to: a low heap of fine grey powder */}
    <g className="m-ash">
      {ASH.map(([x, y, r], k) => (
        <circle key={k} cx={x} cy={y} r={r} className="fill" />
      ))}
    </g>
  </>
);

// Vaikasi: Murugan's vel, for Vaikasi Visakam
// It is raised, and its tip shines.
const vel = (
  <>
    <g className="m-raise">
      <path d="M50 6 C62 22 64 38 50 54 C36 38 38 22 50 6 Z" />
      <path d="M50 18 L50 44" />
      <path d="M50 54 L50 95 M43 59 L57 59 M44 64 L56 64" />
    </g>
    <path
      className="m-glint"
      d="M38 12 L31 8 M62 12 L69 8 M43 4 L39 -1 M57 4 L61 -1"
      strokeWidth={2}
    />
  </>
);

// Aani: the ring of fire around Nataraja, and his drum, for Aani Thirumanjanam.
// Its flames leap, one after another round the ring.
const prabha = (
  <>
    <path d={`M${pt(50, 54, 30, -20)} A30 30 0 1 0 ${pt(50, 54, 30, 200)}`} />
    {Array.from({ length: 12 }, (_, i) => -20 + i * 20).map((a, i) => (
      <path
        key={a}
        className="m-ring-flame"
        style={n(i)}
        d={`M${pt(50, 54, 31, a - 5)} Q${pt(50, 54, 37, a - 2)} ${pt(50, 54, 42, a)} Q${pt(50, 54, 37, a + 2)} ${pt(50, 54, 31, a + 5)}`}
      />
    ))}
    <path d="M42 44 L58 44 L42 64 L58 64 Z" />
    <path d="M16 88 L84 88" />
  </>
);

// Aadi: a lamp floating on the river in flood, for Aadi Perukku. The river
// runs, and the lamp rides it.
const river = (
  <>
    <g className="m-float">
      <path d="M50 44 C44 36 47 28 50 20 C53 28 56 36 50 44 Z" />
      <path d="M33 50 L67 50 Q59 60 50 60 Q41 60 33 50 Z" />
    </g>
    <path
      className="m-wave"
      style={n(0)}
      d="M8 64 Q18 56 28 64 T48 64 T68 64 T88 64"
    />
    <path
      className="m-wave"
      style={n(1)}
      d="M8 76 Q18 68 28 76 T48 76 T68 76 T88 76"
    />
    <path
      className="m-wave"
      style={n(2)}
      d="M8 88 Q18 80 28 88 T48 88 T68 88 T88 88"
    />
  </>
);

// Aavani: the kozhukattai made for Vinayaka Chaturthi
const kozhukattai = (
  <>
    <path d="M26 78 Q24 56 38 40 Q46 30 50 12 Q54 30 62 40 Q76 56 74 78 Q50 88 26 78 Z" />
    <path d="M50 12 Q42 40 36 80 M50 12 L50 84 M50 12 Q58 40 64 80" />
    <path d="M14 86 Q50 98 86 86" />
    {/* fresh from the steamer: wisps rise off it */}
    <path
      className="m-steam"
      style={n(0)}
      d="M28 44 Q24 38 28 32 Q32 26 28 20"
    />
    <path
      className="m-steam"
      style={n(1)}
      d="M72 44 Q68 38 72 32 Q76 26 72 20"
    />
    <path className="m-steam" style={n(2)} d="M38 24 Q34 18 38 12 Q42 6 38 0" />
  </>
);

// Purattasi: Perumal's namam, for the Saturdays of Purattasi
const namam = (
  <>
    {/* drawn on the brow, as at the temple: the white, then the red line */}
    <path
      className="m-draw"
      pathLength={100}
      d="M32 14 L32 58 Q32 84 50 84 Q68 84 68 58 L68 14"
      strokeWidth={5}
    />
    <path
      className="m-draw"
      pathLength={100}
      style={n(1)}
      d="M50 20 L50 72"
      strokeWidth={5}
    />
    <path d="M38 94 L62 94" />
  </>
);

// Aippasi: the first rains of the north-east monsoon
const rain = (
  <>
    <path
      className="m-cloud"
      d="M22 46 C11 46 11 30 25 31 C27 17 45 15 50 24 C56 14 76 18 74 32 C87 32 88 46 78 46 Z"
    />
    {/* it rains */}
    {[
      [28, 56, 0],
      [42, 56, 3],
      [56, 56, 1],
      [70, 56, 4],
      [35, 74, 2],
      [49, 74, 5],
      [63, 74, 1.5],
    ].map(([x, y, d]) => (
      <path
        key={`${x}-${y}`}
        className="m-drop"
        style={n(d)}
        d={`M${x} ${y} L${x - 4} ${y + 10}`}
      />
    ))}
  </>
);

// Karthigai: the lamps of Karthigai Deepam
const lamp = (cx: number, cy: number) => (
  <g key={cx}>
    <path
      className="m-flame"
      style={n(cx / 30)}
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
      [30, 50, 70].map((y) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={2.2} className="fill" />
      )),
    )}
    {/* drawn round the dots in one line, then the rings */}
    <path
      className="m-draw slow"
      pathLength={100}
      d="M50 50 C38 38 39 14 50 14 C61 14 62 38 50 50 C62 38 86 39 86 50 C86 61 62 62 50 50 C62 62 61 86 50 86 C39 86 38 62 50 50 C38 62 14 61 14 50 C14 39 38 38 50 50 Z"
    />
    {[
      [30, 30],
      [70, 30],
      [30, 70],
      [70, 70],
    ].map(([x, y]) => (
      <circle
        key={`${x}-${y}`}
        cx={x}
        cy={y}
        r={8}
        className="m-draw slow"
        pathLength={100}
        style={n(1)}
      />
    ))}
  </>
);

// Thai: the pongal pot boiling over, and sugarcane
const pongal = (
  <>
    <path d="M32 44 Q16 58 25 76 Q33 90 50 90 Q67 90 75 76 Q84 58 68 44 Z" />
    <path d="M33 38 L67 38 L66 44 L34 44 Z" />
    {/* it boils over: the froth rises, and runs down the pot */}
    <path
      className="m-froth"
      d="M34 38 Q35 28 42 32 Q46 22 52 30 Q58 22 62 32 Q68 28 66 38"
    />
    <path
      className="m-spill"
      pathLength={100}
      d="M35 40 Q27 46 28 56 Q28 60 25 62"
    />
    <path
      className="m-spill"
      pathLength={100}
      style={n(1)}
      d="M65 40 Q72 46 71 54"
    />
    <path
      className="m-spill"
      pathLength={100}
      style={n(2)}
      d="M45 42 Q42 48 43 52"
    />
    <path d="M25 62 Q50 72 75 62" />
    <path
      d="M86 94 L77 10 M79 72 L86 71 M81 52 L88 51 M79 32 L86 31"
      strokeWidth={2}
    />
    <path d="M77 12 Q66 6 58 14 M77 12 Q88 4 95 10" />
  </>
);

// Masi: the full moon over the sea, for Masi Magam
const sea = (
  <>
    {/* the moon rises out of the sea, and its light shimmers on the water */}
    <clipPath id="masi-sky">
      <rect x={0} y={-10} width={100} height={63} />
    </clipPath>
    <g clipPath="url(#masi-sky)">
      <circle className="m-rise" cx={50} cy={28} r={14} />
    </g>
    <path d="M10 54 L90 54" />
    <path className="m-shimmer" d="M42 62 L58 62" />
    <path className="m-shimmer" style={n(1)} d="M45 68 L55 68" />
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
        // the leaves lengthen, as the thoranam is hung for the wedding
        return (
          <path
            key={x}
            className="m-leaf"
            style={n(Math.abs(i - 3))}
            d={`M${x} ${y0} C${x - 7} ${y0 + len * 0.3} ${x - 4} ${y0 + len * 0.75} ${x} ${y0 + len} C${x + 4} ${y0 + len * 0.75} ${x + 7} ${y0 + len * 0.3} ${x} ${y0} Z M${x} ${y0 + 4} L${x} ${y0 + len - 4}`}
          />
        );
      })}
    </>
  );
})();

const MOTIFS: Record<string, { art: ReactNode; label: string }> = {
  chithirai: { art: artemisia, label: "Artemisia" },
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

export function MonthMotif({
  month,
  className,
}: {
  month: string;
  className?: string;
}) {
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
