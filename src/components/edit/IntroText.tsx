/* A section page's opening words (Festivals & Rituals, Field Notes, Films,
   Articles, The Book: Site pages → Section descriptions in /admin). In
   Admin2 a box to edit; for everyone else just the words. */

import { getSectionIntro } from "@/lib/data";
import { getEditableGlobal, isEditing } from "@/lib/editing";
import type { SectionName } from "@/payload/sectionIntros";
import { EditText } from "./Editable";

export async function IntroText({ name }: { name: SectionName }) {
  const text = await getSectionIntro(name);
  if (!(await isEditing())) return <>{text}</>;
  const ed = await getEditableGlobal("section-descriptions");
  return (
    <EditText
      long
      value={ed.text(name) || text}
      target={{ collection: ed.collection, id: ed.id, field: name, label: "Opening words (this section page)" }}
    />
  );
}
