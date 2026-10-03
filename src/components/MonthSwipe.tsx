"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode, type TouchEvent } from "react";

/** On a phone, a month's calendar is swiped to the month either side: left
    for the next, right for the one before. The months either side wait just
    off the screen (`before`, `after`), and the three move together with the
    finger, so the next month slides in as this one slides out. Let go past a
    third of the way, or with a flick, and it carries on and the new month
    opens, where you are on the page; otherwise it springs back. Up-and-down
    movements are left to the page's own scrolling. (On a computer the
    neighbours are hidden, and the arrows beside the calendar do this.) */
export function MonthSwipe({
  prev,
  next,
  before,
  after,
  children,
}: {
  prev: string;
  next: string;
  before: ReactNode;
  after: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const track = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number; t: number; along: boolean | null } | null>(null);
  const going = useRef(false);

  useEffect(() => {
    router.prefetch(prev);
    router.prefetch(next);
  }, [router, prev, next]);

  // the new month has arrived in the middle: put the track back, unseen
  useEffect(() => {
    going.current = false;
    const el = track.current;
    if (el) {
      el.style.transition = "none";
      el.style.transform = "";
    }
  }, [prev, next]);

  const slide = (x: string, settle: boolean) => {
    const el = track.current;
    if (!el) return;
    el.style.transition = settle ? "transform 0.3s cubic-bezier(0.2, 0.7, 0.3, 1)" : "none";
    el.style.transform = x ? `translateX(${x})` : "";
  };

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
    if (s.along) slide(`${dx}px`, false); // with the finger, one to one
  };
  const onTouchEnd = (e: TouchEvent) => {
    const s = start.current;
    start.current = null;
    if (!s?.along) return;
    const dx = e.changedTouches[0].clientX - s.x;
    const width = track.current?.offsetWidth ?? 360;
    const flick = Math.abs(dx) / Math.max(1, Date.now() - s.t) > 0.5 && Math.abs(dx) > 30;
    if (Math.abs(dx) < width / 3 && !flick) return slide("", true); // back into place
    going.current = true;
    // carry on to the month beside (a gap of 24px between them), then open it
    slide(dx < 0 ? "calc(-100% - 24px)" : "calc(100% + 24px)", true);
    window.setTimeout(() => router.push(dx < 0 ? next : prev, { scroll: false }), 280);
  };

  return (
    <div className="month-swipe">
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
        <div className="swipe-beside before" aria-hidden="true" inert>
          {before}
        </div>
        {children}
        <div className="swipe-beside after" aria-hidden="true" inert>
          {after}
        </div>
      </div>
    </div>
  );
}
