"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, type ReactNode, type TouchEvent } from "react";

/** A month's calendar is swiped to the month either side: left for the
    next, right for the one before — with a finger on a phone, or two fingers
    across a computer's trackpad. The months either side wait just out of
    sight (`before`, `after`), and the three move together, so the next month
    slides in as this one slides out. Once it has gone far enough it carries
    on by itself: the page's colour glides to the new month's (`colours`, the
    months before and after), the rest of the page dims a little, and the new
    month opens where you are on the page. Short of that, it springs back.
    Up-and-down movement is left to the page's own scrolling. At either end of
    the cycle shown there is no month beyond (prev or next is null): the
    calendar gives a little, like a held elastic, and springs back. */
/* Where the calendar stood on the screen as it was swiped away: the new
   month's is put in the same place when it arrives. */
let swipedFrom: { top: number } | null = null;

/* After a trackpad swipe, the trackpad goes on sending a glide of sideways
   movement for a moment after the fingers lift. It belongs to the swipe just
   made, and is let go of (across the change to the new month, which it would
   otherwise nudge). A glide only ever slows; so once the movement has fallen
   away and then picks up again, or turns the other way, it is a new swipe,
   and counts, however soon it comes. */
let glide: { peak: number; low: number; sign: number } | null = null;
let glideEnds: number | undefined;
export function startGlide(dx: number) {
  glide = { peak: Math.abs(dx), low: Math.abs(dx), sign: Math.sign(dx) };
  window.clearTimeout(glideEnds);
  glideEnds = window.setTimeout(() => (glide = null), 250);
}
/** Whether this sideways movement is the glide after a swipe (and to be let go of). */
export function inGlide(dx: number): boolean {
  if (!glide) return false;
  const m = Math.abs(dx);
  const fresh = (m > glide.low + 3 && glide.low < glide.peak * 0.5) || (Math.sign(dx) !== glide.sign && m > 3);
  if (fresh) {
    glide = null;
    return false;
  }
  glide.peak = Math.max(glide.peak, m);
  glide.low = Math.min(glide.low, m);
  window.clearTimeout(glideEnds);
  glideEnds = window.setTimeout(() => (glide = null), 250);
  return true;
}

/* A swipe made while the month before it is still opening: carried out as
   soon as that month arrives, so two quick swipes go two months. */
let queued: -1 | 1 | null = null;

/* How far the trackpad swipe under way has gone. Kept here, not in the page,
   so that a swipe begun while one month gives way to the next is counted in
   full by the new one. */
const wheel: { dx: number; rest?: number } = { dx: 0 };

