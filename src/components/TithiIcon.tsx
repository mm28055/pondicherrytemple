import type { ReactNode } from "react";
import { TITHI_NAMES, type TithiKey } from "@/lib/tithiNames";

/** A tithi's icon, the height of the text around it. Each in the spirit of
    a temple's stone figures: solid ink on a stepped pedestal, its details and
    ornaments drawn out in white. Pradosham's Nandi is a free line drawing
    (public/icons); the others are drawn here. */
export function TithiIcon({ k, large = false }: { k: TithiKey; large?: boolean }) {
  if (k === "pradosham-s" || k === "pradosham-k")
    // Nandi, couched on his pedestal, adorned: a licensed drawing, its navy made ink, the
    // white within the figure kept white, the white around it made clear
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="tithi-img tall" src="/icons/nandi-2.png" alt="" aria-hidden="true" style={{ aspectRatio: "653 / 652" }} />;
  if (k === "vinayaka-chaturthi" || k === "sankatahara-chaturthi")
    // Vinayaka, seated, his hand raised, the modak and the lotus: a free image, in ink; the same
    // for both Chaturthis
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="tithi-img tall" src="/icons/vinayaka-2.png" alt="" aria-hidden="true" style={{ aspectRatio: "626 / 753" }} />;
  if (k === "panchami-s" || k === "panchami-k")
    return (
      <svg className="tithi-art tall" viewBox="0 -13 100 143" aria-hidden="true" style={{ aspectRatio: "100 / 143" }}>
        <Nagabandha />
      </svg>
    );
  if (k === "ashtami-k")
    return (
      <svg className="tithi-art" viewBox="40 40 920 700" aria-hidden="true" style={{ aspectRatio: "920 / 700" }}>
        <Hound />
      </svg>
    );
  if (k === "shashti")
    return (
      <svg className="tithi-art tall" viewBox="0 -16 420 604" aria-hidden="true" style={{ aspectRatio: "420 / 604" }}>
        <OmVel />
      </svg>
    );
  const art = ART[k];
  return art ? (
    <svg className={art.free ? "tithi-art free" : "tithi-art"} viewBox="0 0 140 100" aria-hidden="true">
      {art.free ? (
        <g transform={`translate(70 50) scale(${art.scale}) translate(-70 -${art.cy ?? 50})`}>{art.figure}</g>
      ) : (
        <>
          <g transform={`translate(70 84) scale(${art.scale}) translate(-70 -84)`}>{art.figure}</g>
          <Pedestal />
        </>
      )}
    </svg>
  ) : (
    <>{TITHI_NAMES[k].icon}</>
  );
}

/** The stepped pedestal every figure stands on, as the Nandi does. */
function Pedestal() {
  return (
    <g>
      <path d="M24 84 H116 L121 90 H19 Z" fill="currentColor" />
      <path d="M14 90 H126 V98 H14 Z" fill="currentColor" />
      <path d="M20 93.5 H120" stroke="#fff" strokeWidth="1.6" />
    </g>
  );
}

