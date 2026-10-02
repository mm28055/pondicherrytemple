import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import {
  getObservancesById,
  getOccasionsInMonth,
  getRitualYear,
  getTemple,
  hasPage,
  type MonthEntry,
} from "@/lib/data";
import { dateParts, monthDates, monthYearOf, TAMIL_MONTHS } from "@/lib/calendar";
import { calendarEvents } from "@/lib/calendarEvents";
import { MonthCalendar } from "@/components/MonthCalendar";
import { MonthMotif } from "@/components/MonthMotif";

type Props = { params: Promise<{ month: string }> };

// Rebuilt once a day, so "today" on the calendar moves on by itself.
export const revalidate = 86400;

export function generateStaticParams() {
  return TAMIL_MONTHS.map((m) => ({ month: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).month;
  const m = TAMIL_MONTHS.find((x) => x.slug === slug);
  return m
    ? {
        title: `${m.name}: festivals & rituals`,
        description: `The festivals and rituals of ${m.name}, ${m.span}.`,
      }
    : {};
}

/** One Tamil month of the ritual year: every festival and ritual that falls
    in it, and the days the team saw each one. */
export default async function MonthPage({ params }: Props) {
  const slug = (await params).month;
  const at = TAMIL_MONTHS.findIndex((m) => m.slug === slug);
  if (at < 0) notFound();
  const month = TAMIL_MONTHS[at];
  const prev = TAMIL_MONTHS[(at + 11) % 12];
  const next = TAMIL_MONTHS[(at + 1) % 12];

  const year = await getRitualYear();
  const entries = year.months[at].entries;
  const festivals = entries.filter((e) => e.observance.kind === "festival");
  const rituals = entries.filter((e) => e.observance.kind === "ritual");

  // The calendar: the days the team was present this month, a grid for each
  // year recorded, newest first; with none yet, the month as it next comes.
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const events = (await calendarEvents(await getOccasionsInMonth(month.slug))).map((e) => ({
    ...e,
    year: monthYearOf(e.date),
  }));
  let upcoming = Number(today.slice(0, 4)) - 1;
  while (monthDates(month.slug, upcoming).last < today) upcoming++;
  const years = events.length ? [...new Set(events.map((e) => e.year))].sort((a, b) => b - a) : [upcoming];

  return (
    <div className="wrap" style={{ "--m": month.colour } as CSSProperties}>
      <header className="page-head month-head">
        <div className="month-topline">
          <Link className="crumb" href="/festivals-and-rituals">
            ← Festivals &amp; rituals
          </Link>
          <nav className="month-steps" aria-label="Other months">
            <Link href={`/festivals-and-rituals/month/${prev.slug}`}>← {prev.name}</Link>
            <Link href={`/festivals-and-rituals/month/${next.slug}`}>{next.name} →</Link>
          </nav>
        </div>
        <div className="month-head-text">
          <p className="tamil-title" lang="ta">
            {month.tamil}
          </p>
          <h1 className="name-title">{month.name}</h1>
          <p className="gloss kicker">{month.span}</p>
        </div>
        <MonthMotif month={month.slug} className="month-head-motif" />
      </header>

      {/* The months either side again, beside the calendar: no need to go back up */}
      {years.map((y) => (
        <div key={y} className="cal-with-steps">
          {/* scroll={false}: the next month opens where you are, the calendar in view */}
          <Link className="cal-step prev" href={`/festivals-and-rituals/month/${prev.slug}`} scroll={false}>
            <span className="cal-step-arrow" aria-hidden="true">
              ←
            </span>
            <span className="cal-step-name">{prev.name}</span>
          </Link>
          <MonthCalendar month={month} year={y} events={events.filter((e) => e.year === y)} today={today} />
          <Link className="cal-step next" href={`/festivals-and-rituals/month/${next.slug}`} scroll={false}>
            <span className="cal-step-arrow" aria-hidden="true">
              →
            </span>
            <span className="cal-step-name">{next.name}</span>
          </Link>
        </div>
      ))}

      {entries.length === 0 && (
        <section className="section">
          <p className="note-line" style={{ maxWidth: "40em" }}>
            Nothing recorded in {month.name} yet. As the team is present at the temples through the year, this
            month will fill in.
          </p>
        </section>
      )}

      {festivals.length > 0 && <MonthSection title="Festivals" entries={festivals} />}
      {rituals.length > 0 && <MonthSection title="Rituals" entries={rituals} />}

      {year.throughYear.length > 0 && (
        <section className="section tight">
          <p className="note-line">
            Done all through the year, in {month.name} as in every month:{" "}
            {year.throughYear.map((o, i) => (
              <span key={o.id}>
                {i > 0 && ", "}
                <Link className="month-link" href={`/festivals-and-rituals/${o.id}`}>
                  {o.name}
                </Link>
              </span>
            ))}
            .
          </p>
        </section>
      )}
    </div>
  );
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
              <Link className="month-obs" href={`/festivals-and-rituals/${o.id}`}>
                <span className="obs-tamil" lang="ta">
                  {o.tamil ?? o.name}
                </span>
                <span className="obs-name">{o.name}</span>
                <span className="obs-gloss">{o.gloss}</span>
                <span className="month-obs-more">About {o.name}</span>
              </Link>
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
                            <Link key={x.id} className="month-seen-tag" href={`/festivals-and-rituals/${x.id}`}>
                              {x.name}
                            </Link>
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
