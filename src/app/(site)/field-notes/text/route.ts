import { getFieldNoteTexts } from "@/lib/data";

export const dynamic = "force-static";

/** Every field note's whole words, for the search on the Field Notes page,
    which asks for them only once someone goes to search. */
export async function GET() {
  return Response.json(await getFieldNoteTexts());
}
