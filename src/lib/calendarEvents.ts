import type { CalendarEvent } from "@/components/MonthCalendar";
import type { Occasion } from "@/content/types";
import { getObservancesById, getTemple, hasPage } from "@/lib/data";
import { shortTempleName } from "@/lib/view";

/** Recorded days as the calendar and its pop-up show them: the temple (its
    full name, and its short one for a day's box), what happened, its field
    note, and the festivals and rituals it was part of. */
export async function calendarEvents(occasions: Occasion[]): Promise<CalendarEvent[]> {
  return Promise.all(
    occasions.map(async (o) => {
      const t = await getTemple(o.region, o.temple);
      return {
        date: o.date,
        place: t ? (t.knownAs ?? t.name) : "",
        // in a day's box: the temple's short name ("Lawspet Murugan"), if it has one;
        // else the name the town uses, kept whole; else its name without "Koil"
        short: t ? (t.shortName ?? t.knownAs ?? shortTempleName(t)) : "",
        placeHref: t && hasPage(t) ? `/${t.region}/${t.id}` : undefined,
        label: o.label,
        noteHref: o.note ? `/field-notes/${o.note}` : undefined,
        observances: (await getObservancesById(o.observances)).map((x) => ({
          label: x.name,
          href: `/festivals-and-rituals/${x.id}`,
        })),
      };
    }),
  );
}
