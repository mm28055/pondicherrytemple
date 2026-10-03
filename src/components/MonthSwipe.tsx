"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode, type TouchEvent } from "react";

/** On a phone, a month's calendar is swiped to the month either side: left
    for the next, right for the one before. The calendar follows the finger a
    little as it goes, so the swipe is felt; short or mostly-up-and-down
    movements are left to the page's own scrolling. The new month opens where
    you are on the page, as the arrows do (on a computer, the arrows stay). */
export function MonthSwipe({ prev, next, children }: { prev: string; next: string; children: ReactNode }) {
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number; along: boolean | null } | null>(null);

  useEffect(() => {
    router.prefetch(prev);
    router.prefetch(next);
  }, [router, prev, next]);

  const move = (dx: number, settle = false) => {
    const el = box.current;
    if (!el) return;
    el.style.transition = settle ? "transform 0.25s ease, opacity 0.25s ease" : "none";
    el.style.transform = dx ? `translateX(${dx}px)` : "";
  };

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY, along: null };
  };
  const onTouchMove = (e: TouchEvent) => {
    const s = start.current;
    if (!s) return;
    const t = e.touches[0];
    const dx = t.clientX - s.x, dy = t.clientY - s.y;
    // decide once, after a little movement: a swipe across, or a scroll
    if (s.along === null && Math.hypot(dx, dy) > 10) s.along = Math.abs(dx) > Math.abs(dy) * 1.2;
    if (s.along) move(dx * 0.35);
  };
  const onTouchEnd = (e: TouchEvent) => {
    const s = start.current;
    start.current = null;
    if (!s?.along) return;
    const dx = e.changedTouches[0].clientX - s.x;
    if (Math.abs(dx) < 60) return move(0, true); // not far enough: back into place
    const el = box.current;
    if (el) {
      move(dx > 0 ? 80 : -80, true);
      el.style.opacity = "0.4";
    }
    router.push(dx < 0 ? next : prev, { scroll: false });
  };

  // a new month arrives in place
  useEffect(() => {
    const el = box.current;
    if (el) {
      el.style.transform = "";
      el.style.opacity = "";
    }
  });

  return (
    <div
      ref={box}
      className="month-swipe"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={() => {
        start.current = null;
        move(0, true);
      }}
    >
      {children}
    </div>
  );
}
