import type { Metadata } from "next";
import { FilmsView } from "@/components/FilmsView";
import { FILMS_TA } from "@/content/aboutTa";

export const metadata: Metadata = { title: { absolute: `${FILMS_TA.title} — ஸ்தலம்` } };

/** The Films page in Tamil (its words: content/aboutTa, content/filmsTa). */
export default function FilmsPageTamil() {
  return <FilmsView ta />;
}
