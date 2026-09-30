import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArticlesForObservance,
  getFieldNotesForObservance,
  getFilmsForObservance,
  getIllustrationsForObservance,
  getObservance,
  getObservances,
  getPhotosForObservance,
  getOccasionsForObservance,
  getRegion,
  getTemple,
  getTemples,
  hasPage,
} from "@/lib/data";
import { dateParts } from "@/lib/calendar";
import { articleRow, filmTile, noteRow } from "@/lib/view";
import { Drawings, drawingsInColumn } from "@/components/Drawings";
import { FilmWall } from "@/components/FilmWall";
import { PhotoWall } from "@/components/PhotoWall";
import { Html } from "@/components/Prose";
import { NoteRow } from "@/components/Rows";
import type { Occasion, Temple } from "@/content/types";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return (await getObservances()).map((o) => ({ id: o.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const o = await getObservance((await params).id);
  return o ? { title: o.name, description: `${o.name} — ${o.gloss}.` } : {};
}

export default async function ObservancePage({ params }: Props) {
  const o = await getObservance((await params).id);
  if (!o) notFound();

  // Festival pages are not tied to a region; rows are labelled with each
  // note's own region calendar. Pondicherry is the only region today.
  const region = (await getRegion("pondicherry"))!;
  const temples = await getTemples(region.id);

  const notes = (await getFieldNotesForObservance(o.id)).map((n) => noteRow(n, temples, region.calendar));
  const articles = (await getArticlesForObservance(o.id)).map((a) => articleRow(a, region.calendar));
  const films = (await getFilmsForObservance(o.id)).map((f) => filmTile(f, temples));
  const drawings = await getIllustrationsForObservance(o.id);
  const photos = await getPhotosForObservance(o.id);

  // Where we've seen it: occasions grouped by temple, in the order first seen
  const groups: { temple: Temple; items: Occasion[] }[] = [];
  for (const occ of await getOccasionsForObservance(o.id)) {
    const t = await getTemple(occ.region, occ.temple);
    if (!t) continue;
    const g = groups.find((x) => x.temple.region === t.region && x.temple.id === t.id);
    if (g) g.items.push(occ);
    else groups.push({ temple: t, items: [occ] });
  }

  const inColumn = drawingsInColumn(drawings);
  const hasMain = Boolean(o.about?.length || films.length || photos.length || notes.length || articles.length || inColumn);

  const seenHead = <h2 className="sub-head">Where we&apos;ve seen it</h2>;
  const seenList = (
    <ul className="seen">
      {groups.map(({ temple: t, items }) => (
        <li key={`${t.region}/${t.id}`}>
          {hasPage(t) ? (
            <Link className="where" href={`/${t.region}/${t.id}`}>
              {t.knownAs ?? t.name}
            </Link>
          ) : (
            <span className="where">{t.knownAs ?? t.name}</span>
          )}
          <ul className="when">
            {items.map((i) => {
              const d = dateParts(i.date);
              return (
                <li key={i.date + i.label}>
                  <time dateTime={i.date}>
                    {d.day} {d.shortMonth} {d.year}
                  </time>
                  {i.label}
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="wrap">
      <header className="page-head">
        <Link className="crumb" href="/festivals-and-rituals">
          ← Festivals &amp; rituals
        </Link>
        <div className="kicker">{o.kind === "festival" ? "Festival" : "Ritual"}</div>
        {o.tamil && (
          <p className="tamil-title" lang="ta">
            {o.tamil}
          </p>
        )}
        <h1 className="name-title">
          {o.name}
          {o.alsoKnownAs && <span style={{ fontStyle: "normal", color: "var(--muted)" }}> · {o.alsoKnownAs}</span>}
        </h1>
        <p className="gloss kicker">{o.gloss}</p>
      </header>

      {!inColumn && <Drawings items={drawings} />}

      {hasMain ? (
        <div className="two-col">
          <div className="stack">
            {inColumn && <Drawings items={drawings} />}

            {o.about && o.about.length > 0 && (
              <section>
                <h2 className="sub-head" style={{ marginBottom: 20 }}>
                  About
                </h2>
                <dl className="qa">
                  {o.about.map((x) => (
                    <div key={x.q}>
                      <dt className="kicker">{x.q}</dt>
                      <dd>
                        <Html html={x.a} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {films.length > 0 && (
              <section>
                <h2 className="sub-head">Films</h2>
                <FilmWall tiles={films} />
              </section>
            )}

            {photos.length > 0 && (
              <section>
                <h2 className="sub-head">Photographs</h2>
                <PhotoWall photos={photos} layout="lead" seeAll={`/festivals-and-rituals/${o.id}/photographs`} />
              </section>
            )}

            {notes.length > 0 && (
              <section>
                <h2 className="sub-head">Field notes</h2>
                {notes.map((r) => (
                  <NoteRow key={r.id} row={r} />
                ))}
              </section>
            )}

            {articles.length > 0 && (
              <section>
                <h2 className="sub-head">Articles</h2>
                {articles.map((r) => (
                  <NoteRow key={r.id} row={r} />
                ))}
              </section>
            )}
          </div>
          <aside className="side-sticky">
            {seenHead}
            <div className="side-scroll">{seenList}</div>
          </aside>
        </div>
      ) : (
        <section className="section">
          {seenHead}
          {seenList}
        </section>
      )}
    </div>
  );
}
