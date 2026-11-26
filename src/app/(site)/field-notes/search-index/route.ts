import { fieldNotesIndex } from "@/lib/fieldNotesIndex";

export const dynamic = "force-static";

/** The field notes and the filters, for the search box on each note, which
    asks for them only once someone goes to search. */
export async function GET() {
  return Response.json(await fieldNotesIndex(false));
}
