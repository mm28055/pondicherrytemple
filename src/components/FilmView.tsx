import { BackLink } from "@/components/BackLink";
import { FilmVideo } from "@/components/FilmVideo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFilm, getObservancesById, getRegion, getTemple, hasPage } from "@/lib/data";
import { formatDate, localDate } from "@/lib/calendar";
import { Html } from "@/components/Prose";
import { FestivalLink } from "@/components/FestivalLink";
import { titleFit } from "@/lib/titleFit";
import { FILMS_TA } from "@/content/aboutTa";
import { filmTextTa } from "@/content/filmsTa";
import { titleTa } from "@/content/notesTa";
import { tamilOf } from "@/lib/tamilPages";
import { dateTa, madeByTa, tamilDateOf, tamilTemple } from "@/lib/viewTa";

/** A film's own page; with `ta`, in Tamil (its words: content/filmsTa). */
export async function FilmView({ id, ta = false }: { id: string; ta?: boolean }) {
  const english = await getFilm(id);
  if (!english) notFound();
  const film = ta
    ? { ...english, title: titleTa(english.id, english.title), body: filmTextTa(english.id, english.body ?? "") ?? english.body, madeBy: madeByTa(english.madeBy) }
    : english;

  const region = (await getRegion(film.region))!;
  const temples = (await Promise.all(film.temples.map((id) => getTemple(film.region, id)))).filter(
    (t) => t !== null
  );
  const observances = await getObservancesById(film.observances);
  const local = ta ? tamilDateOf(film.date) : localDate(region.calendar, film.date);

  return (
    <div className={ta ? "wrap in-ta" : "wrap"} lang={ta ? "ta" : undefined}>
      <header className="note-head">
        <BackLink className="crumb" href={ta ? "/ta/films" : "/films"}>
          ← {ta ? FILMS_TA.title : "Films"}
        </BackLink>
        <div className="note-dateline">
          <time className="date" dateTime={film.date}>
            {ta ? dateTa(film.date) : formatDate(film.date)}
          </time>
          {local && <span className="local">{local}</span>}
        </div>
        <h1 className="note-title" style={titleFit(film.title)}>{film.title}</h1>
        <div className="note-meta caps">
          {temples.map((t) =>
            hasPage(t) ? (
              <Link key={t.id} href={(ta && tamilOf(`/${t.region}/${t.id}`)) || `/${t.region}/${t.id}`}>
                {ta ? tamilTemple(t).knownAs : (t.knownAs ?? t.name)}
              </Link>
            ) : (
              <span key={t.id}>{t.knownAs ?? t.name}</span>
            )
          )}
          {observances.map((o) => (
            <FestivalLink key={o.id} id={o.id}>
              {(ta && o.tamil) || o.name}
            </FestivalLink>
          ))}
          {film.madeBy && <span>{ta ? film.madeBy : `By ${film.madeBy}`}</span>}
        </div>
      </header>

      <div className="film">
        <FilmVideo controls playsInline preload="metadata" src={film.video.src} poster={film.video.poster} />
        <div>
          {film.body && <Html className="rich film-text" html={film.body} />}
          {film.instagram && (
            <a className="arrow-link" href={film.instagram} target="_blank" rel="noopener noreferrer">
              {ta ? "இன்ஸ்டாகிராமில்" : "On Instagram"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
