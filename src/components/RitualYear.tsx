import Link from "next/link";
import type { CSSProperties } from "react";
import type { Observance } from "@/content/types";
import type { MonthEntry } from "@/lib/data";
import type { TamilMonth } from "@/lib/calendar";

// Two per month, so the whole chart fits on one screen; each month's page has them all.
const SHOWN = 2;

/** The ritual year as a South Indian chart (the rasi kattam): the twelve
    Tamil months round the edge of a square, Chithirai at the top, going
    clockwise; in the middle, what is done all through the year. Each month
    opens its own page. On a phone the months are a plain list, in order. */
export function RitualYear({
  months,
  throughYear,
  now,
}: {
  months: { month: TamilMonth; entries: MonthEntry[] }[];
  throughYear: Observance[];
  now: string;
}) {
  return (
    <div className="rasi">
      {months.map(({ month: m, entries }) => (
        <Link
          key={m.slug}
          href={`/festivals-and-rituals/month/${m.slug}`}
          className={`rasi-month${m.slug === now ? " now" : ""}`}
          style={{ "--r": m.rasi[0], "--c": m.rasi[1], "--m": m.colour } as CSSProperties}
        >
          <span className="rasi-head">
            <span className="rasi-ta" lang="ta">
              {m.tamil}
            </span>
          </span>
          <span className="caps">
            {m.name}
            {m.slug === now && <span className="rasi-now"> · Now</span>}
          </span>
          <span className="rasi-span">{m.span}</span>
          {entries.length > 0 ? (
            <ul className="rasi-list">
              {entries.slice(0, SHOWN).map((e) => (
                <li key={e.observance.id}>{e.observance.name}</li>
              ))}
              {entries.length > SHOWN && <li className="rasi-more">and {entries.length - SHOWN} more</li>}
            </ul>
          ) : (
            <span className="rasi-empty">Nothing recorded yet</span>
          )}
        </Link>
      ))}

      <div className="rasi-centre">
        <div className="kicker">The ritual year</div>
        <p>Twelve Tamil months, from Chithirai. Open a month to see what the temples keep in it.</p>
        {throughYear.length > 0 && (
          <>
            <h3 className="caps">All through the year</h3>
            <ul>
              {throughYear.map((o) => (
                <li key={o.id}>
                  <Link href={`/festivals-and-rituals/${o.id}`}>{o.name}</Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
