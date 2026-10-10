import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import {
  getObservancesById,
  getLineBegins,
  getOccasionsInMonth,
  getRitualYear,
  getTemple,
  hasPage,
  type MonthEntry,
} from "@/lib/data";
import { dateParts, monthDates, monthYearOf, TAMIL_MONTHS, tamilMonthOf, type TamilMonth } from "@/lib/calendar";
import { calendarEvents } from "@/lib/calendarEvents";
import { nakshatrasBetween, tithisBetween } from "@/lib/tithi";
import { MonthCalendar } from "@/components/MonthCalendar";
import { MonthMotif } from "@/components/MonthMotif";
import { MonthSwipe } from "@/components/MonthSwipe";
import { FestivalLink } from "@/components/FestivalLink";

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

/** One Tamil month, in one year: its calendar, and every festival and ritual
    that falls in it, with the days the team saw each one. The months run on
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

  const ritualYear = await getRitualYear();
  const entries = ritualYear.months[at].entries;
  const festivals = entries.filter((e) => e.observance.kind === "festival");
  const rituals = entries.filter((e) => e.observance.kind === "ritual");

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
          <nav className="month-steps" aria-label="Other months">
            {prev && <Link href={href(prev)}>← {prev.month.name}</Link>}
            {next && <Link href={href(next)}>{next.month.name} →</Link>}
          </nav>
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

      {festivals.length > 0 && <MonthSection title="Festivals" entries={festivals} />}
      {rituals.length > 0 && <MonthSection title="Rituals" entries={rituals} />}

      {ritualYear.throughYear.length > 0 && (
        <section className="section tight">
          <p className="note-line">
            Done all through the year, in {month.name} as in every month:{" "}
            {ritualYear.throughYear.map((o, i) => (
              <span key={o.id}>
                {i > 0 && ", "}
                <FestivalLink className="month-link" id={o.id}>
                  {o.name}
                </FestivalLink>
              </span>
            ))}
            .
          </p>
        </section>
      )}
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

/** Each day's nakshatras in a month, in a year. */
function nakshatrasIn(slug: string, year: number) {
  const { first, last } = monthDates(slug, year);
  return nakshatrasBetween(first, last);
}

/** A day's description without the festival's name at its start, where the
    festival is already the heading: under Davana utsavam, "Davana utsavam:
    homam and the closing veethi ula" is just "Homam and the closing veethi ula". */
function withoutName(label: string, name: string): string {
  if (!label.toLowerCase().startsWith(name.toLowerCase())) return label;
  const rest = label.slice(name.length);
  if (rest && !/^[\s:;,.–—-]/.test(rest)) return label; // "Purappadu" is not the start of "Purappadus"
  const trimmed = rest.replace(/^[\s:;,.–—-]+/, "");
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

async function MonthSection({ title, entries }: { title: string; entries: MonthEntry[] }) {
  return (
    <section className="section tight">
      <div className="section-head">
        <h2>{title}</h2>
      </div>
      <ul className="month-entries">
        {await Promise.all(
          entries.map(async ({ observance: o, seen }) => (
            <li key={o.id} className="reveal">
              <FestivalLink className="month-obs" id={o.id}>
                <span className="obs-tamil" lang="ta">
                  {o.tamil ?? o.name}
                </span>
                <span className="obs-name">{o.name}</span>
                <span className="obs-gloss">{o.gloss}</span>
                {/* shown only where the name is a link (see site.css) */}
                <span className="month-obs-more">About {o.name}</span>
              </FestivalLink>
              {seen.length > 0 ? (
                <ul className="month-seen">
                  {await Promise.all(
                    seen.map(async (s) => {
                      const t = await getTemple(s.region, s.temple);
                      const d = dateParts(s.date);
                      const place = t ? (t.knownAs ?? t.name) : "";
                      // the day's other festivals and rituals (this one is the heading)
                      const also = await getObservancesById(s.observances.filter((id) => id !== o.id));
                      return (
                        <li key={s.date + s.temple + s.label}>
                          <time dateTime={s.date}>
                            {d.day} {d.shortMonth} {d.year}
                          </time>
                          {t && hasPage(t) ? <Link href={`/${t.region}/${t.id}`}>{place}</Link> : place}
                          {withoutName(s.label, o.name) && (
                            <span className="month-seen-label"> · {withoutName(s.label, o.name)}</span>
                          )}
                          {also.map((x) => (
                            <FestivalLink key={x.id} className="month-seen-tag" id={x.id}>
                              {x.name}
                            </FestivalLink>
                          ))}
                          {s.note && (
                            <Link className="cal-read short arrow-link" href={`/field-notes/${s.note}`}>
                              Note
                            </Link>
                          )}
                        </li>
                      );
                    }),
                  )}
                </ul>
              ) : (
                <p className="month-unseen">Not yet seen by the team in this month.</p>
              )}
            </li>
          )),
        )}
      </ul>
    </section>
  );
}
