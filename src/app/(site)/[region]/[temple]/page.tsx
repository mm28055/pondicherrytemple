import { shareMeta, sharePicture } from "@/lib/share";
import type { Metadata } from "next";
import { getOrderedPhotosForTemple, getRegions, getTemple, getTemplesWithPages } from "@/lib/data";
import { TempleView } from "@/components/TempleView";

type Props = { params: Promise<{ region: string; temple: string }> };

// Every temple's page is built ahead; a temple added later gets its page on
// the first visit.
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
  // shared with the first of its photographs (in their order put in by hand, if any)
  return t
    ? shareMeta({ title: t.knownAs ?? t.name, description: t.introText, image: sharePicture((await getOrderedPhotosForTemple(region, temple)).photos[0]) })
    : {};
}

/** A temple's page (components/TempleView). In Tamil, where it has one: /ta. */
export default async function TemplePage({ params }: Props) {
  const { region, temple } = await params;
  return <TempleView regionId={region} templeId={temple} />;
}
