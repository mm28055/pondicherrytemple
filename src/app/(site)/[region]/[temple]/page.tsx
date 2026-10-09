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
  getPhotosForTemple,
  getRegion,
  getRegions,
  getTemple,
  getTempleStories,
  getTemples,
  getTemplesWithPages,
  getDummyPhotos,
  hasPage,
  isAround,
} from "@/lib/data";
import { Html } from "@/components/Prose";
import { articleRow, filmTile, noteRow, templesOf } from "@/lib/view";
import { Drawings } from "@/components/Drawings";
import { FilmWall } from "@/components/FilmWall";
import { PhotoWall } from "@/components/PhotoWall";
import { NoteRow } from "@/components/Rows";
import { YearSoFar } from "@/components/YearSoFar";
import { TempleLayout } from "@/components/TempleLayout";
import { FestivalLink } from "@/components/FestivalLink";
import { ReservedLink } from "@/components/ReservedLink";
import { TEMPLE_STORIES_PUBLISHED } from "@/lib/festivals";

type Props = { params: Promise<{ region: string; temple: string }> };

// Every temple's page is built ahead; a temple added later gets its page on
// the first visit.
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

/* A temple's page. The header: the name, and the temple's plan as a card at
   the right that hangs over the line below. Then two columns: on the left the
   introduction, a link to "The Temple and its Stories", field notes, photographs, films and articles;
   on the right the festivals and rituals seen here and the ritual year,
   newest first. (First designed on the Chetty Koil page, October 2026.) */
