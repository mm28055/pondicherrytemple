import type { Metadata } from "next";
import { PhotographsView } from "@/components/PhotographsView";

export const metadata: Metadata = {
  title: "Photographs",
  description: "Every photograph on Sthalam, from every temple and festival.",
};

/** The Photographs page (components/PhotographsView). In Tamil: /ta/photographs. */
export default function PhotographsPage() {
  return <PhotographsView />;
}
