import type { Metadata } from "next";
import { RegionView } from "@/components/RegionView";
import { getRegion, getRegions } from "@/lib/data";
import { templesOf } from "@/lib/view";

type Props = { params: Promise<{ region: string }> };

export async function generateStaticParams() {
  return (await getRegions()).map((r) => ({ region: r.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await getRegion((await params).region);
  return r ? { title: templesOf(r.name), description: r.introText } : {};
}

/** A town's Temples page (components/RegionView). In Tamil: /ta/pondicherry. */
export default async function RegionPage({ params }: Props) {
  return <RegionView regionId={(await params).region} />;
}
