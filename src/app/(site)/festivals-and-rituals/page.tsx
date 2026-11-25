import type { Metadata } from "next";
import { ObservancesView } from "@/components/ObservancesView";

export const metadata: Metadata = {
  title: "Festivals & Rituals",
  description:
    "The festivals and rituals of the temples — each explained once, with every field note and article about it.",
};

/** The Festivals & Rituals page (components/ObservancesView). In Tamil: /ta/festivals-and-rituals. */
export default function ObservancesPage() {
  return <ObservancesView />;
}