const W = { fill: "none", stroke: "#fff", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const dots = (pts: [number, number][], r = 1.5) => pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" />);

/* Vinayaka's face: the crown's drop above, the jewelled band and the bindi on the forehead, the eyes, the ears
   spread wide, the trunk falling and curling at its tip, the tusks either side,
   his right one broken (Ekadanta). Drawn either way: solid ink with its details in white (Vinayaka
   Chaturthi, in the waxing fortnight), or reversed, white with its lines in
   ink (Sankatahara Chaturthi, in the waning one); and with the crescent moon
   on the forehead in place of the jewel, as Bhalachandra. */
export function Face({ reversed = false, moon = false }: { reversed?: boolean; moon?: boolean }) {
  const ink = reversed ? "#fff" : "currentColor"; // the shapes
  const line = reversed ? "currentColor" : "#fff"; // their edges and details
  const L = { ...W, stroke: line };
  return (
    <g>
      {/* the face */}
      <g transform="translate(70 52) scale(1.02) translate(-70 -58)">
        <g fill={ink} stroke={line} strokeWidth={reversed ? 2.6 : 1.8} strokeLinejoin="round">
          {/* the ears */}
          <path d="M53 47 C37 40 25 50 27 65 C29 76 41 80 52 73 Z" />
          <path d="M87 47 C103 40 115 50 113 65 C111 76 99 80 88 73 Z" />
          {/* the face */}
          <path d="M70 30 C85 30 91 43 89 59 C88 69 83 74 79 76 H61 C57 74 52 69 51 59 C49 43 55 30 70 30 Z" />
          {/* the crown's drop */}
          <path d="M70 12 C74 18 77 23 77 27 C77 31 74 34 70 34 C66 34 63 31 63 27 C63 23 66 18 70 12 Z" />
          {/* the trunk, falling and narrowing, its tip curling up to his left */}
          <path d="M61.5 68 C61.5 81 63.5 91 68.5 97 C72 101 79 101.5 83.5 98.5 C88 95.5 89.5 90 86.5 86 C84.8 83.8 81.5 84.3 81.8 87.5 C82 90.5 79.5 92.5 76.5 91.5 C74.5 90.5 78.5 83 78.5 68 Z" />
        </g>
        <g {...L}>
          {/* the band across the forehead */}
          <path d="M55 45 C62 41 78 41 85 45" />
          {/* the eyes */}
          <path d="M58 54 C60.5 51.5 64.5 51.5 67 54" />
          <path d="M73 54 C75.5 51.5 79.5 51.5 82 54" />
          {/* the folds of the ears */}
          <path d="M47 50 C37 48 32 56 34 66" />
          <path d="M93 50 C103 48 108 56 106 66" />
        </g>
        {moon ? (
          // the crescent moon on the forehead, Bhalachandra
          <path d="M64.5 39.5 A6 6 0 0 0 76 44.5 A4.6 4.6 0 0 1 64.5 39.5 Z" fill={line} stroke={line} strokeWidth="0.8" strokeLinejoin="round" />
        ) : (
          // the band's jewel
          <>
            <circle cx="70" cy="42" r="3.6" fill={ink} stroke={line} strokeWidth="1.6" />
            <circle cx="70" cy="42" r="1.4" fill={line} />
          </>
        )}
        {/* the bindi */}
        <circle cx="70" cy="49" r="1.4" fill={line} />
        {/* the tusks, either side of the trunk: his right one (on our left, as he faces us)
            broken short, Ekadanta; the whole one on his left */}
        <g fill={reversed ? "#fff" : "currentColor"} stroke={reversed ? "currentColor" : "#fff"} strokeWidth="1.5" strokeLinejoin="round">
          <path d="M62.5 62 C58.6 63.2 55.6 66.3 54.4 70.2 L59.9 71.8 C60.3 69.5 61.3 67.6 62.5 66.4 Z" />
          <path d="M77.5 62.5 C81.5 63.5 85 67.5 86.8 74.5 C83.8 72.8 80.6 69.8 77.5 67 Z" />
        </g>
      </g>
    </g>
  );
}

/* Shashti: Murugan's ஓம், from the free image (its gold made ink, its own Vel taken out), drawn
   smaller, at the foot; and his Vel laid across it on the same line, larger and bolder: the
   shaft edged in white where it crosses the letters, the broad leaf of the spear (as on the bronze
   Vels, widest in its lower third, its base rounded) with the three
   lines of vibhuti and the dot in white, a collar where head meets shaft. In the image's own
   coordinates. */
function OmVel() {
  return (
    <g>
      <image href="/icons/om.png" width="420" height="588" transform="translate(0 118) scale(0.8)" />
      {/* the shaft */}
      <path d="M40 505 L253 188" stroke="#fff" strokeWidth="36" strokeLinecap="round" />
      <path d="M40 505 L253 188" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
      {/* the head, along the shaft */}
      <g transform="translate(253 188) rotate(34)">
        {/* the leaf of the spear, as on the bronze Vels: broad, widest in its lower third, its base
            rounded, tapering to its point */}
        <path d="M0 -196 C30 -158 64 -104 64 -60 C64 -22 38 2 0 4 C-38 2 -64 -22 -64 -60 C-64 -104 -30 -158 0 -196 Z" fill="currentColor" stroke="#fff" strokeWidth="10" strokeLinejoin="round" />
        <g stroke="#fff" strokeWidth="7.5" strokeLinecap="round">
          <path d="M-36 -78 H36" />
          <path d="M-40 -60 H-14 M14 -60 H40" />
          <path d="M-38 -42 H38" />
        </g>
        <circle cx="0" cy="-60" r="7.5" fill="#fff" />
        {/* the collar below it, flaring a little like a lotus, and the knot of the shaft */}
        <path d="M-26 2 C-18 10 -10 14 0 14 C10 14 18 10 26 2 L22 14 C14 20 -14 20 -22 14 Z" fill="currentColor" stroke="#fff" strokeWidth="4.5" strokeLinejoin="round" />
        <rect x="-15" y="16" width="30" height="13" rx="5" fill="currentColor" stroke="#fff" strokeWidth="4.5" />
      </g>
    </g>
  );
}

/* Panchami: the nagabandha, after the carved stones and the old drawings:
   two serpents twined about each other in three loops, crossing over and
   under in turn (each crossing left clear by a white edge), their tails
   crossed and parted at the foot; at the top their heads, in profile, facing
   each other, each with its hood flaring behind, its eye and forked tongue. */
const BANDHA = (() => {
  const top = 42, bottom = 118, loops = 3;
  const a: [number, number][] = [], b: [number, number][] = [];
  for (let i = 0; i <= 180; i++) {
    const y = top + ((bottom - top) * i) / 180;
    const phase = (Math.PI * loops * (y - top)) / (bottom - top);
    const amp = 24 - (5 * (y - top)) / (bottom - top);
    a.push([50 + amp * Math.sin(phase), y]);
    b.push([50 - amp * Math.sin(phase), y]);
  }
  return { a, b };
})();
const path = (pts: [number, number][]) => "M" + pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(" L");
// the crossings, a third of the way apart (the top one is where the necks part)
const near = (pts: [number, number][], y: number) => pts.filter(([, py]) => Math.abs(py - y) < 7);

function Nagabandha() {
  const { a, b } = BANDHA;
  const body = (d: string, w: number, cap: "round" | "butt" = "round") => (
    <>
      <path d={d} stroke="#fff" strokeWidth={w + 4} strokeLinecap={cap} />
      <path d={d} stroke="currentColor" strokeWidth={w} strokeLinecap={cap} />
    </>
  );
  // a serpent's head in profile, facing in (to the right, or mirrored to the left): the hood
  // flaring up behind it, the head long, the snout pointed, an eye, the forked tongue
  const head = (x: number, y: number, mirror: boolean) => (
    <g transform={`translate(${x} ${y}) rotate(${mirror ? 28 : -28}) scale(${mirror ? -1.3 : 1.3} 1.3)`}>
      <path d="M-11 13 C-15 4 -12 -7 -3 -10 C1 -11 4 -9 4 -6 L-1 3 C-4 6 -7 9 -8 14 Z" fill="currentColor" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M-4 -7 C2 -10 11 -9.5 15.5 -5.5 C17.5 -3.5 16.8 -0.6 14 0.4 C9 2 1 1.6 -4 -0.6 Z" fill="currentColor" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="7" cy="-4.6" r="1.3" fill="#fff" />
      <path d="M16 -2.2 H20.5 M20.5 -2.2 L23 -4 M20.5 -2.2 L23 -0.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </g>
  );
  return (
    <g fill="none" strokeLinejoin="round">
      {/* the tails, crossed at the foot and parting */}
      <path d="M50 118 C56 122 64 125 74 127" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      {body("M50 118 C44 122 36 125 26 127", 6)}
      {/* the two bodies: the second over the first, then the first over the second at every other crossing */}
      {body(path(a), 10.5)}
      {body(path(b), 10.5)}
      {body(path(near(a, 42 + 76 / 3)), 10.5, "butt")}
      {body(path(near(a, 118 - 2)), 10.5, "butt")}
      {/* the necks, rising from the top crossing to the hoods */}
      {body("M50 42 C40 37 22 37 19 27", 10.5)}
      {body("M50 42 C60 37 78 37 81 27", 10.5)}
      {head(22, 15, false)}
      {head(78, 15, true)}
    </g>
  );
}

/* Panchami: the naga coiled round the trishul, after the free image of it:
   his body in a ring of five loops, the crossings left clear (each stretch
   drawn over a white edge, so where he passes over himself it shows), his
   hood raised at the top, the tail narrowing. */
const KNOT = (() => {
  const pts: [number, number, number][] = [];
  const n = 240, from = -Math.PI / 2 + 0.12, to = from + 2 * Math.PI - 0.42;
  for (let i = 0; i <= n; i++) {
    const t = from + ((to - from) * i) / n;
    // a ring with five loops round it, turned outward, about the middle (50, 74)
    const x = 50 + 23 * Math.cos(t) + 11 * Math.cos(6 * t);
    const y = 74 + 23 * Math.sin(t) + 11 * Math.sin(6 * t);
    // full-bodied from the neck, narrowing over the last stretch to the tail
    const w = i > n * 0.78 ? 5.4 * (1 - ((i - n * 0.78) / (n * 0.22)) * 0.75) : 5.4;
    pts.push([x, y, w]);
  }
  return pts;
})();

// the body in sixteen runs, each sharing its first point with the last one's end
const RUNS = Array.from({ length: 16 }, (_, k) => KNOT.slice(k * 15, k * 15 + 16));

function NagaKnot() {
  const [hx, hy] = KNOT[0];
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      {/* the trishul, standing in the middle, its shaft running down through the coils */}
      <g stroke="currentColor" strokeWidth="3">
        <path d="M50 69 V115" />
        <path d="M45.5 69.5 C45.2 74 47.2 76.5 50 76.5 C52.8 76.5 54.8 74 54.5 69.5" />
      </g>
      <path d="M50 64.5 L47.8 70.5 H52.2 Z" fill="currentColor" />
      {/* the body, in runs, each over a white edge: where he passes over himself the edge
          cuts the run beneath, so the crossings show (each edge begins a little after its run,
          so it does not cut the run before it) */}
      {RUNS.map((run, i) => {
        const line = (from: number) => "M" + run.slice(from).map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(" L");
        const w = run[Math.floor(run.length / 2)][2];
        return (
          <g key={i}>
            <path d={line(i ? 4 : 0)} stroke="#fff" strokeWidth={w + 3.6} />
            <path d={line(0)} stroke="currentColor" strokeWidth={w} />
          </g>
        );
      })}
      {/* the neck, rising from the coils to the hood */}
      <path d={`M${hx} ${hy} C${hx} ${hy - 4} 50 ${hy - 4} 50 40`} stroke="currentColor" strokeWidth="5.4" />
      {/* the hood, spread, and the head on it; its markings in white */}
      {/* the hood, one shape: the head its peak, spreading wide below it, narrowing to the neck */}
      <path d="M50 3 C54 3 56.5 6.5 56.5 10.5 C64 13.5 69 20.5 68.5 28.5 C68 35.5 60.5 40.5 53.5 42.5 H46.5 C39.5 40.5 32 35.5 31.5 28.5 C31 20.5 36 13.5 43.5 10.5 C43.5 6.5 46 3 50 3 Z" fill="currentColor" stroke="#fff" strokeWidth="1.8" />
      {/* the ribs of the hood, down either side */}
      <path d="M43 15 C37.5 20 37 29 43.5 36.5" stroke="#fff" strokeWidth="1.6" />
      <path d="M57 15 C62.5 20 63 29 56.5 36.5" stroke="#fff" strokeWidth="1.6" />
    </g>
  );
}

