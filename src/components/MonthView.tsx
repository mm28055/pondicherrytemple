import { BackLink } from "@/components/BackLink";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import {
  getLineBegins,
  getOccasionsInMonth,
  getSpecialNakshatras,
  getSpecialTithis,
  type SpecialTithi,
  getVaramDays,
  getWeeklyPhotos,
  getWeeklyRituals,
  getObservances,
  getRegions,
  getTemples,
} from "@/lib/data";
import { monthDates, monthYearOf, TAMIL_MONTHS, tamilMonthOf, type TamilMonth } from "@/lib/calendar";
import { calendarEvents } from "@/lib/calendarEvents";
import { nakshatraInEvening, nakshatrasBetween, specialDays, tithisBetween } from "@/lib/tithi";
import { NAKSHATRAS } from "@/lib/nakshatraNames";
import type { SpecialIconKey } from "@/lib/specialIcons";
import { MonthCalendar, type Great } from "@/components/MonthCalendar";
import { MonthMotif } from "@/components/MonthMotif";
import { MonthSwipe } from "@/components/MonthSwipe";
import { MonthJump } from "@/components/MonthJump";
import { WeeklyRituals } from "@/components/WeeklyRituals";
import { MONTH_TA, timeTa, weeklyTa } from "@/content/eventsTa";
import { spanTa } from "@/content/festivalsTa";
import { templeTa } from "@/content/homeTa";
import { said } from "@/content/saidTa";
import { tamilOf } from "@/lib/tamilPages";
import { photosTa } from "@/lib/viewTa";

/** One Tamil month, in one year: its calendar, and under it Varam, what the
    temples do every week, with the photographs of each day. The months run on
    in a line from Masi 2026 (the month before the team began), with no end:
    /month/panguni/2027 is the next Panguni. /month/panguni, without a year,
    is the month in the cycle of twelve we are in now. */
