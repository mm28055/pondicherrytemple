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

// Aadi: the eyes of the Amman, the month being hers, and her trident between
// them: tapering brows, the upper lids drawn out to a point, the pottu on the
// trident's shaft. Pointed at, she blinks and looks about; the pottu glows.
const ammanEye = (side: -1 | 1) => {
  const x = (v: number) => 50 + side * v; // measured out from the middle
  const open = `M${x(6)} 57 Q${x(21)} 46 ${x(37)} 54 Q${x(23)} 66 ${x(6)} 57 Z`;
  const id = `amman-${side < 0 ? "l" : "r"}`;
  return (
    <g key={side}>
      {/* the brow: thick at its inner end, tapering out and up */}
      <path className="fill" d={`M${x(5)} 44 C${x(14)} 36 ${x(28)} 32.5 ${x(42)} 32.5 C${x(29)} 35 ${x(16)} 39.5 ${x(6)} 48 Z`} />
      <clipPath id={`${id}-open`}>
        <path d={open} />
      </clipPath>
      <mask id={`${id}-shine`}>
        <rect x={0} y={0} width={100} height={100} fill="#fff" stroke="none" />
        <circle cx={x(19)} cy={54} r={1.5} fill="#000" stroke="none" />
      </mask>
      <g className="m-blink">
        {/* the iris, under the lid, with its glint; it looks about inside the eye */}
        <g clipPath={`url(#${id}-open)`}>
          <g className="m-gaze">
            <circle cx={x(21)} cy={56.5} r={6} className="fill" mask={`url(#${id}-shine)`} />
          </g>
        </g>
        {/* the lower lid, fine; the upper, heavy and drawn out to a point */}
        <path d={`M${x(6)} 57 Q${x(23)} 66 ${x(37)} 54`} strokeWidth={1.6} />
        <path className="fill" d={`M${x(5)} 57.5 Q${x(20)} 43 ${x(44)} 47.5 Q${x(38)} 50.5 ${x(37.5)} 54.5 Q${x(21)} 47.5 ${x(6.5)} 58.5 Z`} />
      </g>
    </g>
  );
};
const ammanEyes = (
  <g transform="translate(0 6)">
    {ammanEye(-1)}
    {ammanEye(1)}
    {/* the trident, its shaft between the eyes, ending a little below them */}
    <path d="M50 8 L50 30 M43.5 13 Q42 25 50 27 Q58 25 56.5 13 M45.5 30 L54.5 30" strokeWidth={2.2} />
    <path className="fill" d="M50 5 L52.2 10 L47.8 10 Z M43.5 10 L45.4 14.5 L41.8 14.5 Z M56.5 10 L58.2 14.5 L54.6 14.5 Z" />
    <path d="M50 30 L50 33 M50 45.5 L50 68" strokeWidth={2.2} />
    {/* the pottu on it, and a smaller one below */}
    <circle className="fill m-glow" cx={50} cy={38} r={4.6} />
    <circle className="fill" cx={50} cy={45} r={1.6} />
  </g>
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

// Thai: the pongal pot boiling over, and a stalk of sugarcane beside it.
// The pongal is one shape, its outline in three states: heaped in the pot's
// mouth (at rest); swelling up out of it; and pouring over, the same pongal
// spreading over the rim and down the shoulders, unevenly, a little further
// on one side. Pointed at, it moves from one to the next (site.css, m-boil,
// by the CSS "d" property), so what overflows is the heap that was there.
type Seg = [number, number, number, number]; // a curve: control, then end point
const foamPath = (start: [number, number], segs: Seg[]) =>
  `M${start.join(" ")} ${segs.map((s) => `Q${s.map(r1).join(" ")}`).join(" ")} Z`;
// the heap's crown, from the rim's left end to its right
const CROWN: Seg[] = [
  [34, 31, 39, 32],
  [42, 25, 47, 28],
  [51, 22, 56, 28],
  [61, 26, 62, 31],
  [66, 31, 66, 38],
];
// at rest the rest of its outline lies along the rim, back to its left end
const ALONG_RIM: Seg[] = Array.from({ length: 12 }, (_, k) => {
  const x = 66 - ((k + 1) * 32) / 12;
  return [x + 32 / 24, 38, x, 38];
});
const FOAM_REST = foamPath([34, 38], [...CROWN, ...ALONG_RIM]);
const FOAM_RISE = foamPath(
  [34, 38],
  [...CROWN.map(([cx, cy, x, y]): Seg => [cx, 38 - (38 - cy) * 1.5, x, 38 - (38 - y) * 1.5]), ...ALONG_RIM],
);
const FOAM_OVER = foamPath(
  [30, 40],
  [
    [29, 30, 36, 31],
    [39, 21, 47, 25],
    [52, 17, 58, 24],
    [66, 21, 66, 30],
    [73, 31, 71, 39],
    [78, 43, 76, 49],
    [76, 53, 73, 52],
    [71, 51, 69, 54],
    [66, 56, 64, 52],
    [61, 51, 58, 54],
    [55, 58, 52, 55],
    [49, 52, 46, 54],
    [43, 56, 41, 52],
    [38, 50, 35, 53],
    [31, 57, 28, 54],
    [24, 53, 24, 48],
    [22, 43, 30, 40],
  ],
);
const pongal = (
  <>
    <path d="M32 44 Q16 58 25 76 Q33 90 50 90 Q67 90 75 76 Q84 58 68 44 Z" />
    <path d="M25 62 Q50 72 75 62" />
    <path d="M33 38 L67 38 L66 44 L34 44 Z" />
    {/* the pongal: its fill hides the pot behind it as it pours over */}
    <path
      className="foam m-boil"
      d={FOAM_REST}
      style={
        {
          "--rest": `path("${FOAM_REST}")`,
          "--rise": `path("${FOAM_RISE}")`,
          "--over": `path("${FOAM_OVER}")`,
        } as CSSProperties
      }
    />
    {/* the sugarcane: a jointed stalk, its long leaves arching from the top */}
    <path d="M84 95 L86 22 M90 95 L92 22" />
    <path d="M84.4 80 Q87 82 90.4 80 M84.8 64 Q87.5 66 90.8 64 M85.2 48 Q88 50 91.2 48 M85.6 33 Q88.5 35 91.6 33" strokeWidth={1.6} />
    <path d="M89 23 Q78 6 63 10 M89 23 Q90 6 99 2 M89 23 Q98 16 98.5 30" strokeWidth={2} />
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

// Panguni: a thoranam of mango leaves, for the weddings of Panguni Uthiram.
// Pointed at, it is strung out wider: the string stretches, and the leaves
// spread apart along it, each staying hung on it.
const thoranam = (() => {
  const y = (x: number) => {
    const t = (x - 6) / 88;
    return 20 + 28 * t * (1 - t);
  };
  return (
    <>
      <path className="m-string" d="M6 20 Q50 34 94 20" />
      {[14, 26, 38, 50, 62, 74, 86].map((x, i) => {
        const y0 = y(x);
        const len = i % 2 ? 26 : 36;
        return (
          <path
            key={x}
            className="m-spread"
            style={{ "--dx": (x - 50) * 0.22 } as CSSProperties}
            d={`M${x} ${y0} C${x - 7} ${y0 + len * 0.3} ${x - 4} ${y0 + len * 0.75} ${x} ${y0 + len} C${x + 4} ${y0 + len * 0.75} ${x + 7} ${y0 + len * 0.3} ${x} ${y0} Z M${x} ${y0 + 4} L${x} ${y0 + len - 4}`}
          />
        );
      })}
    </>
  );
})();

/* Each drawing, and the frame (a viewBox) that holds just it and the reach
   of its movement: where the drawings sit side by side, as in the year
   chart, they are fitted by these so all stand on the same line, with room
   to move. */
const MOTIFS: Record<string, { art: ReactNode; label: string; box: string }> = {
  chithirai: { art: artemisia, label: "Artemisia", box: "13 3 73 97" },
  vaikasi: { art: vel, label: "Murugan's vel", box: "27 -10 46 108" },
  aani: { art: prabha, label: "Nataraja's ring of fire", box: "5 9 90 82" },
  aadi: { art: ammanEyes, label: "The eyes of the Amman, and her trident", box: "3 8 94 69" },
  aavani: { art: kozhukattai, label: "A kozhukattai", box: "11 -8 78 103" },
  purattasi: { art: namam, label: "Perumal's namam", box: "29 11 42 86" },
  aippasi: { art: rain, label: "The first rains", box: "10 15 79 76" },
  karthigai: { art: lamps, label: "Karthigai lamps", box: "5 27 96 66" },
  margazhi: { art: kolam, label: "A kolam", box: "11 11 78 78" },
  thai: { art: pongal, label: "The pongal pot, and sugarcane", box: "16 0 88 97" },
  masi: { art: sea, label: "The full moon over the sea", box: "5 11 88 86" },
  panguni: { art: thoranam, label: "A thoranam of mango leaves", box: "-7 17 114 49" },
};

export function MonthMotif({
  month,
  className,
  fit,
}: {
  month: string;
  className?: string;
  /** fitted to the drawing and its movement, standing on the frame's foot */
  fit?: boolean;
}) {
  const m = MOTIFS[month];
  if (!m) return null;
  return (
    <svg
      className={`motif${className ? ` ${className}` : ""}`}
      viewBox={fit ? m.box : "0 0 100 100"}
      preserveAspectRatio={fit ? "xMidYMax meet" : undefined}
      role="img"
      aria-label={m.label}
    >
      {m.art}
    </svg>
  );
}