/* Panchami: the naga of the nagakal, as carved on the standing stones: the
   five-headed hood spread wide, its ribs in white; the body in close curves
   gathered under the hood, to the tail curling at the foot, a ridge along it
   in white. */
function Nagakal() {
  const body = "M30 45 C30 50 22 51 21 55 C20 59 28 60 35 61.5 C42 63 42 68 35 69.5 C28 71 20 70.5 21 74.5 C22 77.5 27 77.5 33 76.5";
  return (
    <g>
      {/* the body, falling in its curves, broad below the hood and narrowing to the tail */}
      <path d={body} fill="none" stroke="currentColor" strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* the tail, narrowing, curling up at the foot of the stone */}
      <path d="M33 76.5 C39 75.5 43.5 76.5 42 80 C40.5 82.5 36.5 82 37.5 79.7" fill="none" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" />
      <path d={body} fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2.6 2" />
      {/* the hood, spread wide, and its five heads along the top */}
      <path d="M10.5 31 C9.5 18 18.5 10 30 10 C41.5 10 50.5 18 49.5 31 C48.5 39 40 47 30 47 C20 47 11.5 39 10.5 31 Z" fill="currentColor" />
      {[16.5, 23.2, 30, 36.8, 43.5].map((x, i) => (
        <ellipse key={i} cx={x} cy={i === 2 ? 10.5 : i === 1 || i === 3 ? 11.8 : 14.5} rx="3.9" ry="4.8" fill="currentColor" stroke="#fff" strokeWidth="1.1" />
      ))}
      {/* the ribs of the hood, fanning from the neck */}
      <g stroke="#fff" strokeWidth="1.1" strokeLinecap="round" fill="none">
        <path d="M30 44 L17 21" />
        <path d="M30 44 L23.5 18.5" />
        <path d="M30 44 V17" />
        <path d="M30 44 L36.5 18.5" />
        <path d="M30 44 L43 21" />
        <path d="M15 32 C21 39 39 39 45 32" />
      </g>
    </g>
  );
}

