import type { Metadata } from "next";
import { getFieldNotes, getRegion, getSectionIntro, getTemples } from "@/lib/data";
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
  // Pondicherry's notes and those filed under "In and around Pondicherry".
  const region = (await getRegion("pondicherry"))!;
  const around = await getRegion(`in-and-around-${region.id}`);
  const regionIds = [region.id, ...(around ? [around.id] : [])];
  const temples = (await Promise.all(regionIds.map((id) => getTemples(id)))).flat();
  const notes = (await getFieldNotes()).filter((n) => regionIds.includes(n.region));
  const rows = notes.map((n) => noteRow(n, temples, region.calendar));

  // one filter per kind actually present
  const order: FieldKind[] = ["note", "interview", "video", "audio", "photos"];
  const kinds = order
    .map((k) => ({ kind: k, label: FIELD_KIND_LABELS[k].many, count: notes.filter((n) => n.kind === k).length }))
    .filter((k) => k.count > 0);

  return (
    <div className="wrap">
      <header className="page-head tight-head">
        <div className="kicker">From the temples</div>
        <h1 className="page-title">Field Notes</h1>
        <p className="page-lede">{await getSectionIntro("fieldNotes")}</p>
      </header>
      <section className="section" style={{ paddingTop: 12 }}>
        <FieldNotesBrowser rows={rows} kinds={kinds} />
      </section>
    </div>
  );
}
