import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getFieldNotesForTemple,
  getOccasionsForTemple,
  getRegion,
  getRegions,
  getTemples,
  hasPage,
} from "@/lib/data";
import { Html } from "@/components/Prose";
import { templesOf } from "@/lib/view";
import { TempleRow, TempleRowPlain } from "@/components/Rows";

type Props = { params: Promise<{ region: string }> };

export async function generateStaticParams() {
  return (await getRegions()).map((r) => ({ region: r.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await getRegion((await params).region);
  return r ? { title: templesOf(r.name), description: r.introText } : {};
}

export default async function RegionPage({ params }: Props) {
  const region = await getRegion((await params).region);
  if (!region) notFound();

  const temples = await getTemples(region.id);
  const withPages = await Promise.all(
    temples.filter(hasPage).map(async (t) => {
      const occ = (await getOccasionsForTemple(region.id, t.id)).length;
      const notes = (await getFieldNotesForTemple(region.id, t.id)).length;
      return { t, meta: `${occ} occasions · ${notes} field note${notes === 1 ? "" : "s"}` };
    })
  );
  const others = temples.filter((t) => !hasPage(t));

  // Temples outside the town live in their own region, "In and around <town>"
  // (address in-and-around-<town>), and are listed at the foot of the town's page.
  const around = await getRegion(`in-and-around-${region.id}`);
  const aroundTemples = around ? await getTemples(around.id) : [];
  const aroundRows = await Promise.all(
    aroundTemples.map(async (t) => {
      if (!hasPage(t)) return { t };
      const occ = (await getOccasionsForTemple(around!.id, t.id)).length;
      const notes = (await getFieldNotesForTemple(around!.id, t.id)).length;
      return { t, meta: `${occ} occasions · ${notes} field note${notes === 1 ? "" : "s"}` };
    })
  );

  return (
    <div className="wrap">
      <header className="page-head">
        <div className="kicker">{region.name}</div>
        <h1 className="page-title">Temples</h1>
        <Html className="page-lede" html={region.intro} />
      </header>

      <section className="section">
        {withPages.map(({ t, meta }) => (
          <TempleRow key={t.id} temple={t} meta={meta} />
        ))}
      </section>

      {others.length > 0 && (
        <section className="section tight">
          <h2 className="sub-head">Also being documented</h2>
          <p className="note-line">Each of these gets its own page once its first notes are ready.</p>
          {others.map((t) => (
            <TempleRowPlain key={t.id} temple={t} />
          ))}
        </section>
      )}

      {around && aroundRows.length > 0 && (
        <section className="section tight" id={around.id}>
          <h2 className="sub-head">{around.name}</h2>
          {/* The region's Introduction (Admin → Regions), or this line if it is empty. */}
          <p className="note-line">{around.introText || `Temples outside ${region.name} that are part of this study.`}</p>
          {aroundRows.map(({ t, meta }) =>
            meta ? <TempleRow key={t.id} temple={t} meta={meta} /> : <TempleRowPlain key={t.id} temple={t} />
          )}
        </section>
      )}
    </div>
  );
}
