import type { Metadata } from "next";
import { TemplePhotosView } from "@/components/TemplePhotosView";
import { getRegions, getTemple, getTemplesWithPages } from "@/lib/data";

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

/** Every photograph of a temple (components/TemplePhotosView). */
export default async function TemplePhotosPage({ params }: Props) {
  const { region, temple } = await params;
  return <TemplePhotosView regionId={region} templeId={temple} />;
}
