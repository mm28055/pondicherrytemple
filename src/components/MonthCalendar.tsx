import Link from "next/link";
import { daysBetween, formatDate, monthDates, moonsBetween, type TamilMonth } from "@/lib/calendar";

export interface CalendarEvent {
  date: string;
  /** The temple, and its page; `short` without "Koil" or "Devasthanam". */
  place: string;
  short: string;
  placeHref?: string;
  /** What happened, and the field note about it. */
  label: string;
  noteHref?: string;
  /** The festivals and rituals it was part of, each with its page. */
  observances: { label: string; href: string }[];
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

/** At most this many entries in a day's box; the rest are in the list below. */
const IN_BOX = 2;

/** Long words may break, with a hyphen, every few letters: in a narrow box
    "Shankhabhishekam" becomes "Shankh-abhishekam" rather than spilling out. */
const breakable = (text: string) => text.replace(/\S{9,}/g, (w) => w.replace(/(.{5})(?=.{3})/g, "$1\u00AD"));

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
  // a box that can't show all its day: the list below is then shown even on a laptop
  const overflows = marked.some((d) => on(d).length > IN_BOX);

  // the temple, what happened, and the festivals it was part of — each its own
  // link. In a box: the short name, words that can break, and at most three
  // lines of it; in the list below: everything, in full.
  const item = (e: CalendarEvent, inBox: boolean) => {
    const fit = inBox ? breakable : (text: string) => text;
    const place = fit(inBox ? e.short : e.place);
    return (
      <>
        <span className="cal-line">
          {e.placeHref ? (
            <Link className="cal-place" href={e.placeHref} title={e.place}>
              {place}
            </Link>
          ) : (
            <span className="cal-place">{place}</span>
          )}
          {e.label && (
            <span className="cal-label">
              {" · "}
              {e.noteHref ? (
                <Link className="cal-note" href={e.noteHref} title="Read the field note">
                  {e.label}
                </Link>
              ) : (
                e.label
              )}
            </span>
          )}
        </span>
        {e.observances.length > 0 && (
          <span className="cal-tags">
            {e.observances.map((o) => (
              <Link key={o.href} href={o.href} title={o.label}>
                {fit(o.label)}
              </Link>
            ))}
          </span>
        )}
      </>
    );
  };

  return (
    <section className={`month-cal${overflows ? " overflows" : ""}`}>
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
                {evs.length ? (
                  // on a phone, where the words are hidden, a tap goes to the day in the list below
                  <a className="cal-num" href={`#day-${day}`}>
                    {Number(day.slice(8))}
                  </a>
                ) : (
                  <span className="cal-num">{Number(day.slice(8))}</span>
                )}
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
                  {evs.slice(0, IN_BOX).map((e) => (
                    <li key={e.place + e.label}>{item(e, true)}</li>
                  ))}
                  {evs.length > IN_BOX && (
                    <li className="cal-more">
                      <a href={`#day-${day}`}>+ {evs.length - IN_BOX} more</a>
                    </li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* where the boxes are too narrow for everything: the days in full, listed below */}
      {marked.length > 0 ? (
        <ul className="cal-list">
          {marked.map((day) => (
            <li key={day} id={`day-${day}`}>
              <time dateTime={day}>{formatDate(day)}</time>
              <ul>
                {on(day).map((e) => (
                  <li key={e.place + e.label}>{item(e, false)}</li>
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
