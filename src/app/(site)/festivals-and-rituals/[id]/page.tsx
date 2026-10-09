import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArticlesForObservance,
  getFieldNotesForObservance,
  getIllustrationsForObservance,
  getObservance,
  getPhotos,
  getPhotosForObservance,
  getOccasionsForObservance,
  getRegion,
  getTemple,
  getTemples,
  hasPage,
} from "@/lib/data";
import { dateParts } from "@/lib/calendar";
import { articleRow, noteRow } from "@/lib/view";
import { Drawings, drawingsInColumn } from "@/components/Drawings";
import { NoteRow } from "@/components/Rows";
import { MahotsavamElements } from "@/components/MahotsavamElements";
import { BannerCarousel } from "@/components/BannerCarousel";
import { dummyStrip, MAHOTSAVAM_PARTS } from "@/lib/mahotsavam";
import type { Occasion, Temple } from "@/content/types";
import { seesFestivalPages } from "@/lib/festivals-access";

// Dummy text for the Overview, until the real words are written.
const OVERVIEW_DUMMY = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus, nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam consequat. Curabitur augue lorem, dapibus quis, laoreet et, pretium ac, nisi. Aenean magna nisl, mollis quis, molestie eu, feugiat in, orci. In hac habitasse platea dictumst. Fusce convallis, mauris imperdiet gravida bibendum, nisl turpis suscipit mauris, sed placerat ipsum urna sed risus. In convallis tellus a mauris.",
  "Curabitur non elit ut libero tristique sodales. Mauris a lacus. Donec mattis semper leo. In hac habitasse platea dictumst. Vivamus facilisis diam at odio. Mauris dictum, nisi eget consequat elementum, lacus ligula molestie metus, non feugiat orci magna ac sem. Donec turpis. Donec vitae metus. Morbi tristique neque eu mauris. Quisque gravida ipsum non sapien. Proin turpis lacus, scelerisque vitae, elementum at, lobortis ac, quam. Aliquam dictum eleifend risus. In hac habitasse platea dictumst. Etiam sit amet diam. Suspendisse odio. Suspendisse nunc. In semper bibendum libero. Proin nonummy, lacus eget pulvinar lacinia, pede felis dignissim leo, vitae tristique magna lacus sit amet eros. Nullam ornare. Praesent odio ligula, dapibus sed, tincidunt eget, dictum ac, nibh. Nam quis lacus. Nunc eleifend molestie velit. Morbi lobortis quam eu velit. Donec euismod vestibulum massa. Donec non lectus. Aliquam commodo lacus sit amet nulla. Cras dignissim elit et augue. Nullam non diam. Pellentesque metus. Nullam iaculis. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; nam vitae urna. Nunc vel sapien ut nibh fermentum posuere. Donec sodales, arcu nec varius iaculis, mauris lectus vehicula lorem, a venenatis tellus sem ac magna. Sed lectus. Suspendisse potenti. Maecenas ut ligula. Sed eget ante at ligula ullamcorper dignissim. Cras ac arcu sed orci consequat volutpat. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui.",
];

type Props = { params: Promise<{ id: string }> };

// Held in reserve until published (lib/festivals): shown only to someone
// signed in to the admin, so decided on each visit, not built ahead.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const o = await getObservance((await params).id);
  return o ? { title: o.name, description: `${o.name} — ${o.gloss}.` } : {};
}