/* The naga: coiled on the pedestal, the hood raised and spread. */
const naga = (
  <g>
    <g fill="currentColor">
      <path d="M28 84 C28 73 48 69 70 69 C92 69 112 73 112 84 Z" />
      <path d="M40 71 C40 63 56 59 70 59 C84 59 98 63 98 71 Z" />
      <path d="M80 3 C86 3 89 7 89 11 C99 14 106 27 103 39 C101 47 92 51 86 51 H74 C68 51 59 47 57 39 C54 27 61 14 71 11 C71 7 74 3 80 3 Z" />
    </g>
    <path d="M74 62 C71 52 75 44 80 38" fill="none" stroke="currentColor" strokeWidth="11" strokeLinecap="round" />
    <path d="M30 82 C20 82 15 75 20 70" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    <g {...W}>
      <path d="M73 24 C76 20 84 20 87 24" />
      <path d="M66 34 C71 42 89 42 94 34" />
      <path d="M80 28 V46" />
      <path d="M36 80 C50 75 90 75 104 80" />
      <path d="M46 69 C58 65 82 65 94 69" />
    </g>
    {dots([[76, 8], [84, 8]], 1.4)}
    {dots([[74, 29], [86, 29]], 1.8)}
    {dots([[50, 77], [60, 76], [70, 75.5], [80, 76], [90, 77]], 1.3)}
  </g>
);

