"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { PAGE_NAMES_EVENT, pageName } from "@/components/PageNames";

type Entry = { url: string | null; key: string; index: number };
type Navigation = { currentEntry: Entry | null; entries: () => Entry[]; traverseTo: (key: string) => unknown };

/** The page of this site this one was come to from, in the tab's history
    (passing over places within this page: #photographs, a photograph
    opened), if the browser tells (the Navigation API). */
function cameFrom(): { key: string; path: string } | null {
  const nav = (window as unknown as { navigation?: Navigation }).navigation;
  const here = nav?.currentEntry;
  if (!nav || !here) return null;
  const now = window.location.pathname;
  for (const x of nav.entries().filter((e) => e.index < here.index).reverse()) {
    if (!x.url) return null;
    const u = new URL(x.url);
    if (u.origin !== window.location.origin) return null;
    if (u.pathname !== now) return { key: x.key, path: u.pathname };
  }
  return null;
}

/** The link at the top of a page: back to the page of this site it was come
    to from, named as that page is ("← Kannika Parameswari Koyil"), as the
    browser's Back would (and so where that page was scrolled to: see
    LandAtTop); from anywhere else, or opened by itself, to `href`, in its
    own words ("← Field notes"). Once the page is scrolled past it, the same
    way back is in the site's header, a round arrow and the page's name
    beside the wordmark (Nav's #nav-back; site.css, .nav-back). */
export function BackLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const pathname = usePathname();
  const own = useRef<HTMLAnchorElement>(null);
  const [floating, setFloating] = useState(false);
  const [back, setBack] = useState<{ key: string; path: string; name?: string } | null>(null);
  // its own words, without the arrow ("Field notes"), for the header when it goes to `href`
  const [ownWords, setOwnWords] = useState("");
  useEffect(() => setOwnWords((own.current?.textContent ?? "").replace(/^\s*←\s*/, "")), []);

  // where it goes back to, and that page's name (once known)
  useEffect(() => {
    const find = () => {
      const b = cameFrom();
      setBack(b ? { ...b, name: pageName(b.path) } : null);
    };
    find();
    window.addEventListener(PAGE_NAMES_EVENT, find);
    return () => window.removeEventListener(PAGE_NAMES_EVENT, find);
  }, [pathname]);

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
    const b = cameFrom();
    if (!b) return;
    e.preventDefault();
    (window as unknown as { navigation: Navigation }).navigation.traverseTo(b.key);
  };
  const words = back?.name ? <>← {back.name}</> : children;
  const to = back ? back.path : href;
  // in the header: its words without the arrow (the round button is the arrow)
  const name = back?.name ?? ownWords;
  // the header's slot holds it all along, folded away; it opens, smoothly,
  // once the page is scrolled past the link above (site.css, .nav-back.shown)
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => setSlot(document.getElementById("nav-back")), []);
  useEffect(() => {
    if (!slot) return;
    // it opens to its own width exactly, so the slide is even all the way
    const link = slot.firstElementChild as HTMLElement | null;
    if (link) slot.style.setProperty("--open-w", `${link.scrollWidth}px`);
    slot.classList.toggle("shown", floating);
    return () => slot.classList.remove("shown");
  }, [slot, floating, name]);
  return (
    <>
      <Link ref={own} className={className} href={to} onClick={onClick}>
        {words}
      </Link>
      {slot &&
        createPortal(
          <Link className="nav-back-link" href={to} onClick={onClick} title={name} tabIndex={floating ? undefined : -1} aria-hidden={!floating}>
            <span className="nav-back-arrow" aria-hidden="true">
              ←
            </span>
            <span className="nav-back-name">{name}</span>
          </Link>,
          slot
        )}
    </>
  );
}
