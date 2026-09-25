import type { Metadata } from "next";
import { getFieldNotes, getRegion, getTemples } from "@/lib/data";
import { FIELD_KIND_LABELS } from "@/content/labels";
import type { FieldKind } from "@/content/types";
import { noteRow } from "@/lib/view";
import { FieldNotesBrowser } from "@/components/FieldNotesBrowser";

export const metadata: Metadata = {
  title: "Field Notes",
  description:
    "Everything recorded at the temples — notes, interviews, videos and photographs — dated and newest first.",
};

export default async function FieldNotesPage() {
  const region = (await getRegion("pondicherry"))!;
  const temples = await getTemples(region.id);
  const notes = await getFieldNotes(region.id);
  const rows = notes.map((n) => noteRow(n, temples, region.calendar));

  // one filter per kind actually present
  const order: FieldKind[] = ["note", "interview", "video", "audio", "photos"];
  const kinds = order
    .map((k) => ({ kind: k, label: FIELD_KIND_LABELS[k].many, count: notes.filter((n) => n.kind === k).length }))
    .filter((k) => k.count > 0);

  return (
    <div className="wrap">
      <header className="page-head">
        <div className="kicker">From the temples</div>
        <h1 className="page-title">Field Notes</h1>
        <p className="page-lede">
          Everything recorded at the temples — notes written on the day, interviews, videos and
          photographs. Working material, lightly edited: the raw stuff of everything else on this
          site.
        </p>
      </header>
      <section className="section" style={{ paddingTop: 12 }}>
        <FieldNotesBrowser rows={rows} kinds={kinds} />
      </section>
    </div>
  );
}
