import type { Metadata } from "next";
import { TemplePhotosView } from "@/components/TemplePhotosView";
import { PHOTOGRAPHS_TA } from "@/content/aboutTa";
import { templeTa } from "@/content/homeTa";
import { getRegions, getTemplesWithPages } from "@/lib/data";

type Props = { params: Promise<{ region: string; temple: string }> };

export async function generateStaticParams() {
  const out: { region: string; temple: string }[] = [];
  for (const r of await getRegions()) for (const t of await getTemplesWithPages(r.id)) out.push({ region: r.id, temple: t.id });
  return out;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { temple } = await params;
  return { title: { absolute: `${templeTa(temple, temple)}: ${PHOTOGRAPHS_TA.title} — ஸ்தலம்` } };
}

/** Every photograph of a temple, in Tamil (components/TemplePhotosView). */
export default async function TemplePhotosPageTamil({ params }: Props) {
  const { region, temple } = await params;
  return <TemplePhotosView regionId={region} templeId={temple} ta />;
}
