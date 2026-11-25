"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { DayDialog, type CalendarEvent } from "@/components/MonthCalendar";
import { daysBetween, monthDates, monthYearOf, tamilMonthOf } from "@/lib/calendar";
import { HOME_TA, MONTHS_TA, NAV_TA, WEEKDAYS_TA } from "@/content/homeTa";
import { useStripeFit } from "@/lib/stripes";
import { tamilDate, todayInIndia, type TamilDate } from "@/lib/tamilDate";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/* Today's Tamil date. Worked out in the browser,
   because the page itself is built ahead of time and would otherwise show
   the day it was built. A click opens today in the calendar's pop-up,
   dropping down from just under the Tamil date. With `month` (the home
   page), on a phone the Tamil month drawn small in plain squares, today's red, as wide
   as a photograph above it, the words beside it (site.css). With `ta`, its
   words in Tamil (the Tamil home page). */
export function TodayTamil({ events, month = false, ta = false }: { events: CalendarEvent[]; month?: boolean; ta?: boolean }) {
  const [today, setToday] = useState<{ t: TamilDate; civil: string; civilTa: string; shortTa: string; short: string; iso: string } | null>(null);
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(false); // the Calendar page as a circle (site.css)
  const [place, setPlace] = useState<CSSProperties | undefined>();
  const box = useRef<HTMLElement>(null);
  const tamil = useRef<HTMLSpanElement>(null);
  // a photograph's width in the rows above, and the space between two (HomeStrip)
  const fit = useStripeFit(box);
  const across = fit ? Math.max(1, Math.floor((fit.units + 1) / 3)) : 3;

  useEffect(() => {
    const { y, m, d, weekday } = todayInIndia();
    setToday({
      t: tamilDate(y, m, d),
      civil: `${WEEKDAYS[weekday]}, ${d} ${MONTHS[m - 1]} ${y}`,
      civilTa: `${d} ${MONTHS_TA[m - 1]} ${y}, ${WEEKDAYS_TA[weekday]}`,
      shortTa: `${WEEKDAYS_TA[weekday].replace(/ற்றுக்கிழமை$|ட்கிழமை$|க்கிழமை$|கிழமை$/, (e) => (e === "ற்றுக்கிழமை" ? "று" : e === "ட்கிழமை" ? "கள்" : ""))}, ${d} ${MONTHS_TA[m - 1]}`,
      short: `${WEEKDAYS[weekday].slice(0, 3)}, ${d} ${MONTHS[m - 1].slice(0, 3)}`,
      iso: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    });
  }, []);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 860px)");
    const look = () => setPhone(narrow.matches);
    look();
    narrow.addEventListener("change", look);
    return () => narrow.removeEventListener("change", look);
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
      <span className="kicker">{ta ? HOME_TA.today : "Today"}</span>
      <span className="today-tamil" lang="ta" ref={tamil}>
        {today.t.month.ta} {today.t.day}
      </span>
      <span className="today-en">
        {ta ? (
          HOME_TA.year(today.t.yearTa)
        ) : (
          <>
            {today.t.day} {today.t.month.en}
            <span className="today-year">, {today.t.year} year</span>
          </>
        )}
      </span>
      <span className="caps">
        <span className="today-civil-long">{ta ? today.civilTa : today.civil}</span>
        {/* "Wed, 4 Nov" in the small box beside a page's title */}
        <span className="today-civil-short">{ta ? today.shortTa : today.short}</span>
      </span>
    </>
  );

  return (
    <aside
      className="today"
      aria-label={ta ? HOME_TA.todayIs : "Today in the Tamil calendar"}
      ref={box}
      style={month && fit ? ({ "--across": across, "--tile-gap": `${fit.gap}px` } as CSSProperties) : undefined}
    >
      {today && month && <MonthTable today={today.iso} label={ta ? HOME_TA.thisMonth : undefined} base={ta ? "/ta" : ""} />}
      {today &&
        (recorded ? (
          <>
            <button type="button" className="today-link" onClick={show} title={ta ? HOME_TA.todaySee : "See what was recorded today"}>
              {words}
            </button>
            <DayDialog
              day={open ? today.iso : null}
              events={events}
              ta={ta}
              onClose={() => setOpen(false)}
              className={place ? "day-by-today" : undefined}
              style={place}
            />
          </>
        ) : (
          <div className="today-link is-plain">{words}</div>
        ))}
      {/* the Calendar page: on a computer, scrolled to its chart; on a phone, its top */}
      {today && (
        <Link className="arrow-link today-more" href={`${ta ? "/ta" : ""}${phone ? "/calendar" : "/calendar#calendar"}`}>
          {/* "Calendar" alone in the small box beside a page's title, on a phone */}
          <span className="today-more-long">{ta ? HOME_TA.fullCalendar : "Full calendar"}</span>
          <span className="today-more-short">{ta ? NAV_TA["/calendar"] : "Calendar"}</span>
        </Link>
      )}
    </aside>
  );
}

/** The Tamil month we are in, drawn in plain squares: one for each of its
    days, laid out as on the month's own page (Sunday first, the first day
    under its weekday), today's red. It opens that page. */
function MonthTable({ today, label = "This month's calendar", base = "" }: { today: string; label?: string; base?: string }) {
  const slug = tamilMonthOf(today);
  const year = monthYearOf(today);
  const { first, last } = monthDates(slug, year);
  const start = new Date(`${first}T00:00:00Z`).getUTCDay() + 1;
  return (
    <Link className="today-month" href={`${base}/festivals-and-rituals/month/${slug}/${year}`} aria-label={label}>
      {daysBetween(first, last).map((d, i) => (
        <span key={d} className={d === today ? "now" : undefined} style={i ? undefined : { gridColumnStart: start }} />
      ))}
    </Link>
  );
}
