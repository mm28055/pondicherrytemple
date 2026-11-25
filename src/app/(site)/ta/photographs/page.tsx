import type { Metadata } from "next";
import { PhotographsView } from "@/components/PhotographsView";
import { PHOTOGRAPHS_TA } from "@/content/aboutTa";

export const metadata: Metadata = { title: { absolute: `${PHOTOGRAPHS_TA.title} — ஸ்தலம்` } };

/** The Photographs page in Tamil. */
export default function PhotographsPageTamil() {
  return <PhotographsView ta />;
}