export default async function ObservancePage({ params }: Props) {
  const o = await getObservance((await params).id);
  if (!(await seesFestivalPages())) notFound();
  if (!o) notFound();

  // Festival pages are not tied to a region; rows are labelled with each
  // note's own region calendar. Pondicherry is the only region today.
  const region = (await getRegion("pondicherry"))!;
  const temples = await getTemples(region.id);

  const notes = (await getFieldNotesForObservance(o.id)).map((n) =>
    noteRow(n, temples, region.calendar),
  );
  const articles = (await getArticlesForObservance(o.id)).map((a) =>
    articleRow(a, region.calendar),
  );
  const drawings = await getIllustrationsForObservance(o.id);

  // Where we've seen it: occasions grouped by temple, in the order first seen;
  // each temple's name above its dates, so the column can be narrow
  const groups: { temple: Temple; items: Occasion[] }[] = [];
  for (const occ of await getOccasionsForObservance(o.id)) {
    const t = await getTemple(occ.region, occ.temple);
    if (!t) continue;
    const g = groups.find(
      (x) => x.temple.region === t.region && x.temple.id === t.id,
    );
    if (g) g.items.push(occ);
    else groups.push({ temple: t, items: [occ] });
  }

  const inColumn = drawingsInColumn(drawings);
  // the elements of the mahotsavam: on the Brahmotsavam page only
  const isMahotsavam = o.id === "brahmotsavam";
  // a dummy contact strip for Dhvajarohanam: 21 photographs of the festivals and rituals
  // every photograph there is, for the dummy strips and to fill out the banner
  const allPhotos = await getPhotos();
  // dummy contact strips for the rites: 0 to 21 photographs each, picked at random
  // (but always the same for a rite) from all of them
  const strips = isMahotsavam
    ? Object.fromEntries(MAHOTSAVAM_PARTS.flatMap((p) => p.rites).map((r) => [r, dummyStrip(r, allPhotos)]))
    : {};
  // the banner: its own photographs first (a featured one first of all), then
  // others, to eight
  const own = await getPhotosForObservance(o.id);
  const bannerPhotos = [
    ...own.filter((p) => p.featured),
    ...own.filter((p) => !p.featured),
    ...dummyStrip(o.id + " banner", allPhotos.filter((p) => !own.includes(p)).filter((p) => p.width >= p.height)).concat(allPhotos),
  ]
    .filter((p, i, all) => all.indexOf(p) === i)
    .slice(0, 8)
    .map((p) => ({ id: p.id, src: p.src, alt: p.alt, caption: p.caption, focus: p.focus }));

  const seenHead = <h2 className="sub-head">Where we&apos;ve seen it</h2>;
  // each temple a name to open: its dates (and its page) beneath when opened
  const seenList = (
    <ul className="seen">
      {groups.map(({ temple: t, items }) => (
        <li key={`${t.region}/${t.id}`}>
          <details>
            <summary className="where">{t.knownAs ?? t.name}</summary>
            <ul className="when">
              {items.map((i) => {
                const d = dateParts(i.date);
                return (
                  <li key={i.date + i.label}>
                    <time dateTime={i.date}>
                      {d.day} {d.shortMonth} {d.year}
                    </time>
                    {i.tbc && (
                      <abbr className="tbc-mark" title="To be confirmed">
                        TBC
                      </abbr>
                    )}
                    {i.label}
                  </li>
                );
              })}
            </ul>
            {hasPage(t) && (
              <Link className="seen-temple" href={`/${t.region}/${t.id}`}>
                The temple
              </Link>
            )}
          </details>
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
        <div className="kicker">
          {o.kind === "festival" ? "Festival" : "Ritual"}
        </div>
        {o.tamil && (
          <p className="tamil-title" lang="ta">
            {o.tamil}
          </p>
        )}
        <h1 className="name-title">
          {o.name}
          {o.alsoKnownAs && (
            <span style={{ fontStyle: "normal", color: "var(--muted)" }}>
              {" "}
              · {o.alsoKnownAs}
            </span>
          )}
        </h1>
        <p className="gloss kicker">{o.gloss}</p>
      </header>

      {/* a band of photographs, the whole width of the page, to give it its character */}
      <BannerCarousel photos={bannerPhotos} />

      {!inColumn && <Drawings items={drawings} />}

      {/* the main column (the Overview on every page), and where we've seen it beside */}
      <div className="two-col obs-cols">
        <div className="stack">
          {inColumn && <Drawings items={drawings} />}

          {/* Overview: dummy text for now, two paragraphs of about 500 words in
              all (the words will come from the admin) */}
          <section>
            <h2 className="sub-head">Overview</h2>
            <div className="prose overview">
              {OVERVIEW_DUMMY.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          {/* The elements of the mahotsavam: its heading in the page's own title
                style, smaller — the Tamil, the name in English letters, then
                what it means */}
          {isMahotsavam && (
            <section className="elements">
              <h2 className="elements-head">
                <span className="elements-ta" lang="ta">
                  மஹோத்ஸவ அங்கங்கள்
                </span>
                {/* the name in English letters, and what it means beside it, a red dot between */}
                <span className="elements-line">
                  <span className="elements-en">Mahotsava Angangal</span>
                  <span className="elements-dot" aria-hidden="true" />
                  <span className="elements-gloss">Elements of the Mahotsavam</span>
                </span>
              </h2>
              <MahotsavamElements strips={strips} />
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
    </div>
  );
}
