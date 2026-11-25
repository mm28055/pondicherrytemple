"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { DayDialog, type CalendarEvent } from "@/components/MonthCalendar";
import { tamilDate, todayInIndia, type TamilDate } from "@/lib/tamilDate";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** The week a day is in, Sunday to Saturday: each day's date, English and Tamil. */
function weekOf(iso: string) {
  const at = Date.parse(`${iso}T00:00:00Z`);
  const sunday = at - new Date(at).getUTCDay() * 86_400_000;
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(sunday + i * 86_400_000);
    const [y, m, d] = [day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate()];
    const t = tamilDate(y, m, d);
    return { iso: day.toISOString().slice(0, 10), d, tamil: t.day, label: `${WEEKDAYS[i]}, ${d} ${MONTHS[m - 1]}, ${t.month.en} ${t.day}` };
  });
}

/* Today's Tamil date. Worked out in the browser,
   because the page itself is built ahead of time and would otherwise show
   the day it was built. A click opens today in the calendar's pop-up,
   dropping down from just under the Tamil date. With `week` (the home
   page), on a phone the seven days of the week under it, each opening its
   day, and "Full calendar" as a button (site.css). */
export function TodayTamil({ events, week = false }: { events: CalendarEvent[]; week?: boolean }) {
  const [today, setToday] = useState<{ t: TamilDate; civil: string; short: string; iso: string } | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [place, setPlace] = useState<CSSProperties | undefined>();
  const box = useRef<HTMLElement>(null);
  const tamil = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const { y, m, d, weekday } = todayInIndia();
    setToday({
      t: tamilDate(y, m, d),
      civil: `${WEEKDAYS[weekday]}, ${d} ${MONTHS[m - 1]} ${y}`,
      short: `${WEEKDAYS[weekday].slice(0, 3)}, ${d} ${MONTHS[m - 1].slice(0, 3)}`,
      iso: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    });
  }, []);

  // Under the Tamil date, over the rest of the box, its right edge on the
  // box's; on a screen too narrow for that, in the middle as on the calendars.
  const show = () => {
    const r = box.current?.getBoundingClientRect();
    const t = tamil.current?.getBoundingClientRect();
    if (r && t && window.innerWidth >= 700) {
      const width = 380;
      const vw = document.documentElement.clientWidth;
      const left = Math.max(16, Math.min(r.right - width, vw - width - 16));
      setPlace({ left, top: t.bottom + 12 + window.scrollY, width, "--caret": `${r.left + 34 - left}px` } as CSSProperties);
    } else setPlace(undefined);
    setOpen(today!.iso);
  };
  // the week today is in, Sunday to Saturday
  const days = today ? weekOf(today.iso) : [];
  const openDay = (iso: string) => {
    setPlace(undefined);
    setOpen(iso);
  };

  // it opens only when something was recorded today
  const recorded = today ? events.some((e) => e.date === today.iso) : false;
  const words = today && (
    <>
      <span className="kicker">Today</span>
      <span className="today-tamil" lang="ta" ref={tamil}>
        {today.t.month.ta} {today.t.day}
      </span>
      <span className="today-en">
        {today.t.day} {today.t.month.en}
        <span className="today-year">, {today.t.year} year</span>
      </span>
      <span className="caps">
        <span className="today-civil-long">{today.civil}</span>
        {/* "Wed, 4 Nov" in the small box beside a page's title */}
        <span className="today-civil-short">{today.short}</span>
      </span>
    </>
  );

  return (
    <aside className="today" aria-label="Today in the Tamil calendar" ref={box}>
      {today &&
        (recorded ? (
          <button type="button" className="today-link" onClick={show} title="See what was recorded today">
            {words}
          </button>
        ) : (
          <div className="today-link is-plain">{words}</div>
        ))}
      {today && week && (
        <div className="today-week">
          {days.map(({ iso, d, tamil, label }, i) => (
            <button
              key={iso}
              type="button"
              className={`today-day${iso === today.iso ? " now" : ""}${events.some((e) => e.date === iso) ? " has" : ""}`}
              aria-label={label}
              aria-current={iso === today.iso ? "date" : undefined}
              onClick={() => openDay(iso)}
            >
              <span className="today-day-name">{WEEKDAYS[i].slice(0, 3)}</span>
              <span className="today-day-num">{d}</span>
              <span className="today-day-tamil">{tamil}</span>
            </button>
          ))}
        </div>
      )}
      {today && (recorded || week) && (
        <DayDialog
          day={open}
          events={events}
          onClose={() => setOpen(null)}
          days={week && !place ? days.map((x) => x.iso) : undefined}
          onDay={setOpen}
          className={place ? "day-by-today" : undefined}
          style={place}
        />
      )}
      {/* the year's calendar, scrolled to, on the Calendar page */}
      {today && (
        <Link className="arrow-link today-more" href="/calendar#calendar">
          {/* "Calendar" alone in the small box beside a page's title, on a phone */}
          <span className="today-more-long">Full calendar</span>
          <span className="today-more-short">Calendar</span>
        </Link>
      )}
    </aside>
  );
}
