"use client";

import { useLayoutEffect, type RefObject } from "react";

/** A bar of filters or dropdowns (.filter-bar-line) kept to one line: its
    spacing, then its letters, made smaller (its --fb, see site.css) until it
    fits, no smaller than two thirds; past that, a long choice ends in ….
    Measured again whenever the screen changes size, or `again` does (what
    the bar shows). Used by components/FilterBar and components/DropBand. */
export function useOneLine(line: RefObject<HTMLElement | null>, again: unknown) {
  useLayoutEffect(() => {
    const el = line.current;
    if (!el) return;
    let width = -1;
    // whether its items, at full length, with the gaps between them, are
    // wider than the line (to the fraction of a pixel, and a pixel to spare)
    const over = () => {
      const items = [...el.children].filter((c) => getComputedStyle(c).display !== "none");
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      const used = items.reduce((sum, c) => sum + c.getBoundingClientRect().width, 0) + gap * Math.max(0, items.length - 1);
      return used > el.clientWidth - 1;
    };
    const size = () => {
      width = el.clientWidth;
      if (!width) return; // not shown just now (the Calendar's band, on a phone)
      // measured at full length (nothing cut short), then let go
      el.classList.add("measuring");
      let s = 1;
      el.style.setProperty("--fb", "1");
      while (over() && s > 0.67) {
        s = Math.round((s - 0.03) * 100) / 100;
        el.style.setProperty("--fb", String(s));
      }
      el.classList.remove("measuring");
    };
    size();
    const ro = new ResizeObserver(() => el.clientWidth !== width && size());
    ro.observe(el);
    document.fonts?.ready.then(size);
    return () => ro.disconnect();
  }, [line, again]);
}
