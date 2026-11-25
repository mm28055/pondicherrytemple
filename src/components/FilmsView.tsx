import { IntroText } from "@/components/edit/IntroText";
import { getFilms, getObservances, getRegion, getSectionIntro, getTemples } from "@/lib/data";
import { filmTile, shortTempleName } from "@/lib/view";
import { FilmWall } from "@/components/FilmWall";
import { FilmTop } from "@/components/FilmTop";
import { FILMS_TA } from "@/content/aboutTa";
import { filmTileTa, nameOf } from "@/lib/viewTa";

export async function FilmsView({ ta = false }: { ta?: boolean }) {
  // in Tamil (/ta/films): its words from content/aboutTa and content/filmsTa
  const T = ta ? FILMS_TA : null;
  // Pondicherry's films and those filed under "In and around Pondicherry".
  const region = (await getRegion("pondicherry"))!;
  const around = await getRegion(`in-and-around-${region.id}`);
  const regionIds = [region.id, ...(around ? [around.id] : [])];
  const temples = (await Promise.all(regionIds.map((id) => getTemples(id)))).flat();
  const observances = await getObservances();
  const films = (await getFilms()).filter((f) => regionIds.includes(f.region));
  // the film marked for the top of the page, beside the opening words, and not in the grid as well
  const top = films.find((f) => f.top);
  const tileOf = (f: (typeof films)[number]) => (ta ? filmTileTa(f, temples) : filmTile(f, temples));
  const tiles = films.filter((f) => f !== top).map(tileOf);

  // one filter per temple or festival that actually has a film
  const count = (key: "temples" | "observances", id: string) => tiles.filter((t) => t[key].includes(id)).length;
  const filters = [
    ...temples.map((t) => ({ key: "temples" as const, id: t.id, label: ta ? nameOf(t) : shortTempleName(t), short: ta ? undefined : t.shortName })),
    ...observances.map((o) => ({ key: "observances" as const, id: o.id, label: (ta && o.tamil) || o.name })),
  ]
    .map((f) => ({ ...f, count: count(f.key, f.id) }))
    .filter((f) => f.count > 0);

  return (
    <div className={ta ? "wrap in-ta" : "wrap"} lang={ta ? "ta" : undefined}>
      <header className={`page-head landing-head${top ? " with-film" : ""}`}>
        <div className="kicker">{T?.kicker ?? "From the temples"}</div>
        <h1 className="page-title">{T?.title ?? "Films"}</h1>
        <p className="page-lede">{T ? T.intro : <IntroText name="films" />}</p>
        {top && <FilmTop film={tileOf(top)} ta={ta} />}
      </header>
      <section className="section">
        {tiles.length ? <FilmWall tiles={tiles} filters={filters} ta={ta} /> : <p className="empty">{T?.none ?? "No films yet."}</p>}
      </section>
    </div>
  );
}
