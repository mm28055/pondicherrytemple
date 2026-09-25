import type { Metadata } from "next";
import Link from "next/link";
import { getArticles, getRegion } from "@/lib/data";
import { articleRow } from "@/lib/view";
import { NoteRow } from "@/components/Rows";

export const metadata: Metadata = {
  title: "Articles",
  description: "Essays and longer writing on the temple — its forms, rituals, festivals and meaning.",
};

export default async function ArticlesPage() {
  const region = (await getRegion("pondicherry"))!;
  const articles = (await getArticles()).map((a) => articleRow(a, region.calendar));

  return (
    <div className="wrap">
      <header className="page-head">
        <div className="kicker">Writing</div>
        <h1 className="page-title">Articles</h1>
        <p className="page-lede">
          Essays and longer writing with a named author: on the temple, its festivals and rituals,
          and what they mean.
        </p>
      </header>
      <section className="section">
        {articles.length ? (
          articles.map((r) => <NoteRow key={r.id} row={r} />)
        ) : (
          <p className="empty">
            The first articles are being prepared. Until then, the{" "}
            <Link href="/field-notes" style={{ color: "var(--ochre)", borderBottom: "1px solid var(--ochre)" }}>
              field notes
            </Link>{" "}
            are the place to start.
          </p>
        )}
      </section>
    </div>
  );
}
