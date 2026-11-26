import { noteWordsTa } from "@/content/noteBodiesTa";
import { getFieldNoteTexts } from "@/lib/data";

export const dynamic = "force-static";

/** Every field note's whole words in Tamil (in English, where it is not yet in
    Tamil), for the search on the Tamil Field Notes page. */
export async function GET() {
  const english = await getFieldNoteTexts();
  return Response.json(Object.fromEntries(Object.entries(english).map(([id, text]) => [id, noteWordsTa(id) ?? text])));
}
