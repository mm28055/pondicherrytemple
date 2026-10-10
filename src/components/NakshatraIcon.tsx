import { fitted, NAKSHATRAS } from "@/lib/nakshatraNames";

/** A nakshatra's icon: its stars, and the lines between them, drawn in the
    colour of the text around it; for a special nakshatram, inside a ring. */
export function NakshatraIcon({ n, ringed = false }: { n: number; ringed?: boolean }) {
  const { stars, lines, marks } = fitted(NAKSHATRAS[n].shape);
  return (
    <svg className={ringed ? "nak-icon ringed" : "nak-icon"} viewBox={ringed ? "-34 -34 168 168" : "-6 -6 112 112"} aria-hidden="true">
      {ringed && <circle className="nak-ring" cx={50} cy={50} r={76} />}
      {lines.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={stars[a][0]} y1={stars[a][1]} x2={stars[b][0]} y2={stars[b][1]} />
      ))}
      {stars.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={9} />
      ))}
      {marks.map(([x, y], i) => (
        <circle key={`m${i}`} cx={x} cy={y} r={6} />
      ))}
    </svg>
  );
}
