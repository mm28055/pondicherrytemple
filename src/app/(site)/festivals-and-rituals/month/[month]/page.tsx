import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRitualYear, getTemple, hasPage, type MonthEntry } from "@/lib/data";
import { dateParts, TAMIL_MONTHS } from "@/lib/calendar";

type Props = { params: Promise<{ month: string }> };

export function generateStaticParams() {
  return TAMIL_MONTHS.map((m) => ({ month: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).month;
  const m = TAMIL_MONTHS.find((x) => x.slug === slug);
  return m
    ? { title: `${m.name}: festivals & rituals`, description: `The festivals and rituals of ${m.name}, ${m.span}.` }
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

  return (
    <div className="wrap">
      <header className="page-head">
        <Link className="crumb" href="/festivals-and-rituals">
          ← Festivals &amp; rituals
        </Link>
        <div className="kicker">
          Tamil month · {at + 1} of 12
        </div>
        <p className="tamil-title" lang="ta">
          {month.tamil}
        </p>
        <h1 className="name-title">{month.name}</h1>
        <p className="gloss kicker">{month.span}</p>
        <nav className="month-steps" aria-label="Other months">
          <Link href={`/festivals-and-rituals/month/${prev.slug}`}>← {prev.name}</Link>
          <Link href={`/festivals-and-rituals/month/${next.slug}`}>{next.name} →</Link>
        </nav>
      </header>

      {entries.length === 0 && (
        <section className="section">
          <p className="note-line" style={{ maxWidth: "40em" }}>
            Nothing recorded in {month.name} yet. As the team is present at the temples through the year,
            this month will fill in.
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
              </Link>
              {seen.length > 0 ? (
                <ul className="month-seen">
                  {await Promise.all(
                    seen.map(async (s) => {
                      const t = await getTemple(s.region, s.temple);
                      const d = dateParts(s.date);
                      const place = t ? (t.knownAs ?? t.name) : "";
                      return (
                        <li key={s.date + s.temple + s.label}>
                          <time dateTime={s.date}>
                            {d.day} {d.shortMonth} {d.year}
                          </time>
                          {t && hasPage(t) ? <Link href={`/${t.region}/${t.id}`}>{place}</Link> : place}
                          {s.label && <span className="month-seen-label"> · {s.label}</span>}
                        </li>
                      );
                    })
                  )}
                </ul>
              ) : (
                <p className="month-unseen">Not yet seen by the team in this month.</p>
              )}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