/* Murugan's peacock: the crest, the long neck, the train sweeping down to
   the pedestal, its eyes in white. */
const peacock = (
  <g>
    <g fill="currentColor">
      <path d="M66 44 C90 40 118 50 126 84 H84 C80 72 74 64 68 60 Z" />
      <path d="M46 50 C46 38 56 32 64 38 C72 44 74 58 68 68 C62 76 50 74 46 64 Z" />
      <path d="M44 50 C40 38 40 24 46 16 C50 12 56 14 56 20 C56 26 52 32 54 44 Z" />
      <path d="M46 17 L37 20.5 L46 22 Z" />
    </g>
    <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M50 13 L47 4" />
      <path d="M52 13 L52 3" />
      <path d="M54 14 L58 5" />
      <path d="M56 72 L54 84" />
      <path d="M63 72 L63 84" />
    </g>
    {[[47, 4], [52, 3], [58, 5]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="2.2" fill="currentColor" />)}
    <g {...W}>
      <path d="M52 46 C56 52 62 54 66 52" />
      <path d="M50 56 C56 62 64 62 68 58" />
      <path d="M70 48 C84 48 100 56 110 70" />
    </g>
    {[[88, 58], [102, 63], [114, 75], [94, 72], [106, 80]].map(([x, y]) => (
      <g key={x}>
        <circle cx={x} cy={y} r="4" fill="none" stroke="#fff" strokeWidth="1.8" />
        <circle cx={x} cy={y} r="1.3" fill="#fff" />
      </g>
    ))}
    {dots([[47, 20]], 1.4)}
  </g>
);

