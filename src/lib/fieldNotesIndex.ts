import { KINDS_TA, templeTa } from "@/content/homeTa";
import { said } from "@/content/saidTa";
import { WRITINGS_TA } from "@/content/writingsTa";
import { monthTa } from "@/lib/dateTa";
import { rowTa } from "@/lib/viewTa";
import { getFieldNotes, getObservances, getRegion, getTemples } from "@/lib/data";
import { FIELD_KIND_LABELS } from "@/content/labels";
import type { FieldKind } from "@/content/types";
import { noteRow } from "@/lib/view";
import { TAMIL_MONTHS } from "@/lib/calendar";
import type { BrowsedNote, NoteFilter } from "@/components/useNoteSearch";

/** The field notes as their search goes by them, and the filters (temples,
    festivals, months, types): the Field Notes page's, and the search box's on
    each note (/field-notes/search-index); with `ta`, in Tamil. */
export async function fieldNotesIndex(ta = false): Promise<{ rows: BrowsedNote[]; filters: NoteFilter[] }> {
  const T = ta ? WRITINGS_TA : null;
  // Pondicherry's notes and those filed under "In and around Pondicherry".
  const region = (await getRegion("pondicherry"))!;
  const around = await getRegion(`in-and-around-${region.id}`);
  const regionIds = [region.id, ...(around ? [around.id] : [])];
  const temples = (await Promise.all(regionIds.map((id) => getTemples(id)))).flat();
  const notes = (await getFieldNotes()).filter((n) => regionIds.includes(n.region));
  const observances = await getObservances();
  const rows = notes.map((n) => {
    const row = noteRow(n, temples, region.calendar);
    return {
    ...(ta ? { ...rowTa(row, temples, n, true), tamilMonth: row.local?.split(" ")[0] } : row),
    temples: n.temples,
    observances: n.observances,
    also: [
      ...temples.filter((t) => n.temples.includes(t.id)).flatMap((t) => [t.name, t.knownAs, t.shortName]),
      ...observances.filter((o) => n.observances.includes(o.id)).flatMap((o) => [o.name, o.alsoKnownAs, o.tamil]),
      // (found in the Tamil page by its English words too)
      ...(ta ? [row.title, row.where, n.occasion, row.longExcerpt] : []),
    ]
      .filter(Boolean)
      .join(" "),
  };
  });

  // the filters: only what the notes have. Months: by the English calendar,
  // newest first, then by the Tamil, in the order of the year
  const ofNotes = (id: string, key: "temples" | "observances") => notes.some((n) => n[key].includes(id));
  const order: FieldKind[] = ["note", "interview", "video", "audio", "photos"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const months = [...new Set(notes.map((n) => n.date.slice(0, 7)))].sort().reverse();
  const tamilMonths = new Set(rows.map((r) => (r as { tamilMonth?: string }).tamilMonth ?? r.local?.split(" ")[0]));
  const filters: NoteFilter[] = [
    {
      key: "temple",
      label: T?.temple ?? "Temple",
      options: temples.filter((t) => ofNotes(t.id, "temples")).map((t) => ({ id: t.id, label: ta ? templeTa(t.id, t.knownAs ?? t.name) : (t.knownAs ?? t.name), also: [ta && t.knownAs, t.name, t.shortName].filter(Boolean).join(", ") })),
    },
    {
      key: "festival",
      label: T?.festival ?? "Festival/Ritual",
      options: observances.filter((o) => ofNotes(o.id, "observances")).map((o) => ({ id: o.id, label: ta ? (o.tamil ?? said(o.name)) : o.name, also: [ta ? o.name : undefined, o.alsoKnownAs, ta ? undefined : o.tamil].filter(Boolean).join(", ") })),
    },
    {
      key: "month",
      label: T?.month ?? "Month",
      options: [
        ...months.map((m) => ({ id: m, label: ta ? monthTa(m) : `${monthNames[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`, also: ta ? `${monthNames[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}` : undefined })),
        ...TAMIL_MONTHS.filter((m) => tamilMonths.has(m.name)).map((m) => ({ id: `ta:${m.name}`, label: ta ? m.tamil : m.name, also: ta ? m.name : undefined })),
      ],
    },
    {
      key: "type",
      label: T?.type ?? "Type",
      options: order.filter((k) => notes.some((n) => n.kind === k)).map((k) => ({ id: k, label: ta ? (KINDS_TA[k] ?? (k === "note" ? "குறிப்புகள்" : FIELD_KIND_LABELS[k].many)) : FIELD_KIND_LABELS[k].many })),
    },
  ].filter((f) => f.options.length > 1);

  return { rows, filters };
}
