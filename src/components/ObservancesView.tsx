import { IntroText } from "@/components/edit/IntroText";
import { isEditing } from "@/lib/editing";
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
import { FESTIVALS_TA, glossTa } from "@/content/festivalsTa";
import { said } from "@/content/saidTa";

/** The festivals and rituals, led by their photographs. Until their own pages
    are published (lib/festivals), that gallery is for someone signed in to the
    admin; the public sees their names listed A to Z, the festivals on the left,
    the rituals on the right, with "Coming soon" under the title (?as=public
    shows a team member that version). Built ahead, the same for everyone:
    whether the visitor is signed in is asked in their browser (lib/team), by
    the gallery and by ReservedSoon. With `ta`, in Tamil (its words:
    content/festivalsTa), the names in both languages as they are. */
export async function ObservancesView({ ta = false }: { ta?: boolean }) {
  const T = ta ? FESTIVALS_TA : null;
  const rowOf = (r: ReturnType<typeof observanceRow>) =>
    ta ? { ...r, gloss: glossTa(r.gloss), tamil: r.tamil ?? (said(r.name) !== r.name ? said(r.name) : undefined) } : r;
  const all = await Promise.all(
    (await getObservances()).map(async (o) => {
      // its photograph: the first put in order by hand in the admin; else one marked featured, if any; else the first
      const { photos, ordered } = await getOrderedPhotosForObservance(o.id);
      const p = (ordered ? undefined : photos.find((x) => x.featured)) ?? photos[0];
      return {
        o,
        row: rowOf(observanceRow(o, await countTemplesForObservance(o.id))),
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
                {o.tamil ?? (ta ? said(o.name) : o.name)}
              </span>
              {(o.tamil || (ta && said(o.name) !== o.name)) && (
                <span className="name-list-en" lang="en">
                  {o.name}
                </span>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
  const lists = (
    <section className="section name-lists">
      {list("festival", T?.festivals ?? "Festivals")}
      {list("ritual", T?.rituals ?? "Rituals")}
    </section>
  );

  // The page: the most seen leads, the rest, festivals and
  // rituals together, A to Z, led by their photographs
  const sorted = all.sort((a, b) => b.seen - a.seen || a.o.name.localeCompare(b.o.name));
  const items = sorted.map(({ o, row, photo }) => ({ row, kind: o.kind, photo }));
  const [lead, ...rest] = items;
  rest.sort((x, y) => x.row.name.localeCompare(y.row.name));

  return (
    <div className={ta ? "wrap in-ta" : "wrap"} lang={ta ? "ta" : undefined}>
      <ObservanceGallery
        lead={lead}
        items={rest}
        lists={lists}
        ta={ta}
        head={
          <>
            <div className="kicker">{T?.kicker ?? "The ritual year"}</div>
            <h1 className="page-title">{T?.title ?? "Festivals & Rituals"}</h1>
            <ReservedSoon words={T?.soon} />
            {/* (in Admin2, its words as a box) */}
            {!ta && (await isEditing()) ? (
              <p className="page-lede">
                <IntroText name="observances" />
              </p>
            ) : (
              <ReservedLede intro={T?.intro ?? intro} words={T ? { lede: T.lede, link: T.ledeLink } : undefined} />
            )}
          </>
        }
      />
    </div>
  );
}
