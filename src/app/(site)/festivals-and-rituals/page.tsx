import type { Metadata } from "next";
import {
  countTemplesForObservance,
  getObservances,
  getOccasionsForObservance,
  getOrderedPhotosForObservance,
  getSectionIntro,
} from "@/lib/data";
import { observanceRow } from "@/lib/view";
import { ReservedLede, ReservedSoon } from "@/components/ReservedSoon";
import { ObservanceGallery } from "@/components/ObservanceGallery";

export const metadata: Metadata = {
  title: "Festivals & Rituals",
  description:
    "The festivals and rituals of the temples — each explained once, with every field note and article about it.",
};


/** The festivals and rituals, led by their photographs. Until their own pages
    are published (lib/festivals), that gallery is for someone signed in to the
    admin; the public sees their names listed A to Z, the festivals on the left,
    the rituals on the right, with "Coming soon" under the title (?as=public
    shows a team member that version). Built ahead, the same for everyone:
    whether the visitor is signed in is asked in their browser (lib/team), by
    the gallery and by ReservedSoon. */
export default async function ObservancesPage() {
  const all = await Promise.all(
    (await getObservances()).map(async (o) => {
      // its photograph: the first put in order by hand in the admin; else one marked featured, if any; else the first
      const { photos, ordered } = await getOrderedPhotosForObservance(o.id);
      const p = (ordered ? undefined : photos.find((x) => x.featured)) ?? photos[0];
      return {
        o,
        row: observanceRow(o, await countTemplesForObservance(o.id)),
        seen: (await getOccasionsForObservance(o.id)).length,
        photo: p ? { src: p.medium, alt: p.alt, focus: p.focus } : undefined,
      };
    })
  );
  const intro = await getSectionIntro("observances");

  // The public's lists: A to Z by the English name, in Tamil with the English beneath
  const names = [...all].sort((a, b) => a.o.name.localeCompare(b.o.name));
  const list = (kind: "festival" | "ritual", label: string) => (
    <div>
      <h2 className="sub-head large">{label}</h2>
      <ul className="name-list" aria-label={label}>
        {names
          .filter(({ o }) => o.kind === kind)
          .map(({ o }) => (
            <li key={o.id} className={kind}>
              <span className="name-list-ta" lang="ta">
                {o.tamil ?? o.name}
              </span>
              {o.tamil && <span className="name-list-en">{o.name}</span>}
            </li>
          ))}
      </ul>
    </div>
  );
  const lists = (
    <section className="section name-lists">
      {list("festival", "Festivals")}
      {list("ritual", "Rituals")}
    </section>
  );

  // The page: the most seen leads, the rest, festivals and
  // rituals together, A to Z, led by their photographs
  const sorted = all.sort((a, b) => b.seen - a.seen || a.o.name.localeCompare(b.o.name));
  const items = sorted.map(({ o, row, photo }) => ({ row, kind: o.kind, photo }));
  const [lead, ...rest] = items;
  rest.sort((x, y) => x.row.name.localeCompare(y.row.name));

  return (
    <div className="wrap">
      <ObservanceGallery
        lead={lead}
        items={rest}
        lists={lists}
        head={
          <>
            <div className="kicker">The ritual year</div>
            <h1 className="page-title">Festivals &amp; Rituals</h1>
            <ReservedSoon />
            <ReservedLede intro={intro} />
          </>
        }
      />
    </div>
  );
}
