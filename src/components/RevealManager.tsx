"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/* Scroll-reveal for any element with class "reveal".
   Order matters: whatever is already on screen is marked visible FIRST,
   and only then does <html> get .reveal-ready (which hides the rest).
   So loaded content never blinks out; only offscreen content waits.
   Re-runs on every client-side navigation. */
export function RevealManager() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.visible)"));

    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("visible"));
      return;
    }

    const vh = window.innerHeight;
    const pending: HTMLElement[] = [];
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) el.classList.add("visible");
      else pending.push(el);
    }
    document.documentElement.classList.add("reveal-ready");

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
    pending.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
