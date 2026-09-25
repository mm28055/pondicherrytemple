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
import { TempleRow, TempleRowPlain } from "@/components/Rows";

type Props = { params: Promise<{ region: string }> };

export async function generateStaticParams() {
  return (await getRegions()).map((r) => ({ region: r.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await getRegion((await params).region);
  return r ? { title: `The temples of ${r.name}`, description: r.introText } : {};
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
    </div>
  );
}
