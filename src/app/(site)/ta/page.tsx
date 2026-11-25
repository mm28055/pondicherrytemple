import type { Metadata } from "next";
import { HomeView } from "@/components/HomeView";
import { HOME_TA } from "@/content/homeTa";

export const metadata: Metadata = { title: { absolute: HOME_TA.title } };

/** The home page in Tamil (its words: content/homeTa). */
export default function HomePageTamil() {
  return <HomeView ta />;
}
