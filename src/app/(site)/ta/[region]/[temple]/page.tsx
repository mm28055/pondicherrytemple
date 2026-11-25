import type { Metadata } from "next";
import { TempleView } from "@/components/TempleView";
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
  return { title: { absolute: `${templeTa(temple, temple)} — ஸ்தலம்` } };
}

/** A temple's page in Tamil (its words: content/templeTa). */
export default async function TemplePageTamil({ params }: Props) {
  const { region, temple } = await params;
  return <TempleView regionId={region} templeId={temple} ta />;
}
