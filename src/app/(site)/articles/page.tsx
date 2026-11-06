import type { Metadata } from "next";
import Link from "next/link";
import { getArticles, getRegion, getSectionIntro } from "@/lib/data";
import { articleRow } from "@/lib/view";
import { NoteRow } from "@/components/Rows";
import { WritingsTabs } from "@/components/WritingsTabs";

export const metadata: Metadata = {
  title: "Articles",
  description: "Essays and longer writing on the temple — its forms, rituals, festivals and meaning.",
};

export default async function ArticlesPage() {
  const region = (await getRegion("pondicherry"))!;
  const articles = (await getArticles()).map((a) => articleRow(a, region.calendar));

  return (
    <div className="wrap">
      <header className="page-head landing-head">
        <div className="kicker">From the temples</div>
        <h1 className="page-title">Writings</h1>
        <WritingsTabs current="articles" />
        {!articles.length && <p className="coming-soon">Coming soon</p>}
        <p className="page-lede">
          {await getSectionIntro("articles")}
          {!articles.length && (
            <>
              {" "}
              The first articles are being prepared. Until then,{" "}
              <Link className="lede-link" href="/field-notes">
                the field notes are the place to start →
              </Link>
            </>
          )}
        </p>
      </header>
      <section className="section">
        {articles.map((r) => (
          <NoteRow key={r.id} row={r} />
        ))}
      </section>
    </div>
  );
}
