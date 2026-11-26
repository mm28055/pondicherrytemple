import type { CalendarEvent } from "@/components/MonthCalendar";
import type { Occasion } from "@/content/types";
import { getFieldNotes, getObservancesById, getTemple, hasPage } from "@/lib/data";
import { shortTempleName } from "@/lib/view";
import { festivalPath } from "@/lib/festivals";
import { labelTa, MONTH_TA, scheduleTa, timeTa } from "@/content/eventsTa";
import { templeShortTa, templeTa } from "@/content/homeTa";
import { titleTa } from "@/content/notesTa";
import { said } from "@/content/saidTa";
import { tamilOf } from "@/lib/tamilPages";

/** Recorded days as the calendar and its pop-up show them: the temple (its
    full name, and its short one for a day's box), what happened, its field
    note, and the festivals and rituals it was part of. With `ta`, in Tamil
    (content/eventsTa). */
export async function calendarEvents(occasions: Occasion[], ta = false): Promise<CalendarEvent[]> {
  // on each day, those confirmed before those still to be confirmed
  const ordered = [...occasions].sort((a, b) => a.date.localeCompare(b.date) || Number(a.tbc) - Number(b.tbc));
  const titles = new Map((await getFieldNotes()).map((n) => [n.id, n.title?.trim() || n.occasion]));
  const events = await Promise.all(
    ordered.map(async (o) => {
      const t = o.townWide ? null : await getTemple(o.region, o.temple);
      return {
        date: o.date,
        // an event of the whole town has no temple
        place: t ? (ta ? templeTa(t.id, t.knownAs ?? t.name) : (t.knownAs ?? t.name)) : o.townWide ? (ta ? MONTH_TA.townWide : "Town-wide") : "",
        // in a day's box: the temple's short name ("Lawspet Murugan"), if it has one;
        // else the name the town uses, kept whole; else its name without "Koil"
        short: t ? (ta ? templeShortTa(t.id, t.shortName ?? t.knownAs ?? shortTempleName(t)) : (t.shortName ?? t.knownAs ?? shortTempleName(t))) : o.townWide ? (ta ? MONTH_TA.townWide : "Town-wide") : "",
        placeHref: t && hasPage(t) ? ((ta && tamilOf(`/${t.region}/${t.id}`)) || `/${t.region}/${t.id}`) : undefined,
        label: ta && o.label ? labelTa(o.label) : o.label,
        noteHref: o.note ? `${ta ? "/ta" : ""}/field-notes/${o.note}` : undefined,
        noteTitle: o.note ? (ta ? titleTa(o.note, titles.get(o.note) ?? "களக்குறிப்பு") : (titles.get(o.note) ?? "Field note")) : undefined,
        tbc: o.tbc,
        schedule: ta ? o.schedule?.map((s) => ({ time: timeTa(s.time), what: scheduleTa(s.what) })) : o.schedule,
        observances: (await getObservancesById(o.observances)).map((x) => ({
          label: (ta && (x.tamil || said(x.name))) || x.name,
          href: festivalPath(x.id),
        })),
      };
    }),
  );
  return events;
}
