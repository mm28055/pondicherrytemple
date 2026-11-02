"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { PAGE_NAMES_EVENT, pageName } from "@/components/PageNames";

type Entry = { url: string | null; key: string; index: number };
type Navigation = { currentEntry: Entry | null; entries: () => Entry[]; traverseTo: (key: string) => unknown };

/** The page of this site this one was come to from, in the tab's history
    (passing over places within this page: #photographs, a photograph
    opened), if the browser tells (the Navigation API); not the admin. With
    `to`, that page itself, the latest time it was in the tab's history. */
function cameFrom(to?: string): { key: string; path: string } | null {
  const nav = (window as unknown as { navigation?: Navigation }).navigation;
  const here = nav?.currentEntry;
  if (!nav || !here) return null;
  const now = window.location.pathname;
  for (const x of nav.entries().filter((e) => e.index < here.index).reverse()) {
    if (!x.url) return null;
    const u = new URL(x.url);
    if (u.origin !== window.location.origin) return null;
    if (to) {
      if (u.pathname === to) return { key: x.key, path: u.pathname };
      continue;
    }
    if (u.pathname.startsWith("/admin")) return null;
    if (u.pathname !== now) return { key: x.key, path: u.pathname };
  }
  return null;
}

/** The link at the top of a page: back to the page of this site it was come
    to from, named as that page is ("← Kannika Parameswari Koyil"), as the
    browser's Back would (and so where that page was scrolled to: see
    LandAtTop); from anywhere else, or opened by itself, to `href`, in its
    own words ("← Field notes"). With `always`, to `href` alone, in its own
    words, wherever it was come from (a month of the calendar, however many
    months were gone through: the Calendar), as it was if it is in the
    tab's history. Once the page is scrolled past it, the same link stays in
    sight, in a bar under the site's header (site.css, .crumb-float). */
export function BackLink({
  href,
  className,
  children,
  always = false,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  always?: boolean;
}) {
  const pathname = usePathname();
  const own = useRef<HTMLAnchorElement>(null);
  const [floating, setFloating] = useState(false);
  const [back, setBack] = useState<{ key: string; path: string; name?: string } | null>(null);
  // where it goes back to, and that page's name (once known)
  useEffect(() => {
    const find = () => {
      const b = cameFrom(always ? href : undefined);
      setBack(b ? { ...b, name: always ? undefined : pageName(b.path) } : null);
    };
    find();
    window.addEventListener(PAGE_NAMES_EVENT, find);
    return () => window.removeEventListener(PAGE_NAMES_EVENT, find);
  }, [pathname, always, href]);

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

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const b = cameFrom(always ? href : undefined);
    if (!b) return;
    e.preventDefault();
    (window as unknown as { navigation: Navigation }).navigation.traverseTo(b.key);
  };
  const words = back?.name ? <>← {back.name}</> : children;
  const to = back ? back.path : href;
  // with it out of sight, the bar under the header shown: a bar that stays under the
  // header too (the photographs' filters) moves below it (site.css, .crumb-floating)
  useEffect(() => {
    document.documentElement.classList.toggle("crumb-floating", floating);
    return () => document.documentElement.classList.remove("crumb-floating");
  }, [floating]);
  return (
    <>
      <Link ref={own} className={className} href={to} onClick={onClick}>
        {words}
      </Link>
      {floating && (
        <div className="crumb-float">
          <div className="wrap">
            <Link className="crumb" href={to} onClick={onClick}>
              {words}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
