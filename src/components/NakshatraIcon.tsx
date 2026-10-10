import { fitted, NAKSHATRAS } from "@/lib/nakshatraNames";

/** A nakshatra's icon: its stars, and the lines between them, drawn in the
    colour of the text around it. */
export function NakshatraIcon({ n }: { n: number }) {
  const { stars, lines, marks } = fitted(NAKSHATRAS[n].shape);
  return (
    <svg className="nak-icon" viewBox="-6 -6 112 112" aria-hidden="true">
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
