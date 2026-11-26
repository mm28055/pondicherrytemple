/* Going from a page to itself in the other language (the EN | த switch,
   components/Nav): the page stays where it was, as it was. The two run to
   different lengths, so the place is kept by what is there: the part of the
   page a quarter of the way down the window, and how far through it (between
   two parts, or within a very long one: the nearest part, and how far off);
   and the same part of the other page is put at the same height. The tab chosen in a
   temple's Ritual Cycles, a list of field notes unfolded and an introduction
   opened are so again. */

/* the parts of a page, the same in both languages, each found by its kind and its number */
const PARTS = [
  ".page-head", ".page-lede", ".home-hero", ".home-strip", ".home-opening", ".home-opening > div", ".home-opening-film", ".home-latest", ".home-latest li",
  ".voice", ".home-lists", ".home-lists > div", ".band", ".temple-row", ".obs-row", ".temple-entry", ".temple-cards", ".temple-card", ".around-head",
  ".month-head", ".cal", ".cal-day", ".varam-days", ".varam-open", ".varam-list li", ".varam-photos",
  ".name-list li", ".gallery-card", ".rasi", ".rasi-month",
  ".about-block", ".about-block p", ".team > li", ".film", ".film-text", ".note-head", ".note-dateline", ".note-title", ".note-body .rich > *", ".note-body .rich li", ".note-foot", ".note-step", ".photo-group-head",
  ".page-parts", ".temple-intro", ".stack > section", ".note-row", ".video-tile", ".photo-wall", ".photo-row", ".ritual-switch", ".year-month", ".year-regular",
  ".year-list > *", ".site-footer", ".footer-bottom",
];

type Place = {
  /** the parts there, the smallest first (the main column's before the side one's), each with how far through it */
  parts: { kind: string; n: number; through: number; off: number }[];
  tab: number;
  unfolded: boolean;
  opened: boolean;
};
let kept: Place | null = null;

const line = () => {
  const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 71;
  return nav + (window.innerHeight - nav) / 4;
};
const tabs = () => [...document.querySelectorAll<HTMLButtonElement>(".ritual-switch button")];
const moreButton = () => document.querySelector<HTMLButtonElement>("#field-notes .more-button");

/** Remember the place, as the switch is pressed. */
export function keepPlace() {
  const y = line();
  const found: { kind: string; n: number; through: number; off: number; far: number; size: number; side: boolean }[] = [];
  if (window.scrollY > 4)
    for (const kind of PARTS)
      document.querySelectorAll<HTMLElement>(kind).forEach((el, n) => {
        const r = el.getBoundingClientRect();
        if (r.height === 0) return;
        const side = Boolean(el.closest("aside"));
        const within = r.top <= y && r.bottom > y;
        if (within && r.height < window.innerHeight) found.push({ kind, n, through: (y - r.top) / r.height, off: 0, far: 0, size: r.height, side });
        else if (Math.abs(r.top - y) < 2 * window.innerHeight) found.push({ kind, n, through: 0, off: y - r.top, far: Math.abs(r.top - y), size: r.height, side });
      });
  // what is there, in the main column, the smallest; then what is nearest
  found.sort((a, b) => Number(a.far > 0) - Number(b.far > 0) || Number(a.side) - Number(b.side) || a.far - b.far || a.size - b.size);
  kept = {
    parts: found.slice(0, 40).map(({ kind, n, through, off }) => ({ kind, n, through, off })),
    tab: tabs().findIndex((b) => b.classList.contains("on")),
    unfolded: moreButton()?.getAttribute("aria-expanded") === "true",
    opened: Boolean(document.querySelector(".temple-intro")) && !document.querySelector(".temple-intro .intro-more"),
  };
}

/** Put the other page at it: at once, and again for a moment as the page
    settles (its lists measured, its pictures in), unless the reader moves. */
export function returnToPlace() {
  const place = kept;
  kept = null;
  if (!place) return;
  const { parts } = place;
  const put = () => {
    if (!parts.length) return window.scrollTo({ top: 0, behavior: "instant" });
    for (const { kind, n, through, off } of parts) {
      const r = document.querySelectorAll<HTMLElement>(kind)[n]?.getBoundingClientRect();
      if (!r || r.height === 0) continue;
      const by = r.top + through * r.height + off - line();
      if (Math.abs(by) > 1) window.scrollTo({ top: window.scrollY + by, behavior: "instant" });
      return;
    }
  };
  let moved = false;
  const stop = () => (moved = true);
  const events = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
  events.forEach((e) => window.addEventListener(e, stop, { passive: true, once: true }));
  // as it was (its tab, its introduction, its list), then in its place
  const settle = () => {
    if (moved) return;
    if (place.tab > 0 && !tabs()[place.tab]?.classList.contains("on")) tabs()[place.tab]?.click();
    if (place.opened) document.querySelector<HTMLButtonElement>(".temple-intro .intro-more")?.click();
    const more = moreButton();
    if (place.unfolded && more?.getAttribute("aria-expanded") === "false") more.click();
    queueMicrotask(() => !moved && put());
  };
  // once the page is laid out, before it is seen; then as it settles
  queueMicrotask(settle);
  for (const ms of [0, 30, 80, 150, 300, 500, 800, 1200]) window.setTimeout(settle, ms);
  window.setTimeout(() => events.forEach((e) => window.removeEventListener(e, stop)), 1300);
}
