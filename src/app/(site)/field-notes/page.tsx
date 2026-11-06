import type { Metadata } from "next";
import { getFieldNotes, getObservances, getPhotos, getRegion, getSectionIntro, getTemples } from "@/lib/data";
import { onePerEvent, STRIP_PHOTOS } from "@/lib/photoPack";
import { FIELD_KIND_LABELS } from "@/content/labels";
import type { FieldKind } from "@/content/types";
import { noteRow } from "@/lib/view";
import { TAMIL_MONTHS } from "@/lib/calendar";
import { FieldNotesBrowser, type NoteFilter } from "@/components/FieldNotesBrowser";
import { HomeStrip } from "@/components/HomeStrip";

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
  const observances = await getObservances();
  const rows = notes.map((n) => ({
    ...noteRow(n, temples, region.calendar),
    temples: n.temples,
    observances: n.observances,
    also: [
      ...temples.filter((t) => n.temples.includes(t.id)).flatMap((t) => [t.name, t.knownAs, t.shortName]),
      ...observances.filter((o) => n.observances.includes(o.id)).flatMap((o) => [o.name, o.alsoKnownAs, o.tamil]),
    ]
      .filter(Boolean)
      .join(" "),
  }));

  // the filters: only what the notes have. Months: by the English calendar,
  // newest first, then by the Tamil, in the order of the year
  const ofNotes = (id: string, key: "temples" | "observances") => notes.some((n) => n[key].includes(id));
  const order: FieldKind[] = ["note", "interview", "video", "audio", "photos"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const months = [...new Set(notes.map((n) => n.date.slice(0, 7)))].sort().reverse();
  const tamilMonths = new Set(rows.map((r) => r.local?.split(" ")[0]));
  const filters: NoteFilter[] = [
    {
      key: "temple",
      label: "Temple",
      options: temples.filter((t) => ofNotes(t.id, "temples")).map((t) => ({ id: t.id, label: t.knownAs ?? t.name, also: [t.name, t.shortName].filter(Boolean).join(", ") })),
    },
    {
      key: "festival",
      label: "Festival/Ritual",
      options: observances.filter((o) => ofNotes(o.id, "observances")).map((o) => ({ id: o.id, label: o.name, also: [o.alsoKnownAs, o.tamil].filter(Boolean).join(", ") })),
    },
    {
      key: "month",
      label: "Month",
      options: [
        ...months.map((m) => ({ id: m, label: `${monthNames[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}` })),
        ...TAMIL_MONTHS.filter((m) => tamilMonths.has(m.name)).map((m) => ({ id: `ta:${m.name}`, label: m.name })),
      ],
    },
    {
      key: "type",
      label: "Type",
      options: order.filter((k) => notes.some((n) => n.kind === k)).map((k) => ({ id: k, label: FIELD_KIND_LABELS[k].many })),
    },
  ].filter((f) => f.options.length > 1);

  // the home page's strip of photographs, the same in every way: one from
  // each of the latest events, the newest first, all of them in turn
  // (only the latest STRIP_PHOTOS events: thousands would weigh the page down)
  const stripPhotos = onePerEvent(await getPhotos(), STRIP_PHOTOS)
    .map(({ id, small, alt, focus, width, height }) => ({ id, small, alt, focus, width, height }));

  return (
    <div className="wrap">
      <FieldNotesBrowser
        rows={rows}
        filters={filters}
        intro={<p className="page-lede">{await getSectionIntro("fieldNotes")}</p>}
        strip={stripPhotos.length > 0 && <HomeStrip photos={stripPhotos} />}
      />
    </div>
  );
}
