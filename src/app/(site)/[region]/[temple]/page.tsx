import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArticlesForTemple,
  getFieldNotesForTemple,
  getFilmsForTemple,
  getIllustrationsForTemple,
  getObservancesForTemple,
  getOccasionsForTemple,
  getRegion,
  getRegions,
  getTemple,
  getTempleEntries,
  getTemples,
  getTemplesWithPages,
  hasPage,
} from "@/lib/data";
import { Html } from "@/components/Prose";
import { DEITY_GROUP_LABELS } from "@/content/labels";
import { articleRow, filmTile, noteRow, templesOf } from "@/lib/view";
import { Drawings, drawingsInColumn } from "@/components/Drawings";
import { Entries } from "@/components/Entries";
import { FilmWall } from "@/components/FilmWall";
import { NoteRow } from "@/components/Rows";
import { YearSoFar } from "@/components/YearSoFar";

type Props = { params: Promise<{ region: string; temple: string }> };

// Temples with pages are built ahead; one given an introduction later gets
// its page on the first visit. The rest are listed on the region page.
export async function generateStaticParams() {
  const out: { region: string; temple: string }[] = [];
  for (const r of await getRegions()) {
    for (const t of await getTemplesWithPages(r.id)) out.push({ region: r.id, temple: t.id });
  }
  return out;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region, temple } = await params;
  const t = await getTemple(region, temple);
  return t ? { title: t.knownAs ?? t.name, description: t.introText } : {};
}

export default async function TemplePage({ params }: Props) {
  const { region: regionId, temple: templeId } = await params;
  const region = await getRegion(regionId);
  const t = await getTemple(regionId, templeId);
  if (!region || !t || !t.intro || !hasPage(t)) notFound();

  const allTemples = await getTemples(region.id);
  const occasions = await getOccasionsForTemple(region.id, t.id);
  const observances = await getObservancesForTemple(region.id, t.id);
  const notes = (await getFieldNotesForTemple(region.id, t.id)).map((n) =>
    noteRow(n, allTemples, region.calendar)
  );
  const articles = (await getArticlesForTemple(t.id)).map((a) => articleRow(a, region.calendar));
  const films = (await getFilmsForTemple(region.id, t.id)).map((f) => filmTile(f, allTemples));
  const drawings = await getIllustrationsForTemple(region.id, t.id);
  const inColumn = drawingsInColumn(drawings);
  const aboutPlace = await getTempleEntries(region.id, t.id, "temple");
  const aboutPeople = await getTempleEntries(region.id, t.id, "people");

  return (
    <div className="wrap">
      <header className="page-head">
        <Link className="crumb" href={`/${region.id}`}>
          ← {templesOf(region.name)}
        </Link>
        <h1 className="temple-title">{t.knownAs ?? t.name}</h1>
        <div className="temple-facts caps">
          {t.knownAs && <span>{t.name}</span>}
          <span>{DEITY_GROUP_LABELS[t.group]}</span>
          {t.street && <span>{t.street}</span>}
        </div>
      </header>

      {!inColumn && <Drawings items={drawings} />}

      <div className="two-col">
        <div className="stack">
          {inColumn && <Drawings items={drawings} />}

          <Html className="prose" html={t.intro} />

          {films.length > 0 && (
            <section>
              <h2 className="sub-head">Films</h2>
              <FilmWall tiles={films} />
            </section>
          )}

          {aboutPlace.length > 0 && <Entries title="The temple" entries={aboutPlace} />}
          {aboutPeople.length > 0 && <Entries title="The people" entries={aboutPeople} />}

          {observances.length > 0 && (
            <section>
              <h2 className="sub-head">Festivals &amp; rituals seen here</h2>
              <div className="tag-grid">
                {observances.map((o) => (
                  <Link key={o.id} href={`/festivals-and-rituals/${o.id}`}>
                    <span className="t" lang="ta">
                      {o.tamil ?? o.name}
                    </span>
                    <span className="caps">{o.name}</span>
                  </Link>
                ))}
              </div>
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
          <h2 className="sub-head">The year so far</h2>
          <p className="note-line" style={{ marginBottom: 18 }}>
            What we have been present for, month by month. By the end of the year, this is the
            temple&apos;s ritual calendar.
          </p>
          <div className="side-scroll">
            <YearSoFar occasions={occasions} calendar={region.calendar} />
          </div>
        </aside>
      </div>
    </div>
  );
}
