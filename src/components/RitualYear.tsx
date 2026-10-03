import Link from "next/link";
import type { CSSProperties } from "react";
import type { Observance } from "@/content/types";
import type { MonthEntry } from "@/lib/data";
import type { TamilMonth } from "@/lib/calendar";
import { MonthMotif } from "@/components/MonthMotif";

/** The ritual year as a South Indian chart (the rasi kattam): the twelve
    Tamil months round the edge of a square, Chithirai at the top, going
    clockwise; in the middle, what is done all through the year. Each box
    holds just the month's name and span, centred; its page has the rest.
    On a phone the months are a plain list, in order. */
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
      {months.map(({ month: m }) => (
        <Link
          key={m.slug}
          href={`/festivals-and-rituals/month/${m.slug}`}
          className={`rasi-month${m.slug === now ? " now" : ""}`}
          style={{ "--r": m.rasi[0], "--c": m.rasi[1], "--m": m.colour } as CSSProperties}
        >
          {/* the month's drawing, as at the top of its page */}
          <MonthMotif month={m.slug} className="rasi-motif" fit />
          <span className="rasi-ta" lang="ta">
            {m.tamil}
          </span>
          <span className="caps">
            {m.name}
            {m.slug === now && <span className="rasi-now"> · Now</span>}
          </span>
          <span className="rasi-span">{m.span}</span>
        </Link>
      ))}

      <div className="rasi-centre">
        <div className="kicker">The ritual year</div>
        <p>Open a month to see what the temples keep in it.</p>
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
