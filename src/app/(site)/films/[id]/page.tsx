import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFilm, getFilms, getObservancesById, getRegion, getTemple, hasPage } from "@/lib/data";
import { formatDate, localMonth } from "@/lib/calendar";
import { Html } from "@/components/Prose";

type Props = { params: Promise<{ id: string }> };

// Films published later get their page on the first visit.
export async function generateStaticParams() {
  return (await getFilms()).map((f) => ({ id: f.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = await getFilm((await params).id);
  return f ? { title: f.title, description: f.excerpt || formatDate(f.date) } : {};
}

export default async function FilmPage({ params }: Props) {
  const film = await getFilm((await params).id);
  if (!film) notFound();

  const region = (await getRegion(film.region))!;
  const temples = (await Promise.all(film.temples.map((id) => getTemple(film.region, id)))).filter(
    (t) => t !== null
  );
  const observances = await getObservancesById(film.observances);
  const local = localMonth(region.calendar, film.date);

  return (
    <div className="wrap">
      <header className="note-head">
        <Link className="crumb" href="/films">
          ← Films
        </Link>
        <div className="note-dateline">
          <time className="date" dateTime={film.date}>
            {formatDate(film.date)}
          </time>
          {local && <span className="local">{local}</span>}
        </div>
        <h1 className="note-title">{film.title}</h1>
        <div className="note-meta caps">
          {temples.map((t) =>
            hasPage(t) ? (
              <Link key={t.id} href={`/${t.region}/${t.id}`}>
                {t.knownAs ?? t.name}
              </Link>
            ) : (
              <span key={t.id}>{t.knownAs ?? t.name}</span>
            )
          )}
          {observances.map((o) => (
            <Link key={o.id} href={`/festivals-and-rituals/${o.id}`}>
              {o.name}
            </Link>
          ))}
          {film.madeBy && <span>By {film.madeBy}</span>}
        </div>
      </header>

      <div className="film">
        <video controls playsInline preload="metadata" src={film.video.src} poster={film.video.poster} />
        <div>
          {film.body && <Html className="rich film-text" html={film.body} />}
          {film.instagram && (
            <a className="arrow-link" href={film.instagram} target="_blank" rel="noopener noreferrer">
              On Instagram
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
