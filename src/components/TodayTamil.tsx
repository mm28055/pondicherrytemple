"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { DayDialog, type CalendarEvent } from "@/components/MonthCalendar";
import { tamilDate, todayInIndia, type TamilDate } from "@/lib/tamilDate";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/* Today's Tamil date. Worked out in the browser,
   because the page itself is built ahead of time and would otherwise show
   the day it was built. A click opens today in the calendar's pop-up,
   dropping down from just under the Tamil date. */
export function TodayTamil({ events }: { events: CalendarEvent[] }) {
  const [today, setToday] = useState<{ t: TamilDate; civil: string; iso: string } | null>(null);
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState<CSSProperties | undefined>();
  const box = useRef<HTMLElement>(null);
  const tamil = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const { y, m, d, weekday } = todayInIndia();
    setToday({
      t: tamilDate(y, m, d),
      civil: `${WEEKDAYS[weekday]}, ${d} ${MONTHS[m - 1]} ${y}`,
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
    setOpen(true);
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
        {today.t.day} {today.t.month.en}, {today.t.year} year
      </span>
      <span className="caps">{today.civil}</span>
    </>
  );

  return (
    <aside className="today" aria-label="Today in the Tamil calendar" ref={box}>
      {today &&
        (recorded ? (
          <>
            <button type="button" className="today-link" onClick={show} title="See what was recorded today">
              {words}
            </button>
            <DayDialog
              day={open ? today.iso : null}
              events={events}
              onClose={() => setOpen(false)}
              className={place ? "day-by-today" : undefined}
              style={place}
            />
          </>
        ) : (
          <div className="today-link is-plain">{words}</div>
        ))}
      {/* the year's calendar, scrolled to, on the Calendar page */}
      {today && (
        <Link className="arrow-link today-more" href="/calendar#calendar">
          Full calendar
        </Link>
      )}
    </aside>
  );
}
