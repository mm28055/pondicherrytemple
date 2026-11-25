import type { Metadata } from "next";
import { AboutView } from "@/components/AboutView";

export const metadata: Metadata = {
  title: "About",
  description: "About Sthalam, a temple documentation project of the Centre for Shaiva Studies, Pondicherry.",
};

/** The About page (components/AboutView). In Tamil: /ta/about. */
export default function AboutPage() {
  return <AboutView />;
}