export function MonthSwipe({
  prev,
  next,
  before,
  after,
  colours,
  children,
}: {
  prev: string | null;
  next: string | null;
  before: ReactNode;
  after: ReactNode;
  colours: [string, string];
  children: ReactNode;
}) {
  const router = useRouter();
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number; t: number; along: boolean | null } | null>(null);
  const going = useRef(false);

  useEffect(() => {
    if (prev) router.prefetch(prev);
    if (next) router.prefetch(next);
  }, [router, prev, next]);

  // how far the calendar follows: all the way towards a month that is there;
  // towards the end of the cycle, only a little, harder the further you pull
  const follow = (dx: number) => ((dx > 0 ? prev : next) ? dx : Math.sign(dx) * 40 * (1 - Math.exp(-Math.abs(dx) / 120)));

  // The new month has arrived in the middle. Before it is drawn: the track
  // back, unseen; the calendar where the last one stood (whatever the height
  // of the new month's heading above it); and the rest of the page starting as
  // dim as it was left, to come back up gently, not all at once.
  useLayoutEffect(() => {
    going.current = false;
    const el = track.current;
    if (el) {
      el.style.transition = "none";
      el.style.transform = "";
    }
    const page = outer.current?.closest(".month-page");
    page?.classList.remove("month-leaving");
    if (!swipedFrom || !outer.current || !page) return;
    const dy = outer.current.getBoundingClientRect().top - swipedFrom.top;
    if (Math.abs(dy) > 0.5) window.scrollBy({ top: dy, behavior: "instant" });
    swipedFrom = null;
    page.classList.add("month-arriving");
    requestAnimationFrame(() => requestAnimationFrame(() => page.classList.remove("month-arriving")));
  }, [prev, next]);

  // a swipe that came while this month was on its way
  useEffect(() => {
    if (!queued) return;
    const way = queued;
    queued = null;
    const t = window.setTimeout(() => latest.current(way), 60);
    return () => window.clearTimeout(t);
  }, [prev, next]);

  const slide = (x: string, settle: boolean) => {
    const el = track.current;
    if (!el) return;
    el.style.transition = settle ? "transform 0.32s cubic-bezier(0.2, 0.7, 0.3, 1)" : "none";
    el.style.transform = x ? `translateX(${x})` : "";
  };

  // On to the month beside: -1 the one before, 1 the one after.
  const latest = useRef<(way: -1 | 1) => void>(() => {});
  const go = (way: -1 | 1) => {
    if (going.current) return;
    const to = way > 0 ? next : prev;
    if (!to) return slide("", true); // the end of the cycle: back into place
    going.current = true;
    swipedFrom = { top: outer.current?.getBoundingClientRect().top ?? 0 };
    slide(way > 0 ? "calc(-100% - 24px)" : "calc(100% + 24px)", true);
    const page = outer.current?.closest<HTMLElement>(".month-page");
    if (page) {
      page.style.setProperty("--mt", way > 0 ? colours[1] : colours[0]);
      page.classList.add("month-leaving");
    }
    window.setTimeout(() => router.push(to, { scroll: false }), 300);
  };
  latest.current = go;

  // A two-finger swipe on a trackpad arrives as sideways scrolling. It follows
  // the fingers; past a fifth of the width it goes on by itself (whatever the
  // fingers do after); if it stops short, it springs back. The glide a
  // trackpad adds after the fingers lift is let go of, so one swipe is one month.
  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const across = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!wheel.dx && !across) return; // up and down: the page scrolls
      e.preventDefault(); // and not the browser's own back and forward
      if (inGlide(e.deltaX)) return; // the glide after a swipe
      const width = track.current?.offsetWidth ?? 600;
      wheel.dx = Math.max(-width, Math.min(width, wheel.dx - e.deltaX));
      window.clearTimeout(wheel.rest);
      if (Math.abs(wheel.dx) > width / 5) {
        const way = wheel.dx < 0 ? 1 : -1;
        wheel.dx = 0;
        startGlide(e.deltaX);
        if (going.current) queued = way; // the month before is still opening
        else go(way);
        return;
      }
      if (going.current) {
        // gathering a swipe for when it arrives; one that stops short is dropped
        wheel.rest = window.setTimeout(() => (wheel.dx = 0), 220);
        return;
      }
      slide(`${follow(wheel.dx)}px`, false);
      wheel.rest = window.setTimeout(() => {
        wheel.dx = 0;
        slide("", true);
      }, 220);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prev, next]);

  const onTouchStart = (e: TouchEvent) => {
    if (going.current) return;
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY, t: Date.now(), along: null };
  };
  const onTouchMove = (e: TouchEvent) => {
    const s = start.current;
    if (!s) return;
    const t = e.touches[0];
    const dx = t.clientX - s.x, dy = t.clientY - s.y;
    // decide once, after a little movement: a swipe across, or a scroll
    if (s.along === null && Math.hypot(dx, dy) > 8) s.along = Math.abs(dx) > Math.abs(dy) * 1.2;
    if (s.along) slide(`${follow(dx)}px`, false); // with the finger, one to one
  };
  const onTouchEnd = (e: TouchEvent) => {
    const s = start.current;
    start.current = null;
    if (!s?.along) return;
    const dx = e.changedTouches[0].clientX - s.x;
    const width = track.current?.offsetWidth ?? 360;
    const flick = Math.abs(dx) / Math.max(1, Date.now() - s.t) > 0.5 && Math.abs(dx) > 30;
    if (Math.abs(dx) < width / 3 && !flick) return slide("", true); // back into place
    go(dx < 0 ? 1 : -1);
  };

  return (
    <div ref={outer} className="month-swipe">
      <div
        ref={track}
        className="swipe-track"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={() => {
          start.current = null;
          if (!going.current) slide("", true);
        }}
      >
        {before && (
          <div className="swipe-beside before" aria-hidden="true" inert>
            {before}
          </div>
        )}
        {children}
        {after && (
          <div className="swipe-beside after" aria-hidden="true" inert>
            {after}
          </div>
        )}
      </div>
    </div>
  );
}
