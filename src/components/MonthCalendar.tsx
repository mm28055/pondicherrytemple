import Link from "next/link";
import { daysBetween, formatDate, monthDates, moonsBetween, type TamilMonth } from "@/lib/calendar";

export interface CalendarEvent {
  date: string;
  place: string;
  label: string;
  href?: string;
}

const WEEK = [
  ["Sun", "ஞாயிறு"],
  ["Mon", "திங்கள்"],
  ["Tue", "செவ்வாய்"],
  ["Wed", "புதன்"],
  ["Thu", "வியாழன்"],
  ["Fri", "வெள்ளி"],
  ["Sat", "சனி"],
];

const MOON = {
  full: { ta: "பௌர்ணமி", en: "Full moon (pournami)" },
  new: { ta: "அமாவாசை", en: "New moon (amavasai)" },
};

/** One Tamil month in one year, laid out like the sheet calendar on a
    Tamil kitchen wall: the English date large, the day of the Tamil month
    small, the full and new moons marked — and the days the team was at the
    temples filled in. */
export function MonthCalendar({
  month,
  year,
  events,
  today,
}: {
  month: TamilMonth;
  year: number;
  events: CalendarEvent[];
  today: string;
}) {
  const { first, last } = monthDates(month.slug, year);
  const days = daysBetween(first, last);
  const moons = moonsBetween(first, last);
  const blanks = new Date(`${first}T00:00:00Z`).getUTCDay();
  const on = (day: string) => events.filter((e) => e.date === day);
  const marked = days.filter((d) => on(d).length > 0);

  const item = (e: CalendarEvent) => (
    <>
      <span className="cal-place">{e.place}</span>
      {e.label && ` · ${e.label}`}
    </>
  );

  return (
    <section className="month-cal">
      <div className="month-cal-head">
        <h2>
          {month.name} {year}
        </h2>
        <span className="month-cal-dates">
          {formatDate(first)} – {formatDate(last)}
        </span>
      </div>

      <div className="cal" role="grid" aria-label={`${month.name} ${year}`}>
        {WEEK.map(([en, ta]) => (
          <div key={en} className="cal-wd" role="columnheader">
            <span lang="ta">{ta}</span>
            <span className="caps">{en}</span>
          </div>
        ))}
        {Array.from({ length: blanks }, (_, i) => (
          <div key={`b${i}`} className="cal-blank" aria-hidden="true" />
        ))}
        {days.map((day, i) => {
          const evs = on(day);
          const moon = moons.get(day);
          return (
            <div
              key={day}
              role="gridcell"
              className={`cal-day${evs.length ? " has" : ""}${day === today ? " today" : ""}`}
            >
              <div className="cal-top">
                <span className="cal-num">{Number(day.slice(8))}</span>
                <span className="cal-ta" title={`${month.name} ${i + 1}`}>
                  {i + 1}
                </span>
              </div>
              {moon && (
                <span className={`cal-moon ${moon}`} title={MOON[moon].en}>
                  <span className="dot" aria-hidden="true" />
                  <span lang="ta">{MOON[moon].ta}</span>
                </span>
              )}
              {evs.length > 0 && (
                <ul className="cal-evs">
                  {evs.map((e) => (
                    <li key={e.place + e.label}>{e.href ? <Link href={e.href}>{item(e)}</Link> : item(e)}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* on a phone the days are too narrow for words: what happened, listed below */}
      {marked.length > 0 ? (
        <ul className="cal-list">
          {marked.map((day) => (
            <li key={day}>
              <time dateTime={day}>{formatDate(day)}</time>
              <ul>
                {on(day).map((e) => (
                  <li key={e.place + e.label}>{e.href ? <Link href={e.href}>{item(e)}</Link> : item(e)}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p className="note-line month-cal-none">
          No days recorded yet in {month.name} {year}.
        </p>
      )}

      <p className="month-cal-key">
        <span className="cal-moon full">
          <span className="dot" aria-hidden="true" /> pournami, full moon
        </span>
        <span className="cal-moon new">
          <span className="dot" aria-hidden="true" /> amavasai, new moon
        </span>
        <span>Small numbers: the day of {month.name}.</span>
      </p>
    </section>
  );
}
