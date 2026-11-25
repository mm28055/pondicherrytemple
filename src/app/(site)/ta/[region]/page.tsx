import type { Metadata } from "next";
import { RegionView } from "@/components/RegionView";
import { TEMPLES_PAGE_TA } from "@/content/templeTa";

// the town's Temples page alone
export const dynamicParams = false;
export const generateStaticParams = () => [{ region: "pondicherry" }];

export const metadata: Metadata = { title: { absolute: `${TEMPLES_PAGE_TA.name} — ஸ்தலம்` } };

/** The Temples page in Tamil (its words: content/templeTa). */
export default async function RegionPageTamil({ params }: { params: Promise<{ region: string }> }) {
  return <RegionView regionId={(await params).region} ta />;
}
