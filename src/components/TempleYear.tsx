import type { TempleYearMonth } from "@/lib/data";
import { FestivalLink } from "@/components/FestivalLink";

/* A few words on each, below its name: to be written (for now, a stand-in). */
const ABOUT = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.";

/** A temple's ritual year, month by month (lib/data getTempleRitualYear):
    under each month what was seen there, named as elsewhere on the site, the
    Tamil name and the English beneath it, and a few words on it. A festival
    (anything that comes once a year) shows, when it was seen on more than one
    day, the red mark and the number of days ("Brahmotsavam • 16 days"). What
    comes every month or every week follows the month's festivals, set apart
    in a pale panel, the red mark and when it comes round in place of the days
    ("Ramar Nakshatra Naal • Every month, on Punarpoosam"). A day listed under
    its own name ("Sunday Bhairava Abhishekam") shows that name, its rite's
    Tamil above it, and leads to the rite's page. */
export function TempleYear({ months }: { months: TempleYearMonth[] }) {
  if (!months.length) return <p className="note-line">No festival recorded here yet.</p>;
  return (
    <div>
      {months.map(({ month, year, festivals }) => (
        <section key={`${month.slug}-${year}`} className="year-month">
          <h3>{month.name}</h3>
          <div className="year-list">
            {festivals.map(({ observance: o, days, name, recurs, when }) => {
              // a day under its own name (an instance of a rite) brings its own name and timing
              const how = recurs ?? o.recurs;
              const recurring = how === "monthly" || how === "weekly";
              const after = recurring
                ? when || o.recursWhen || (how === "monthly" ? "Every month" : "Every week")
                : days > 1
                  ? `${days} days`
                  : null;
              return (
                <FestivalLink key={name ?? o.id} id={o.id} className={recurring ? "recurring" : undefined}>
                  <span className="t" lang="ta">
                    {o.tamil ?? o.name}
                  </span>
                  <span className="caps">
                    {name ?? o.name}
                    {after && (
                      <span className="year-days">
                        <span className="lingam" aria-hidden="true" />
                        {after}
                      </span>
                    )}
                  </span>
                  <span className="year-about">{ABOUT}</span>
                </FestivalLink>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
