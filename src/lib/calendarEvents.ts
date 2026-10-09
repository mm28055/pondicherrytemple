import type { CalendarEvent } from "@/components/MonthCalendar";
import type { Occasion } from "@/content/types";
import { getObservancesById, getTemple, hasPage } from "@/lib/data";
import { shortTempleName } from "@/lib/view";
import { festivalPath } from "@/lib/festivals";

/** Recorded days as the calendar and its pop-up show them: the temple (its
    full name, and its short one for a day's box), what happened, its field
    note, and the festivals and rituals it was part of. */
export async function calendarEvents(occasions: Occasion[]): Promise<CalendarEvent[]> {
  // on each day, those confirmed before those still to be confirmed
  const ordered = [...occasions].sort((a, b) => a.date.localeCompare(b.date) || Number(a.tbc) - Number(b.tbc));
  return Promise.all(
    ordered.map(async (o) => {
      const t = o.townWide ? null : await getTemple(o.region, o.temple);
      return {
        date: o.date,
        // an event of the whole town has no temple
        place: t ? (t.knownAs ?? t.name) : o.townWide ? "Town-wide" : "",
        // in a day's box: the temple's short name ("Lawspet Murugan"), if it has one;
        // else the name the town uses, kept whole; else its name without "Koil"
        short: t ? (t.shortName ?? t.knownAs ?? shortTempleName(t)) : o.townWide ? "Town-wide" : "",
        placeHref: t && hasPage(t) ? `/${t.region}/${t.id}` : undefined,
        label: o.label,
        noteHref: o.note ? `/field-notes/${o.note}` : undefined,
        tbc: o.tbc,
        observances: (await getObservancesById(o.observances)).map((x) => ({
          label: x.name,
          href: festivalPath(x.id),
        })),
      };
    }),
  );
}
