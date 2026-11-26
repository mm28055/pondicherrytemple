import type { Metadata } from "next";
import { FieldNotesView } from "@/components/FieldNotesView";

export const metadata: Metadata = {
  title: "Field Notes",
  description:
    "Everything recorded at the temples — notes, interviews, videos and photographs — dated and newest first.",
};

/** The Field Notes page (components/FieldNotesView). */
export default function FieldNotesPage() {
  return <FieldNotesView />;
}
