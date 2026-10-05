"use client";

import Link from "next/link";
import { FestivalLink } from "@/components/FestivalLink";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react";
import {
  daysBetween,
  formatDate,
  monthDates,
  monthYearOf,
  moonsBetween,
  TAMIL_MONTHS,
  tamilMonthOf,
  type TamilMonth,
} from "@/lib/calendar";

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
  observances: { label: string; href?: string }[];
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

/** One entry in a day's box (then "+ N more"): a click opens the day in full. */
const IN_BOX = 1;

/** Long words may break, with a hyphen, between their syllables: in a narrow
    box "Brahmotsavam" becomes "Brah-mot-sa-vam" rather than spilling out.
    The names are Tamil and Sanskrit in Roman letters, so a break goes before
    a single consonant (sa-vam) or between two (Brah-mot); "bh", "sh", "th"
    and the like count as one. The browser shows a hyphen only where it breaks. */
const DIGRAPHS = ["bh", "ch", "dh", "gh", "jh", "kh", "ph", "sh", "th", "zh"];
const isVowel = (c: string) => "aeiou".includes(c.toLowerCase());

function syllables(word: string): string {
  const units: { at: number; vowel: boolean }[] = [];
  for (let i = 0; i < word.length; ) {
    const n = DIGRAPHS.includes(word.slice(i, i + 2).toLowerCase()) ? 2 : 1;
    units.push({ at: i, vowel: n === 1 && isVowel(word[i]) });
    i += n;
  }
  const cuts: number[] = [];
  for (let i = 0; i < units.length; i++) {
    if (!units[i].vowel || units[i + 1]?.vowel !== false) continue; // a vowel, then consonants
    let j = i + 1;
    while (j < units.length && !units[j].vowel) j++;
    if (j >= units.length) break; // consonants to the end of the word
    const cut = j - i === 2 ? units[i + 1].at : units[i + 2].at; // V-CV, or VC-CV
    if (cut >= 3 && word.length - cut >= 3) cuts.push(cut);
  }
  return cuts.reduceRight((w, c) => w.slice(0, c) + "\u00AD" + w.slice(c), word);
}

const breakable = (text: string) => text.replace(/[A-Za-z]{8,}/g, syllables);

const MOON = {
  full: { ta: "பௌர்ணமி", en: "Full moon (pournami)" },
  new: { ta: "அமாவாசை", en: "New moon (amavasya)" },
};

/** The temple, what happened, and the festivals it was part of — each its own
    link. In a box: the short name, words that can break, the festivals'
    names, and no links (a click anywhere on the day opens it); in the
    pop-up and the list below: everything, in full. */
function item(e: CalendarEvent, inBox: boolean) {
  const fit = inBox ? breakable : (text: string) => text;
  const place = fit(inBox ? e.short : e.place);
  return (
    <>
      <span className="cal-line">
        {e.placeHref && !inBox ? (
          <Link className="cal-place" href={e.placeHref} title={e.place}>
            {place}
          </Link>
        ) : (
          <span className="cal-place">{place}</span>
        )}
        {/* In a box, under the temple's name: the festivals and rituals the day is
            tagged with (its title only if it has none). In the pop-up: its title. */}
        {inBox ? (
          (e.observances.length > 0 || e.label) && (
            <span className="cal-label">{e.observances.map((o) => o.label).join(", ") || e.label}</span>
          )
        ) : (
          e.label && <span className="cal-label"> · {e.label}</span>
        )}
      </span>
      {!inBox && e.observances.length > 0 && (
        <span className="cal-tags">
          {e.observances.map((o) => (
            <FestivalLink key={o.label} href={o.href} title={o.label}>
              {fit(o.label)}
            </FestivalLink>
          ))}
        </span>
      )}
      {/* the field note about the day, if there is one: a link of its own */}
      {!inBox && e.noteHref && (
        <Link className="cal-read arrow-link" href={e.noteHref}>
          Read the field note
        </Link>
      )}
    </>
  );
}

/** A day, large, over the page: its date, English and Tamil, the moon, and
    everything recorded on it. On a month's calendar, and from the home
    page's "Today". Shown while `day` is set; closing it calls onClose. */
