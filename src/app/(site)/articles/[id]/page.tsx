import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle, getArticles, getObservancesById, getTemple } from "@/lib/data";
import { formatDate } from "@/lib/calendar";
import { Html } from "@/components/Prose";

type Props = { params: Promise<{ id: string }> };

// Articles published later get their page on the first visit.
export async function generateStaticParams() {
  return (await getArticles()).map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getArticle((await params).id);
  return a ? { title: a.title, description: a.teaser } : {};
}

export default async function ArticlePage({ params }: Props) {
  const a = await getArticle((await params).id);
  if (!a) notFound();

  const temples = (await Promise.all(a.temples.map((id) => getTemple("pondicherry", id)))).filter(
    (t) => t !== null
  );
  const observances = await getObservancesById(a.observances);

  return (
    <>
      <div className="wrap">
        <header className="note-head">
          <Link className="crumb" href="/articles">
            ← Articles
          </Link>
          <div className="note-dateline">
            <time className="date" dateTime={a.date}>
              {formatDate(a.date)}
            </time>
          </div>
          <h1 className="note-title">{a.title}</h1>
          <div className="note-meta caps">
            <span>By {a.author}</span>
            {temples.map((t) => (
              <Link key={t.id} href={`/${t.region}/${t.id}`}>
                {t.knownAs ?? t.name}
              </Link>
            ))}
            {observances.map((o) => (
              <Link key={o.id} href={`/festivals-and-rituals/${o.id}`}>
                {o.name}
              </Link>
            ))}
          </div>
        </header>
      </div>
      <article className="note-body">{a.body && <Html className="rich" html={a.body} />}</article>
    </>
  );
}