export default async function TemplePage({ params }: Props) {
  const { region: regionId, temple: templeId } = await params;
  const region = await getRegion(regionId);
  const t = await getTemple(regionId, templeId);
  if (!region || !t || !hasPage(t)) notFound();
  if (isAround(t)) return <AroundTemplePage regionId={region.id} regionName={region.name} templeId={t.id} />;

  const allTemples = await getTemples(region.id);
  const occasions = await getOccasionsForTemple(region.id, t.id);
  const observances = await getObservancesForTemple(region.id, t.id);
  const notes = (await getFieldNotesForTemple(region.id, t.id)).map((n) =>
    noteRow(n, allTemples, region.calendar)
  );
  const articles = (await getArticlesForTemple(t.id)).map((a) => articleRow(a, region.calendar));
  const films = (await getFilmsForTemple(region.id, t.id)).map((f) => filmTile(f, allTemples));
  const drawings = await getIllustrationsForTemple(region.id, t.id);
  const own = await getPhotosForTemple(region.id, t.id);
  // stand-ins until it has photographs of its own
  const photos = own.length ? own : await getDummyPhotos(t.id, 6);
  // Its histories, the place, its people, its stories and songs: on a page of their own.
  const hasStories = (await getTempleStories(region.id, t.id)).length > 0;
  const [plan, ...otherDrawings] = drawings;

  return (
    <div className="wrap">
      <header className="page-head temple-head">
        <div>
          <Link className="crumb" href={`/${region.id}`}>
            ← {templesOf(region.name)}
          </Link>
          <h1 className="temple-title">{t.knownAs ?? t.name}</h1>
          <div className="temple-facts caps">
            {t.knownAs && <span>{t.name}</span>}
            {t.street && <span>{t.street}</span>}
          </div>
        </div>
        {/* The temple's plan, turned on its side, hanging over the line below
            the header at the right of the right-hand column. */}
        {plan && (
          <div className="temple-head-drawing">
            <TempleLayout d={plan} />
          </div>
        )}
      </header>

      <div className={plan ? "two-col temple-body below-layout" : "two-col temple-body"}>
        <div className="stack">
          {/* its introduction (Admin → Temples); a note in its place until it is written */}
          {t.intro ? (
            <Html className="prose" html={t.intro} />
          ) : (
            <p className="note-line">An introduction to the temple is being written.</p>
          )}

          {hasStories && (
            // held in reserve until published: plain words, "(coming soon)", to the public
            <ReservedLink
              className="arrow-link"
              href={`/${region.id}/${t.id}/temple-and-its-stories`}
              published={TEMPLE_STORIES_PUBLISHED}
            >
              Explore the temple&apos;s history and stories
            </ReservedLink>
          )}

          {notes.length > 0 && (
            <section>
              <h2 className="sub-head">Field notes</h2>
              {notes.map((r) => (
                <NoteRow key={r.id} row={r} />
              ))}
            </section>
          )}

          {photos.length > 0 && (
            <section>
              <h2 className="sub-head">Photographs</h2>
              <PhotoWall photos={photos} layout="lead" seeAll={own.length ? `/${region.id}/${t.id}/photographs` : undefined} />
            </section>
          )}

          {films.length > 0 && (
            <section>
              <h2 className="sub-head">Films</h2>
              <FilmWall tiles={films} />
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

        {/* A column that scrolls with the page. */}
        <aside className="stack">
          {otherDrawings.length > 0 && <Drawings items={otherDrawings} />}

          {observances.length > 0 && (
            <section>
              <h2 className="sub-head">Festivals &amp; rituals seen here</h2>
              <div className="tag-grid">
                {observances.map((o) => (
                  <FestivalLink key={o.id} id={o.id}>
                    <span className="t" lang="ta">
                      {o.tamil ?? o.name}
                    </span>
                    <span className="caps">{o.name}</span>
                  </FestivalLink>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="sub-head">The Ritual Year</h2>
            <p className="note-line" style={{ marginBottom: 18 }}>
              What we have been present for, month by month. By the end of the year, this is the
              temple&apos;s ritual calendar.
            </p>
            <YearSoFar occasions={occasions} calendar={region.calendar} newestFirst />
          </section>
        </aside>
      </div>
    </div>
  );
}

/** A temple in and around the town: part of the story, not at the centre of
    the documentation. A simpler page, for now just its field notes,
    photographs and films (stand-in photographs until it has its own). To be
    designed. */
async function AroundTemplePage({ regionId, regionName, templeId }: { regionId: string; regionName: string; templeId: string }) {
  const t = (await getTemple(regionId, templeId))!;
  // the town these temples are around: its temples, for the notes' tags
  const town = regionId.replace(/^in-and-around-/, "");
  const townRegion = await getRegion(town);
  const allTemples = [...(await getTemples(town)), ...(await getTemples(regionId))];
  const notes = (await getFieldNotesForTemple(regionId, t.id)).map((n) =>
    noteRow(n, allTemples, townRegion?.calendar ?? "tamil")
  );
  const films = (await getFilmsForTemple(regionId, t.id)).map((f) => filmTile(f, allTemples));
  const own = await getPhotosForTemple(regionId, t.id);
  const photos = own.length ? own : await getDummyPhotos(t.id, 6);

  return (
    <div className="wrap">
      <header className="page-head">
        <Link className="crumb" href={`/${town}#${regionId}`}>
          ← {regionName}
        </Link>
        <h1 className="temple-title">{t.knownAs ?? t.name}</h1>
        <div className="temple-facts caps">
          {t.knownAs && <span>{t.name}</span>}
          {t.street && <span>{t.street}</span>}
        </div>
      </header>
      <div className="stack around-temple">
        {notes.length > 0 && (
          <section>
            <h2 className="sub-head">Field notes</h2>
            {notes.map((r) => (
              <NoteRow key={r.id} row={r} />
            ))}
          </section>
        )}
        <section>
          <h2 className="sub-head">Photographs</h2>
          <PhotoWall photos={photos} layout="lead" seeAll={own.length ? `/${regionId}/${t.id}/photographs` : undefined} />
        </section>
        {films.length > 0 && (
          <section>
            <h2 className="sub-head">Films</h2>
            <FilmWall tiles={films} />
          </section>
        )}
      </div>
    </div>
  );
}
