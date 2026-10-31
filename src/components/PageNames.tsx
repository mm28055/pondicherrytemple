"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const KEY = "sthalam-page-names";

/** The name of each page of the site seen in this tab, by its address: its
    title without " — Sthalam" ("Kannika Parameswari Koyil"); the home page,
    "Home". For the link back at the top of a page, which names the page it
    returns to (BackLink). Kept for the tab's session only. */
export function PageNames() {
  const pathname = usePathname();
  useEffect(() => {
    const keep = () => {
      const t = document.title.trim();
      const name = /^Sthalam\b/.test(t) ? "Home" : t.replace(/\s+—\s+Sthalam$/, "");
      if (!name) return;
      try {
        const all = JSON.parse(sessionStorage.getItem(KEY) || "{}") as Record<string, string>;
        if (all[pathname] === name) return;
        all[pathname] = name;
        sessionStorage.setItem(KEY, JSON.stringify(all));
        window.dispatchEvent(new Event(KEY));
      } catch {
        // storage refused: the link keeps its own words
      }
    };
    keep();
    // the title is put in after the page itself, when going from page to page
    const title = document.querySelector("title");
    const mo = title ? new MutationObserver(keep) : null;
    if (title && mo) mo.observe(title, { childList: true, characterData: true, subtree: true });
    const later = window.setTimeout(keep, 600);
    return () => {
      mo?.disconnect();
      window.clearTimeout(later);
    };
  }, [pathname]);
  return null;
}

/** A page's name, if it has been seen in this tab. */
export function pageName(path: string): string | undefined {
  try {
    return (JSON.parse(sessionStorage.getItem(KEY) || "{}") as Record<string, string>)[path];
  } catch {
    return undefined;
  }
}
export const PAGE_NAMES_EVENT = KEY;