export function DayDialog({
  day,
  events,
  onClose,
  className,
  style,
}: {
  day: string | null;
  events: CalendarEvent[];
  onClose: () => void;
  /** where it sits, when not in the middle of the screen (the home page's "Today") */
  className?: string;
  style?: CSSProperties;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (day && !dialog.current?.open) dialog.current?.showModal();
  }, [day]);
  const month = day ? TAMIL_MONTHS.find((m) => m.slug === tamilMonthOf(day))! : null;
  const dayOfMonth = day && month ? daysBetween(monthDates(month.slug, monthYearOf(day)).first, day).length : 0;
  const moon = day ? moonsBetween(day, day).get(day) : undefined;
  const on = day ? events.filter((e) => e.date === day) : [];
  return (
    <dialog
      ref={dialog}
      className={`day-dialog${className ? ` ${className}` : ""}`}
      style={{ ...(month ? ({ "--m": month.colour } as CSSProperties) : {}), ...style }}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
    >
      {day && month && (
        <>
          <button type="button" className="day-close" onClick={() => dialog.current?.close()} aria-label="Close">
            ×
          </button>
          <div className="day-head">
            <span className="day-num">{Number(day.slice(8))}</span>
            <span>
              <span className="day-date">
                {
                  ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
                    new Date(`${day}T00:00:00Z`).getUTCDay()
                  ]
                }
                , {formatDate(day)}
              </span>
              <span className="day-local">
                {month.name} {dayOfMonth} ·{" "}
                <span lang="ta">
                  {month.tamil} {dayOfMonth}
                </span>
              </span>
              {moon && (
                <span className={`cal-moon ${moon}`}>
                  <span className="dot" aria-hidden="true" />
                  <span lang="ta">{MOON[moon].ta}</span> · {MOON[moon].en}
                </span>
              )}
            </span>
          </div>
          {on.length > 0 ? (
            <ul className="day-events">
              {on.map((e) => (
                <li key={e.place + e.label}>{item(e, false)}</li>
              ))}
            </ul>
          ) : (
            <p className="day-none">Nothing recorded on this day.</p>
          )}
        </>
      )}
    </dialog>
  );
}

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
  const weeks = Math.ceil((blanks + days.length) / 7); // the boxes share the screen's height

  // On a phone the boxes hold only the date: a dot marks the days the team was
  // there, and the chosen day is shown under the grid — the first one to begin
  // with, so there is always something to read.
  const [selected, setSelected] = useState<string | null>(marked[0] ?? null);
  const [showAll, setShowAll] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  // A click anywhere on a day, but on its own links, opens it: in a pop-up
  // over the page, or on a phone, under the grid.
  const [open, setOpen] = useState<string | null>(null);
  const choose = (e: MouseEvent | KeyboardEvent, day: string) => {
    if ((e.target as HTMLElement).closest("a")) return; // the temple, a festival, a field note
    e.preventDefault();
    if (panel.current && getComputedStyle(panel.current).display !== "none") setSelected(day);
    else setOpen(day);
  };

  return (
    <section className="month-cal">

      <div
        className="cal"
        role="grid"
        aria-label={`${month.name} ${year}`}
        style={{ "--weeks": weeks } as CSSProperties}
      >
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
              // only a day with something recorded opens
              tabIndex={evs.length ? 0 : undefined}
              aria-label={`${formatDate(day)}${evs.length ? `: ${evs.length} recorded` : ""}`}
              onClick={evs.length ? (e) => choose(e, day) : undefined}
              onKeyDown={evs.length ? (e) => (e.key === "Enter" || e.key === " ") && choose(e, day) : undefined}
              className={`cal-day${evs.length ? " has" : ""}${day === today ? " is-today" : ""}${
                day === selected ? " selected" : ""
              }`}
            >
              <div className="cal-top">
                <span className="cal-num">
                  {Number(day.slice(8))}
                  {/* the full or new moon: just its white or black disc, beside the date */}
                  {moon && (
                    <span className={`cal-moon in-box ${moon}`} title={MOON[moon].en} aria-label={MOON[moon].en}>
                      <span className="dot" aria-hidden="true" />
                    </span>
                  )}
                </span>
                <span className="cal-ta" title={`${month.name} ${i + 1}`}>
                  {i + 1}
                </span>
              </div>
              {evs.length > 0 && <span className="cal-dot" aria-hidden="true" />}
              {evs.length > 0 && (
                <ul className="cal-evs">
                  {evs.slice(0, IN_BOX).map((e) => (
                    <li key={e.place + e.label}>{item(e, true)}</li>
                  ))}
                  {evs.length > IN_BOX && (
                    <li className="cal-more">+ {evs.length - IN_BOX} more</li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* on a phone: the chosen day */}
      {marked.length > 0 && (
        <div className="cal-panel" ref={panel} aria-live="polite">
          {selected && (
            <>
              <div className="cal-panel-date">
                {WEEK[new Date(`${selected}T00:00:00Z`).getUTCDay()][0]} · {formatDate(selected)} · {month.name}{" "}
                {days.indexOf(selected) + 1}
              </div>
              <ul>
                {on(selected).map((e) => (
                  <li key={e.place + e.label}>{item(e, false)}</li>
                ))}
              </ul>
            </>
          )}
          <button className="cal-all" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}>
            {showAll
              ? "Hide the list"
              : marked.length === 1
                ? "See 1 recorded day as a list"
                : `See ${marked.length} recorded days as a list`}
          </button>
        </div>
      )}

      {/* where the boxes are too narrow for everything: the days in full, listed below */}
      {marked.length > 0 ? (
        <ul className={`cal-list${showAll ? " open" : ""}`}>
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

      {/* A day, large, over the page */}
      <DayDialog day={open} events={events} onClose={() => setOpen(null)} />

    </section>
  );
}
