"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { KEEP_SCROLL, keepingScroll } from "@/lib/keepScroll";

/** Every page opened by a link starts at its very top, the site's header
    above it. (Next, following a link, scrolls the new page's own content to
    the top of the window, under the sticky header, hiding the page's top; on
    the site as built, it did not always scroll at all, and a temple's page
    opened as far down as the Temples page was.) Not:
    - going back or forward, where the browser returns to where the page was;
    - for a link to a place in a page (#ritual-year);
    - where a page is to stay where it is (the month calendar's steps, its
      dropdowns, a swipe: data-keep-scroll on a link, or keepScroll() before
      router.push, lib/keepScroll);
    - while a pop-up is open (a photo, which has its own address). */
export function LandAtTop() {
  const pathname = usePathname();
  const back = useRef(false);
  const first = useRef(true);
  useEffect(() => {
    const onPop = () => (back.current = true);
    // a link marked to keep the page where it is
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.(`a[${KEEP_SCROLL}]`)) keepingScroll(true);
    };
    window.addEventListener("popstate", onPop);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("click", onClick, true);
    };
  }, []);
  useEffect(() => {
    const kept = keepingScroll(false);
    if (first.current) {
      first.current = false; // the page as first loaded: the browser's own
      return;
    }
    if (back.current) {
      back.current = false;
      return;
    }
    if (kept || window.location.hash || document.querySelector("dialog[open]")) return;
    // on the next frame: after Next's own scroll, and after the browser has
    // kept where the page left was (so Back returns there; at once, or on a
    // timer, it would keep the top)
    const frame = requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);
  return null;
}
