import type { Metadata } from "next";
import { ObservancesView } from "@/components/ObservancesView";
import { FESTIVALS_TA } from "@/content/festivalsTa";

export const metadata: Metadata = { title: { absolute: `${FESTIVALS_TA.title} — ஸ்தலம்` } };

/** The Festivals & Rituals page in Tamil (its words: content/festivalsTa). */
export default function ObservancesPageTamil() {
  return <ObservancesView ta />;
}
