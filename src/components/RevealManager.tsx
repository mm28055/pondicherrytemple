"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/* Scroll-reveal for any element with class "reveal".
   Order matters: whatever is already on screen is marked visible FIRST,
   and only then does <html> get .reveal-ready (which hides the rest).
   So loaded content never blinks out; only offscreen content waits.
   Elements that appear later are taken in too, the same way: a festival's
   name, plain words at first, becomes a link once the visitor is known to be
   signed in (components/FestivalLink), and the link is a new element.
   Re-runs on every client-side navigation. */
export function RevealManager() {
  const pathname = usePathname();

  useEffect(() => {
    const all = () => Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.visible)"));

    if (!("IntersectionObserver" in window)) {
      const show = () => all().forEach((el) => el.classList.add("visible"));
      show();
      const mo = new MutationObserver(show);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.08 }
    );

    // on screen: shown at once; below: shown as it scrolls into view
    const take = (els: HTMLElement[]) => {
      const vh = window.innerHeight;
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) el.classList.add("visible");
        else io.observe(el);
      }
    };
    take(all());
    document.documentElement.classList.add("reveal-ready");

    // (a mutation is seen before the page is next painted, so a new element
    // on screen never shows hidden)
    const mo = new MutationObserver((records) => {
      const added = records.some((r) => Array.from(r.addedNodes).some((n) => n.nodeType === 1));
      if (added) take(all());
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
