/* A page opened by a link starts at its top (components/LandAtTop), but for
   the few that are to stay where they are on the screen: the month
   calendar's steps, its dropdowns, a swipe to the next month. A link marks
   itself with this attribute; a router.push calls keepScroll() first. */
export const KEEP_SCROLL = "data-keep-scroll";

let keep = false;

/** The next page change keeps the page where it is. */
export function keepScroll() {
  keep = true;
}

/** Whether the next page change keeps the page where it is; `to`: set it. Returns what it was. */
export function keepingScroll(to: boolean): boolean {
  const was = keep;
  keep = to;
  return was;
}
