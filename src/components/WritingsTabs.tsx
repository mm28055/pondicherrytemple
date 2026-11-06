import Link from "next/link";

/** Writings: the two tabs under the title on the Field Notes and Articles
    pages. Each is a page of its own at its own address; the title and the tabs
    stay where they are in going from one to the other. */
export function WritingsTabs({ current }: { current: "field-notes" | "articles" }) {
  return (
    <nav className="writings-tabs" aria-label="Writings">
      <Link href="/field-notes" className={current === "field-notes" ? "active" : undefined} aria-current={current === "field-notes" ? "page" : undefined}>
        Field Notes
      </Link>
      <Link href="/articles" className={current === "articles" ? "active" : undefined} aria-current={current === "articles" ? "page" : undefined}>
        Articles
      </Link>
    </nav>
  );
}
