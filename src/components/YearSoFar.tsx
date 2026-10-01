import Link from "next/link";
import type { CalendarSystem, Occasion } from "@/content/types";
import { dateParts, localMonth } from "@/lib/calendar";

/** A temple's ritual year as witnessed, grouped by local month. It grows
    only as the team records what they attend — no dates to keep up.
    `newestFirst` turns the months, and the dates within them, latest first. */
export function YearSoFar({
  occasions,
  calendar,
  newestFirst = false,
}: {
  occasions: Occasion[];
  calendar: CalendarSystem;
  newestFirst?: boolean;
}) {
  const ordered = newestFirst ? [...occasions].sort((a, b) => b.date.localeCompare(a.date)) : occasions;
  const groups: { month: string; items: Occasion[] }[] = [];
  for (const o of ordered) {
    const month = localMonth(calendar, o.date) ?? dateParts(o.date).month;
    const last = groups[groups.length - 1];
    if (last && last.month === month) last.items.push(o);
    else groups.push({ month, items: [o] });
  }

  return (
    <div>
      {groups.map((g) => (
        <section key={g.month} className="year-month">
          <h3>{g.month}</h3>
          <ol className="year-items">
            {g.items.map((o) => {
              const d = dateParts(o.date);
              return (
                <li key={o.date + o.label}>
                  <time dateTime={o.date} className="year-date">
                    {d.day} {d.shortMonth}
                  </time>
                  <span className="year-what">
                    {o.label}
                    {o.note && (
                      <>
                        <br />
                        <Link href={`/field-notes/${o.note}`} className="year-note">
                          Field note
                        </Link>
                      </>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
