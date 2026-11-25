import type { Metadata } from "next";
import { FilmsView } from "@/components/FilmsView";

export const metadata: Metadata = {
  title: "Films",
  description: "Short films from the temples of Pondicherry, newest first.",
};

/** The Films page (components/FilmsView). In Tamil: /ta/films. */
export default function FilmsPage() {
  return <FilmsView />;
}
