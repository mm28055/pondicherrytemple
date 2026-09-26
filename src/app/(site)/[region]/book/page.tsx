import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBook, getRegion, getRegions, getSectionIntro } from "@/lib/data";

type Props = { params: Promise<{ region: string }> };

export async function generateStaticParams() {
  const out: { region: string }[] = [];
  for (const r of await getRegions()) if (await getBook(r.id)) out.push({ region: r.id });
  return out;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await getRegion((await params).region);
  return r ? { title: `The book: the temples of ${r.name}` } : {};
}

export default async function BookPage({ params }: Props) {
  const regionId = (await params).region;
  const region = await getRegion(regionId);
  const book = await getBook(regionId);
  if (!region || !book) notFound();

  return (
    <div className="wrap">
      <header className="page-head">
        <div className="kicker">
          {region.name} · {book.status}
        </div>
        <h1 className="page-title">The Book</h1>
        <p className="page-lede">{await getSectionIntro("books")}</p>
        <div className="credits">
          <span>
            By <b>{book.byline}</b>
          </span>
          <span>
            Illustrations by <b>{book.illustrations}</b>
          </span>
          <span>Centre for Shaiva Studies</span>
        </div>
      </header>

      <section className="section">
        <ol className="book-parts">
          {book.parts.map((p) => (
            <li key={p.title} className="reveal">
              <div>
                <h2>{p.title}</h2>
                <p>{p.summary}</p>
                {p.link && (
                  <Link className="arrow-link" href={p.link.href}>
                    {p.link.label}
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
        <p className="note-line" style={{ marginTop: 28, maxWidth: "40em" }}>
          Much of what the book draws on appears here first, as field notes and temple and festival
          pages — and much that the book has no room for will live here too.
        </p>
      </section>
    </div>
  );
}
