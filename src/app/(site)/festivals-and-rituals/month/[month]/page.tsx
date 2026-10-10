import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import {
  getDummyPhotos,
  getLineBegins,
  getOccasionsInMonth,
  getSpecialNakshatras,
  getVaramDays,
  getWeeklyRituals,
} from "@/lib/data";
import type { Photo } from "@/content/types";
import { monthDates, monthYearOf, TAMIL_MONTHS, tamilMonthOf, type TamilMonth } from "@/lib/calendar";
import { calendarEvents } from "@/lib/calendarEvents";
import { nakshatrasBetween, specialDays, tithisBetween } from "@/lib/tithi";
import { MonthCalendar } from "@/components/MonthCalendar";
import { MonthMotif } from "@/components/MonthMotif";
import { MonthSwipe } from "@/components/MonthSwipe";
import { MonthJump } from "@/components/MonthJump";
import { WeeklyRituals } from "@/components/WeeklyRituals";

type Props = { params: Promise<{ month: string; year?: string }> };

// Rebuilt once a day, so "today" on the calendar moves on by itself.
export const revalidate = 86400;

export function generateStaticParams() {
  return TAMIL_MONTHS.map((m) => ({ month: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { month: slug, year } = await params;
  const m = TAMIL_MONTHS.find((x) => x.slug === slug);
  return m
    ? {
        title: `${m.name}${year ? ` ${year}` : ""}: festivals & rituals`,
        description: `The festivals and rituals of ${m.name}, ${m.span}.`,
      }
    : {};
}

/** One Tamil month, in one year: its calendar, and under it Varam, what the
    temples do every week, with the photographs of each day. The months run on
    in a line from Masi 2026 (the month before the team began), with no end:
    /month/panguni/2027 is the next Panguni. /month/panguni, without a year,
    is the month in the cycle of twelve we are in now. */
export default async function MonthPage({ params }: Props) {
  const { month: slug, year: asked } = await params;
  const at = TAMIL_MONTHS.findIndex((m) => m.slug === slug);
  if (at < 0) notFound();
  const month = TAMIL_MONTHS[at];
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const begins = await getLineBegins();
  const y = asked ? Number(asked) : yearNow(slug, begins, today);
  // nothing before the team began
  if (!Number.isInteger(y) || monthDates(slug, y).first < begins || y > Number(today.slice(0, 4)) + 100) notFound();

  // the months either side, in the line: none before the first
  const prev = step(at, y, -1, begins);
  const next = step(at, y, 1, begins);
  const href = (s: Step) => `/festivals-and-rituals/month/${s.month.slug}/${s.year}`;

  // Varam: what is done every week, and stand-in photographs for each day's temples
  const weekly = await getWeeklyRituals();
  const character = await getVaramDays();
  const weeklyPhotos: Record<string, Photo[]> = {};
  for (const r of weekly)
    for (const d of r.days)
      for (const t of r.temples) weeklyPhotos[`${d}|${t.key}`] ??= await getDummyPhotos(`varam-${d}-${t.key}`, 6);

  // the nakshatrams kept specially, by month (rules set in the admin)
  const special = await getSpecialNakshatras();
  // the calendar: the days the team was present this month, this year
  const events = await daysIn(slug, y);
  // the months either side, ready beside the calendar to be swiped in
  const beside = async (s: Step | null) =>
    s && (
      <div style={{ "--m": s.month.colour } as CSSProperties}>
        <MonthCalendar
          month={s.month}
          year={s.year}
          events={await daysIn(s.month.slug, s.year)}
          tithis={tithisIn(s.month.slug, s.year)}
          nakshatras={nakshatrasIn(s.month.slug, s.year)}
          special={specialIn(s.month.slug, s.year, special)}
          today={today}
        />
      </div>
    );
  const [before, after] = await Promise.all([beside(prev), beside(next)]);

  return (
    // the month's colour (--mt, which glides to the next month's as it is swiped in)
    <div className="wrap month-page" style={{ "--mt": month.colour } as CSSProperties}>
      <header className="page-head month-head">
        <div className="month-topline">
          {/* back to the year's chart, which the month belongs to */}
          <Link className="crumb" href="/calendar">
            ← Calendar
          </Link>
        </div>
        <div className="month-head-text">
          <p className="tamil-title" lang="ta">
            {month.tamil}
          </p>
          <h1 className="name-title">{month.name}</h1>
          {/* the span, and the year of the calendar below */}
          <p className="gloss kicker">
            {month.span} {yearLabel(slug, y)}
          </p>
        </div>
        <MonthMotif month={slug} className={`month-head-motif month-head-motif-${slug}`} />
      </header>

      {/* Any month, not only those either side: a month and a year, from the calendar's first month to two years on */}
      <MonthJump
        month={slug}
        year={y}
        begins={begins}
        years={Array.from({ length: Number(today.slice(0, 4)) + 3 - Number(begins.slice(0, 4)) }, (_, i) => Number(begins.slice(0, 4)) + i)}
      />

      {/* The months either side again, beside the calendar: no need to go back up */}
      <div className="cal-with-steps">
        {/* scroll={false}: the next month opens where you are, the calendar in view */}
        {prev ? (
          <Link className="cal-step prev" href={href(prev)} scroll={false}>
            <span className="cal-step-arrow" aria-hidden="true">
              ←
            </span>
            <span className="cal-step-name">{prev.month.name}</span>
          </Link>
        ) : (
          <span className="cal-step prev" aria-hidden="true" />
        )}
        {/* swiped to the months either side, with a finger or two on a trackpad */}
        <MonthSwipe
          prev={prev && href(prev)}
          next={next && href(next)}
          before={before}
          after={after}
          colours={[prev?.month.colour ?? "", next?.month.colour ?? ""]}
        >
          <MonthCalendar month={month} year={y} events={events} tithis={tithisIn(slug, y)}
            nakshatras={nakshatrasIn(slug, y)}
            special={specialIn(slug, y, special)}
            today={today}
          />
        </MonthSwipe>
        {next ? (
          <Link className="cal-step next" href={href(next)} scroll={false}>
            <span className="cal-step-arrow" aria-hidden="true">
              →
            </span>
            <span className="cal-step-name">{next.month.name}</span>
          </Link>
        ) : (
          <span className="cal-step next" aria-hidden="true" />
        )}
      </div>

      {/* Varam: what the temples do every week */}
      <section className="section tight varam-section" id="varam">
        <div className="section-head">
          <h2>
            <span lang="ta">வாரம்</span> Varam · Every week
          </h2>
        </div>
        <WeeklyRituals rituals={weekly} photos={weeklyPhotos} character={character} />
      </section>
    </div>
  );
}

/** A month's year, as "2026"; or "2026–27" for one that runs into the next
    (Margazhi, from mid-December). */
function yearLabel(slug: string, year: number): string {
  const { first, last } = monthDates(slug, year);
  return first.slice(0, 4) === last.slice(0, 4) ? String(year) : `${year}–${last.slice(2, 4)}`;
}

/** A month's year in the cycle of twelve we are in now: the cycles run from
    the month the line begins with (Masi to Thai), the first from its start. */
function yearNow(slug: string, begins: string, today: string): number {
  const firstSlug = tamilMonthOf(begins);
  let y = Number(today.slice(0, 4));
  while (monthDates(firstSlug, y).first > today) y--;
  const cycle = monthDates(firstSlug, y).first < begins ? begins : monthDates(firstSlug, y).first;
  let year = Number(cycle.slice(0, 4));
  if (monthDates(slug, year).first < cycle) year++;
  return year;
}

type Step = { month: TamilMonth; year: number };

/** The month before (-1) or after (1) a month, and its year; none before the
    line of months begins. */
function step(at: number, year: number, way: -1 | 1, begins: string): Step | null {
  const m = TAMIL_MONTHS[(at + way + 12) % 12];
  const here = monthDates(TAMIL_MONTHS[at].slug, year).first;
  let y = year;
  const there = monthDates(m.slug, y).first;
  if (way > 0 && there <= here) y++;
  if (way < 0 && there >= here) y--;
  if (monthDates(m.slug, y).first < begins) return null;
  return { month: m, year: y };
}

/** The days the team was present in a month, in one year. */
async function daysIn(slug: string, year: number) {
  return (await calendarEvents(await getOccasionsInMonth(slug))).filter((e) => monthYearOf(e.date) === year);
}

/** The tithis kept in a month, in a year: day → its tithis. */
function tithisIn(slug: string, year: number) {
  const { first, last } = monthDates(slug, year);
  return Object.fromEntries(tithisBetween(first, last));
}

/** The days a month's special nakshatrams fall on, in a year. */
function specialIn(slug: string, year: number, rules: Record<string, { nakshatram: string }[]>) {
  const { first, last } = monthDates(slug, year);
  return specialDays(first, last, (rules[slug] ?? []).map((r) => r.nakshatram));
}

/** Each day's nakshatras in a month, in a year. */
function nakshatrasIn(slug: string, year: number) {
  const { first, last } = monthDates(slug, year);
  return nakshatrasBetween(first, last);
}

