import type { Metadata } from "next";
import { getFilms, getObservances, getRegion, getSectionIntro, getTemples } from "@/lib/data";
import { filmTile } from "@/lib/view";
import { FilmWall } from "@/components/FilmWall";

export const metadata: Metadata = {
  title: "Films",
  description: "Short films from the temples of Pondicherry, newest first.",
};

export default async function FilmsPage() {
  // Pondicherry's films and those filed under "In and around Pondicherry".
  const region = (await getRegion("pondicherry"))!;
  const around = await getRegion(`in-and-around-${region.id}`);
  const regionIds = [region.id, ...(around ? [around.id] : [])];
  const temples = (await Promise.all(regionIds.map((id) => getTemples(id)))).flat();
  const observances = await getObservances();
  const tiles = (await getFilms())
    .filter((f) => regionIds.includes(f.region))
    .map((f) => filmTile(f, temples));

  // one filter per temple or festival that actually has a film
  const count = (key: "temples" | "observances", id: string) => tiles.filter((t) => t[key].includes(id)).length;
  const filters = [
    ...temples.map((t) => ({ key: "temples" as const, id: t.id, label: t.knownAs ?? t.name })),
    ...observances.map((o) => ({ key: "observances" as const, id: o.id, label: o.name })),
  ]
    .map((f) => ({ ...f, count: count(f.key, f.id) }))
    .filter((f) => f.count > 0);

  return (
    <div className="wrap">
      <header className="page-head">
        <div className="kicker">From the temples</div>
        <h1 className="page-title">Films</h1>
        <p className="page-lede">{await getSectionIntro("films")}</p>
      </header>
      <section className="section" style={{ paddingTop: 12 }}>
        {tiles.length ? <FilmWall tiles={tiles} filters={filters} /> : <p className="empty">No films yet.</p>}
      </section>
    </div>
  );
}
