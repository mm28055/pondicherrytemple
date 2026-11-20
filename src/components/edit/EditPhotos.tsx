/* Admin2: a page's photographs, for the bar's Photos button (PhotoArea,
   PhotoArranger). Put once on a festival's, temple's or field note's page;
   outside Admin2 it is nothing at all. */

import { getEditable, isEditing } from "@/lib/editing";
import { PhotoArea } from "./PhotoArea";

export async function EditPhotos({ kind, slug, label }: { kind: "observances" | "temples" | "field-notes"; slug: string; label: string }) {
  if (!(await isEditing())) return null;
  const ed = await getEditable(kind, slug);
  if (!ed) return null;
  // a photo added here is tagged with the festival or temple; a note's with its temples and festivals
  const tags =
    kind === "field-notes" ? { temples: ed.refs("temples"), observances: ed.refs("observances") } : { [kind]: [ed.id] };
  return <PhotoArea kind={kind} id={ed.id} label={label} slug={slug} tags={tags} />;
}
