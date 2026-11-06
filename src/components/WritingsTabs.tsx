import Link from "next/link";
import type { ReactNode } from "react";

/** Writings: the two tabs under the title on the Field Notes and Articles
    pages, each a page of its own at its own address; the title and the tabs
    stay where they are in going from one to the other. `children`: what sits
    at the right of their line (the Field Notes search). */
export function WritingsTabs({ current, searching, children }: { current: "field-notes" | "articles"; searching?: boolean; children?: ReactNode }) {
  return (
    <div className={searching ? "writings-tabs searching" : "writings-tabs"}>
      <nav aria-label="Writings">
        <Link href="/field-notes" className={current === "field-notes" ? "active" : undefined} aria-current={current === "field-notes" ? "page" : undefined}>
          Field Notes
        </Link>
        <Link href="/articles" className={current === "articles" ? "active" : undefined} aria-current={current === "articles" ? "page" : undefined}>
          Articles
        </Link>
      </nav>
      {children}
    </div>
  );
}
