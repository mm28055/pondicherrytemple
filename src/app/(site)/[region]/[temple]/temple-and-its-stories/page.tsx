import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRegion, getTemple, getTempleStories, hasPage } from "@/lib/data";
import { ENTRY_TOPIC_LABELS } from "@/content/labels";
import { dateParts, localMonth } from "@/lib/calendar";
import { Html } from "@/components/Prose";
import { seesTempleStories } from "@/lib/festivals-access";

type Props = { params: Promise<{ region: string; temple: string }> };

// Held in reserve until published (lib/festivals): shown only to someone
// signed in to the admin, so decided on each visit, not built ahead.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region, temple } = await params;
  const t = await getTemple(region, temple);
  return t ? { title: `${t.knownAs ?? t.name}: the Temple & its Stories` } : {};
}

/** "The Temple & its Stories": everything written in the admin under
    "The temple & its people" for this temple — its histories, the place, its
    people, its stories and songs — in one list, newest first. Each piece
    shows its section above its title, its date beside it as field notes do,
    and its picture at the right (a placeholder until one is chosen in the admin). */
export default async function TempleStoriesPage({ params }: Props) {
  const { region: regionId, temple: templeId } = await params;
  const region = await getRegion(regionId);
  const t = await getTemple(regionId, templeId);
  if (!(await seesTempleStories())) notFound();
  if (!region || !t || !hasPage(t)) notFound();
  const pieces = await getTempleStories(region.id, t.id);
  if (!pieces.length) notFound();

  return (
    <div className="wrap">
      <header className="page-head tight-head">
        <Link className="crumb" href={`/${region.id}/${t.id}`}>
          ← Back to the temple
        </Link>
        <div className="stories-title">
          <h1 className="temple-title">The Temple &amp; its Stories</h1>
          <div className="kicker">{t.knownAs ?? t.name}</div>
        </div>
      </header>

      <div className="temple-stories">
        {pieces.map((e) => {
          const d = dateParts(e.date);
          const local = localMonth(region.calendar, e.date);
          return (
            <article key={e.id} className="story-row">
              <div className="date-stamp" aria-hidden="true">
                <span className="d">{d.day}</span>
                <span className="m">
                  {d.shortMonth} {d.year}
                </span>
                {local && <span className="t">{local}</span>}
              </div>
              <div>
                <div className="kicker">{ENTRY_TOPIC_LABELS[e.topic]}</div>
                <h2 className="story-title">{e.title}</h2>
                {e.named && <p className="entry-name caps">{e.named.name}</p>}
                <Html className="prose rich" html={e.body} />
              </div>
              {e.picture ? (
                <figure className="story-picture">
                  <img
                    src={e.picture.src}
                    width={e.picture.width}
                    height={e.picture.height}
                    alt={e.picture.alt}
                    loading="lazy"
                  />
                  {(e.picture.caption || e.picture.credit) && (
                    <figcaption>
                      {e.picture.caption}
                      {e.picture.caption && e.picture.credit && " · "}
                      {e.picture.credit}
                    </figcaption>
                  )}
                </figure>
              ) : (
                <div className="story-picture empty" aria-hidden="true">
                  <span className="caps">Photograph to come</span>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
