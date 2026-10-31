"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

type Entry = { url: string | null; key: string; index: number };
type Navigation = { currentEntry: Entry | null; entries: () => Entry[]; traverseTo: (key: string) => unknown };

/** The link at the top of a page ("← The temples of Pondicherry"): back to
    the page of this site it was come to from, as the browser's Back would
    (and so where that page was scrolled to: see LandAtTop), passing over the
    places within this page (#photographs, a photograph opened); from
    anywhere else, or opened by itself, to `href`. The browser's history is
    read where it can be (the Navigation API); where not, it is a plain link.
    Once the page is scrolled past it, the same link stays in sight, in a
    strip under the site's header (site.css, .crumb-float). */
export function BackLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const own = useRef<HTMLAnchorElement>(null);
  const [floating, setFloating] = useState(false);

  useEffect(() => {
    const el = own.current;
    if (!el) return;
    const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 0;
    // out of sight above, under the header: float it
    const io = new IntersectionObserver(([e]) => setFloating(!e.isIntersecting && e.boundingClientRect.top < nav), {
      rootMargin: `-${nav}px 0px 0px 0px`,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("crumb-floating", floating);
    return () => document.documentElement.classList.remove("crumb-floating");
  }, [floating]);

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const nav = (window as unknown as { navigation?: Navigation }).navigation;
    const here = nav?.currentEntry;
    if (!nav || !here) return;
    const page = (url: string | null) => {
      if (!url) return null;
      const u = new URL(url);
      return u.origin === window.location.origin ? u.pathname : null;
    };
    const now = window.location.pathname;
    const before = nav
      .entries()
      .filter((x) => x.index < here.index)
      .reverse()
      .find((x) => page(x.url) !== now);
    if (!before || page(before.url) === null) return;
    e.preventDefault();
    nav.traverseTo(before.key);
  };
  return (
    <>
      <Link ref={own} className={className} href={href} onClick={onClick}>
        {children}
      </Link>
      {floating && (
        <div className="crumb-float">
          <div className="wrap">
            <Link className="crumb" href={href} onClick={onClick}>
              {children}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
