import Link from "next/link";
import type { ReactNode } from "react";
import { WRITINGS_TA } from "@/content/writingsTa";

/** Writings: the two tabs under the title on the Field Notes and Articles
    pages, each a page of its own at its own address; the title and the tabs
    stay where they are in going from one to the other. `children`: what sits
    at the right of their line (the Field Notes search). */
export function WritingsTabs({ current, searching, children, ta = false }: { current: "field-notes" | "articles"; searching?: boolean; children?: ReactNode; /** on the Tamil page */ ta?: boolean }) {
  return (
    <div className={searching ? "writings-tabs searching" : "writings-tabs"}>
      <nav aria-label={ta ? WRITINGS_TA.title : "Writings"}>
        <Link href={ta ? "/ta/field-notes" : "/field-notes"} className={current === "field-notes" ? "active" : undefined} aria-current={current === "field-notes" ? "page" : undefined}>
          {ta ? WRITINGS_TA.notes : "Field Notes"}
        </Link>
        <Link href="/articles" className={current === "articles" ? "active" : undefined} aria-current={current === "articles" ? "page" : undefined}>
          {ta ? WRITINGS_TA.articles : "Articles"}
        </Link>
      </nav>
      {children}
    </div>
  );
}
