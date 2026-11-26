import type { Metadata } from "next";
import { FieldNotesView } from "@/components/FieldNotesView";
import { WRITINGS_TA } from "@/content/writingsTa";

export const metadata: Metadata = { title: { absolute: `${WRITINGS_TA.notes} — ஸ்தலம்` } };

/** The Field Notes page in Tamil. */
export default function FieldNotesPageTamil() {
  return <FieldNotesView ta />;
}
