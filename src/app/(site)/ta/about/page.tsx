import type { Metadata } from "next";
import { AboutView } from "@/components/AboutView";
import { ABOUT_TA } from "@/content/aboutTa";

export const metadata: Metadata = { title: { absolute: ABOUT_TA.title } };

/** The About page in Tamil (its words: content/aboutTa). */
export default function AboutPageTamil() {
  return <AboutView ta />;
}
