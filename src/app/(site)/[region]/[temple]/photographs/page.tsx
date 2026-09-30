import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getObservancesById,
  getPhotosForTemple,
  getRegion,
  getRegions,
  getTemple,
  getTemplesWithPages,
  hasPage,
} from "@/lib/data";
import { PhotoWall } from "@/components/PhotoWall";

type Props = { params: Promise<{ region: string; temple: string }> };

export async function generateStaticParams() {
  const out: { region: string; temple: string }[] = [];
  for (const r of await getRegions()) {
    for (const t of await getTemplesWithPages(r.id)) out.push({ region: r.id, temple: t.id });
  }
  return out;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region, temple } = await params;
  const t = await getTemple(region, temple);
  return t ? { title: `${t.knownAs ?? t.name}: photographs` } : {};
}

/** Every photograph of a temple, by year, with a button for each festival
    among them to narrow it down. */
export default async function TemplePhotosPage({ params }: Props) {
  const { region: regionId, temple: templeId } = await params;
  const region = await getRegion(regionId);
  const t = await getTemple(regionId, templeId);
  if (!region || !t || !hasPage(t)) notFound();
  const photos = await getPhotosForTemple(region.id, t.id);
  if (!photos.length) notFound();

  // the festivals among its photos, the most photographed first
  const counts = new Map<string, number>();
  for (const p of photos) for (const id of p.observances) counts.set(id, (counts.get(id) ?? 0) + 1);
  const filters = (await getObservancesById([...counts.keys()]))
    .map((o) => ({ id: o.id, label: o.name, count: counts.get(o.id)! }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="wrap">
      <header className="page-head">
        <Link className="crumb" href={`/${region.id}/${t.id}`}>
          ← {t.knownAs ?? t.name}
        </Link>
        <div className="kicker">
          Photographs · {photos.length}
        </div>
        <h1 className="temple-title">{t.knownAs ?? t.name}</h1>
      </header>
      <section className="section">
        <PhotoWall photos={photos} layout="years" filters={filters} />
      </section>
    </div>
  );
}
