import { TITHI_NAMES, type TithiKey } from "@/lib/tithiNames";
import { SPECIAL_ICONS, type SpecialIconKey } from "@/lib/specialIcons";

/** A tithi's icon, the height of the text around it. Each in the spirit of
    a temple's stone figures: solid ink, its details drawn out in white. Nandi,
    Vinayaka and the Om are images (public/icons); the others are drawn here. */
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
  if (k === "shivaratri")
    return (
      <svg className="tithi-art free" viewBox="0 0 140 100" aria-hidden="true">
        <g transform="translate(70 50) scale(1.27) translate(-70 -45)">{lingam}</g>
      </svg>
    );
  return <>{TITHI_NAMES[k].icon}</>;
}

const W = { fill: "none", stroke: "#fff", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const dots = (pts: [number, number][], r = 1.5) => pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" />);

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

/** An icon chosen in the admin in place of a special nakshatram's or tithi's
    own (lib/specialIcons): as tall as the icon it stands in for. */
export function SpecialIcon({ k }: { k: SpecialIconKey }) {
  const { src, ratio } = SPECIAL_ICONS[k];
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="tithi-img tall special-icon" src={src} alt="" aria-hidden="true" style={{ aspectRatio: ratio }} />;
}