/* Theipirai Ashtami: Bhairava's hound, traced from the free painting of
   Bhairava with his dog (his legs left out, the hound's back and belly they
   hide joined up): standing in profile, facing left; the long narrow head,
   the ear hanging; the deep chest and the waist tucked high;
   long slender legs; the tail curling into a loop. In the painting's own
   coordinates. */
function Hound() {
  return (
    <g>
      {/* the hound */}
      <path d="M72 145 L95 130 L130 105 L160 80 L185 66 L210 64 L232 74 L248 95 L262 130 L278 170 L292 210 L300 250 L420 270 L560 285 L640 290 L700 292 L740 300 L770 318 L785 340 L790 370 L780 410 L768 450 L770 500 L780 550 L790 600 L792 650 L790 690 L782 712 L760 722 L735 722 L728 712 L745 700 L748 660 L742 610 L730 560 L715 520 L700 480 L690 455 L672 480 L668 530 L662 580 L648 630 L628 672 L610 700 L596 716 L578 722 L572 712 L592 694 L610 660 L622 612 L628 560 L626 510 L616 470 L598 446 L560 438 L450 444 L330 450 L312 470 L302 512 L296 560 L290 610 L281 660 L269 700 L258 722 L236 722 L238 709 L252 690 L260 642 L263 592 L260 560 L250 600 L238 650 L226 690 L215 715 L195 722 L180 716 L194 700 L207 660 L221 600 L231 540 L236 480 L229 430 L214 380 L200 330 L194 290 L191 258 L195 222 L199 190 L204 166 L190 156 L160 151 L130 153 L100 154 L78 150 Z" fill="currentColor" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
      {/* the tail, rising from the rump and curling into a loop */}
      <path d="M780 332 C800 362 806 402 830 430 C850 452 890 447 910 422 C930 396 925 352 896 331 C871 315 846 330 849 352" fill="none" stroke="currentColor" strokeWidth="11" strokeLinecap="round" />
      {/* the ear, hanging, edged in white; the eye */}
      <path d="M216 86 C236 98 250 132 249 170 C247 186 236 192 226 178 C217 156 213 118 216 86 Z" fill="currentColor" stroke="#fff" strokeWidth="6" strokeLinejoin="round" />
      <circle cx="150" cy="97" r="7" fill="#fff" />
      {/* the line of the shoulder and of the haunch */}
      <path d="M262 300 C280 340 284 390 274 440" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
      <path d="M730 330 C760 360 764 410 744 452" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
    </g>
  );
}

/* The lingam on its avudaiyar, the spout to the right (drawn with it to the
   left, and turned over), the three lines of vibhuti across it. */
const lingam = (
  <g transform="translate(140 0) scale(-1 1)">
    <g fill="currentColor">
      {/* the lingam, tall */}
      <path d="M53 68 V26 C53 6 87 6 87 26 V68 Z" />
      {/* the avudaiyar: its rim, its body, its spout */}
      <path d="M40 66 H100 C104.5 66 104.5 74 100 74 H40 C35.5 74 35.5 66 40 66 Z" />
      <path d="M46 73 H94 V84 H46 Z" />
      <path d="M40 68 L20 71 L20 75.5 L40 73.5 Z" />
    </g>
    <g {...W}>
      <path d="M57 30 H83" />
      <path d="M57 36 H83" />
      <path d="M57 42 H83" />
      <path d="M42 70 H98" />
      <path d="M50 78.5 H90" />
      <path d="M23 73 L37 71.5" />
    </g>
    {dots([[70, 22]], 2.4)}
  </g>
);

/** Each figure, and how much larger it is drawn on its pedestal (from the
    pedestal's middle), so all of them fill it as the Nandi fills his; or,
    standing free of a pedestal, how much larger from the middle. */
const ART: Partial<Record<TithiKey, { figure: ReactNode; scale: number; free?: boolean; cy?: number }>> = {
  "vinayaka-chaturthi": { figure: <Face />, scale: 0.95, free: true, cy: 52 },
  "panchami-s": { figure: naga, scale: 1.1 },
  "panchami-k": { figure: naga, scale: 1.1 },
  "sankatahara-chaturthi": { figure: <Face reversed />, scale: 0.95, free: true, cy: 52 },
  shivaratri: { figure: lingam, scale: 1.27, free: true, cy: 45 },
};