export async function MonthView({ slug, asked, ta = false }: { slug: string; asked?: string; ta?: boolean }) {
  // in Tamil (/ta): the names in both languages as they are, the nakshatrams in Tamil
  const base = ta ? "/ta" : "";
  const monthName = (m: TamilMonth) => (ta ? m.tamil : m.name);
  const at = TAMIL_MONTHS.findIndex((m) => m.slug === slug);
  if (at < 0) notFound();
  const month = TAMIL_MONTHS[at];
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const begins = await getLineBegins();
  const y = asked ? Number(asked) : yearNow(slug, begins, today);
  // nothing before the team began, nor more than a hundred years ahead
  const last = Number(today.slice(0, 4)) + 100;
  if (!Number.isInteger(y) || monthDates(slug, y).first < begins || y > last) notFound();

  // the months either side, in the line: none before the first, nor after the last
  const prev = step(at, y, -1, begins);
  const onward = step(at, y, 1, begins);
  const next = onward && onward.year <= last ? onward : null;
  const href = (s: Step) => `${base}/festivals-and-rituals/month/${s.month.slug}/${s.year}`;

  // Varam: what is done every week, and the photographs of each day's temples
  // (the photo sets tagged with its weekly ritual)
  const english = await getWeeklyRituals();
  const temples = ta ? (await Promise.all((await getRegions()).map((r) => getTemples(r.id)))).flat() : [];
  const observances = ta ? await getObservances() : [];
  const weekly = ta
    ? english.map((r) => ({
        ...r,
        what: r.tamil || (weeklyTa(r.what) !== r.what ? weeklyTa(r.what) : said(r.what)),
        shown: timeTa(r.time),
        temples: r.temples.map((t) => ({ ...t, name: templeTa(t.key.split("/").pop()!, t.name), href: (t.href && tamilOf(t.href)) || t.href })),
        observances: r.observances.map((o) => ({ ...o, name: observances.find((x) => x.id === o.id)?.tamil || said(o.name) })),
      }))
    : english;
  const character = await getVaramDays();
  const ownPhotos = await getWeeklyPhotos();
  const weeklyPhotos = ta ? Object.fromEntries(Object.entries(ownPhotos).map(([k, v]) => [k, photosTa(v, temples, observances)])) : ownPhotos;

  // the nakshatrams kept specially, by month (rules set in the admin)
  const special = await getSpecialNakshatras();
  // and the tithis kept as the year's great days
  const greatRules = await getSpecialTithis();
  // the calendar: the days the team was present this month, this year
  const events = await daysIn(slug, y, ta);
  // the months either side, ready beside the calendar to be swiped in
  const beside = async (s: Step | null) =>
    s && (
      <div style={{ "--m": s.month.colour } as CSSProperties}>
        <MonthCalendar
          month={s.month}
          year={s.year}
          events={await daysIn(s.month.slug, s.year, ta)}
          tithis={tithisIn(s.month.slug, s.year)}
          nakshatras={nakshatrasIn(s.month.slug, s.year)}
          special={specialIn(s.month.slug, s.year, special)}
          swap={swapIn(s.month.slug, s.year, special)}
          great={greatIn(s.month.slug, s.year, greatRules)}
          today={today}
          ta={ta}
        />
      </div>
    );
  const [before, after] = await Promise.all([beside(prev), beside(next)]);

  return (
    // the month's colour (--mt, which glides to the next month's as it is swiped in)
    <div className={`wrap month-page${ta ? " in-ta" : ""}`} lang={ta ? "ta" : undefined} style={{ "--mt": month.colour } as CSSProperties}>
      <header className="page-head month-head">
        <div className="month-topline">
          {/* back to the year's chart, which the month belongs to */}
          {/* always the Calendar, however many months were gone through */}
          <BackLink className="crumb" href={`${base}/calendar`} always>
            ← {ta ? MONTH_TA.back : "Calendar"}
          </BackLink>
        </div>
        <div className="month-head-text">
          <p className="tamil-title" lang="ta">
            {month.tamil}
          </p>
          <h1 className="name-title" lang="en">
            {month.name}
          </h1>
          {/* the span, and the year of the calendar below */}
          <p className="gloss kicker">
            {ta ? spanTa(month.span) : month.span} {yearLabel(slug, y)}
          </p>
        </div>
        <MonthMotif month={slug} ta={ta} className={`month-head-motif month-head-motif-${slug}`} />
      </header>

      {/* where the month opens on a computer, from a link: its calendar (components/LandAtTop) */}
      <div className="month-land" data-land={`${base}/festivals-and-rituals/month/${slug}/${y}`} aria-hidden="true" />
      {/* Any month, not only those either side: a month and a year, from the calendar's first month to two years on */}
      <MonthJump
        month={slug}
        year={y}
        begins={begins}
        ta={ta}
        years={Array.from({ length: Number(today.slice(0, 4)) + 3 - Number(begins.slice(0, 4)) }, (_, i) => Number(begins.slice(0, 4)) + i)}
      />

      {/* The months either side again, beside the calendar: no need to go back up */}
      <div className="cal-with-steps">
        {/* scroll={false}: the next month opens where you are, the calendar in view */}
        {prev ? (
          <Link className="cal-step prev" href={href(prev)} scroll={false} data-keep-scroll>
            <span className="cal-step-arrow" aria-hidden="true">
              ←
            </span>
            <span className="cal-step-name">{monthName(prev.month)}</span>
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
            swap={swapIn(slug, y, special)}
            great={greatIn(slug, y, greatRules)}
            today={today}
            ta={ta}
          />
        </MonthSwipe>
        {next ? (
          <Link className="cal-step next" href={href(next)} scroll={false} data-keep-scroll>
            <span className="cal-step-arrow" aria-hidden="true">
              →
            </span>
            <span className="cal-step-name">{monthName(next.month)}</span>
          </Link>
        ) : (
          <span className="cal-step next" aria-hidden="true" />
        )}
      </div>

      {/* Varam: what the temples do every week */}
      <section className="section tight varam-section" id="varam">
        <div className="section-head">
          <h2>
            <span lang="ta">வாரம்</span> <span lang="en">Varam</span> · {ta ? MONTH_TA.everyWeek : "Every week"}
          </h2>
        </div>
        <WeeklyRituals rituals={weekly} photos={weeklyPhotos} character={character} ta={ta} />
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
async function daysIn(slug: string, year: number, ta: boolean) {
  return (await calendarEvents(await getOccasionsInMonth(slug), ta)).filter((e) => monthYearOf(e.date) === year);
}

/** The tithis kept in a month, in a year: day → its tithis. */
function tithisIn(slug: string, year: number) {
  const { first, last } = monthDates(slug, year);
  return Object.fromEntries(tithisBetween(first, last));
}

/** The days a month's special nakshatrams fall on, in a year. */
function specialIn(slug: string, year: number, rules: Record<string, { nakshatram: string; twice?: "both" | "first" | "second" }[]>) {
  const { first, last } = monthDates(slug, year);
  const out: Record<string, number[]> = {};
  for (const r of rules[slug] ?? []) {
    // a nakshatram can fall twice in a Tamil month: the rule says which to mark
    let days = Object.entries(specialDays(first, last, [r.nakshatram])).sort(([a], [b]) => (a < b ? -1 : 1));
    if (days.length > 1 && r.twice === "first") days = days.slice(0, 1);
    if (days.length > 1 && r.twice === "second") days = days.slice(-1);
    for (const [day, kept] of days) out[day] = [...new Set([...(out[day] ?? []), ...kept])];
  }
  return out;
}

/** The icons chosen (in the admin) to show a month's special nakshatrams by,
    in place of their own: day → nakshatra → icon. */
function swapIn(slug: string, year: number, rules: Record<string, { nakshatram: string; icon: SpecialIconKey | null }[]>) {
  const out: Record<string, Record<number, SpecialIconKey>> = {};
  for (const [day, kept] of Object.entries(specialIn(slug, year, rules)))
    for (const k of kept) {
      const icon = (rules[slug] ?? []).find((r) => r.nakshatram === NAKSHATRAS[k].name)?.icon;
      if (icon) (out[day] ??= {})[k] = icon;
    }
  return out;
}

/** The days a month's great tithis fall on, in a year: day → what is marked on
    it. A rule with a nakshatram goes to the day, nearest the tithi (up to two
    days either side, within the month), whose evening the nakshatram holds in
    (sunset to midnight, as Karthigai Deepam is lit): on the tithi's own day
    its moon or icon is marked; on another, the nakshatram. */
function greatIn(slug: string, year: number, rules: Record<string, SpecialTithi[]>) {
  const { first, last } = monthDates(slug, year);
  const tithis = Object.entries(tithisIn(slug, year));
  const out: Great = {};
  const mark = (day: string, m: Great[string][number]) => (out[day] ??= []).push(m);
  const shift = (iso: string, by: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + by * 86_400_000).toISOString().slice(0, 10);
  for (const r of rules[slug] ?? []) {
    const n = r.nakshatram ? NAKSHATRAS.findIndex((x) => x.name === r.nakshatram) : -1;
    for (const [day, keys] of tithis) {
      if (!keys.includes(r.tithi)) continue;
      const near = n < 0 ? undefined : [0, -1, 1, -2, 2].map((b) => shift(day, b)).find((d) => d >= first && d <= last && nakshatraInEvening(d, n));
      if (near && near !== day) mark(near, { name: r.name, tamil: r.tamil, nakshatra: n, icon: r.icon ?? undefined });
      else mark(day, { name: r.name, tamil: r.tamil, tithi: r.tithi, icon: r.icon ?? undefined });
    }
  }
  return out;
}

/** Each day's nakshatras in a month, in a year. */
function nakshatrasIn(slug: string, year: number) {
  const { first, last } = monthDates(slug, year);
  return nakshatrasBetween(first, last);
}

