import type { TempleRitualYear, TempleYearEntry } from "@/lib/data";
import { FestivalLink } from "@/components/FestivalLink";
import { MonthHead } from "@/components/MonthHead";
import { RitualTabs } from "@/components/RitualTabs";
import type { ReactNode } from "react";

/* A few words on each festival, below its name: to be written (for now, a stand-in). */
const ABOUT = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.";

const GROUPS = [
  { key: "weekly", label: "Every week" },
  { key: "fortnightly", label: "Twice a month" },
  { key: "monthly", label: "Every month" },
] as const;

/** How often it comes round, and when, from what it says ("Every Friday, 5 pm",
    "Twice a month, on Trayodashi", "Every month, on Krittikai"). */
function timing(e: TempleYearEntry) {
  const how = e.recurs ?? e.observance?.recurs;
  const when = e.when || e.observance?.recursWhen || "";
  const group = how === "weekly" ? "weekly" : /^twice/i.test(when) ? "fortnightly" : "monthly";
  // said once, in the group's heading: what is left is the day and the time
  const short = when
    .replace(/^every (week|month)(, )?/i, "")
    .replace(/^twice a month(, )?/i, "")
    .replace(/^every (?=(sun|mon|tues|wednes|thurs|fri|satur)day)/i, "");
  return { group, short: short.charAt(0).toUpperCase() + short.slice(1) };
}

/** A temple's ritual calendar (lib/data getTempleRitualYear), in three
    parts chosen at the top (components/RitualTabs): the year, the month and
    the week, each with how many there are.
    The Ritual Year: the twelve months from Chithirai to Panguni, the one we
    are in in its own colour; under each its festivals (anything that comes
    once a year, or a few times), each in a pale panel: the Tamil name, the
    English beneath it with the red mark and the number of days when it was
    seen on more than one ("Brahmotsavam • 16 days"), and a few words on it.
    The Ritual Month: what comes twice a month and every month; the Ritual
    Week: what comes every week. Each once, in a pale panel too, two to a
    line, under its heading: the Tamil, the English, and the day and time
    ("on Krittikai, 10 am to noon"; "Sunday, after 7:30 pm"). A day listed
    under its own name ("Bhairava Abhishekam") shows that name, its rite's
    Tamil above it, and leads to the rite's page. */
export function TempleYear({ year }: { year: TempleRitualYear }) {
  const regular = year.regular.map((e) => ({ e, ...timing(e) }));
  const weekly = regular.filter((x) => x.group === "weekly").sort((a, b) => weekdayOf(a.short) - weekdayOf(b.short));
  const monthly = regular.filter((x) => x.group !== "weekly");
  const festivals = year.months.reduce((n, m) => n + m.festivals.length, 0);
  const many = (n: number, one: string, more: string) => `${n} ${n === 1 ? one : more}`;
  const list = (these: typeof regular) => (
    <div className="year-regular-list">
      {these.map(({ e, short }) => (
        <Entry key={`${e.name ?? ""}|${e.observance?.id ?? ""}|${e.when ?? ""}`} e={e} className="regular" after={null}>
          {short && <span className="year-when">{short}</span>}
        </Entry>
      ))}
    </div>
  );
  const none = <p className="year-none">Nothing recorded yet.</p>;

  return (
    <RitualTabs
      tabs={[
        {
          key: "year",
          ta: "வருடம்",
          en: "The Ritual Year",
          count: many(festivals, "festival", "festivals"),
          panel: (
            <div>
              {year.months.map(({ month, festivals: these }) => (
                <section key={month.slug} className="year-month">
                  <MonthHead month={month} />
                  {these.length === 0 ? (
                    none
                  ) : (
                    <div className="year-list">
                      {these.map((e) => (
                        <Entry key={`${e.name ?? ""}|${e.observance?.id ?? ""}`} e={e} className="festival" after={e.days > 1 ? `${e.days} days` : null}>
                          <span className="year-about">{e.about ?? ABOUT}</span>
                        </Entry>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          ),
        },
        {
          key: "month",
          ta: "மாதம்",
          en: "The Ritual Month",
          count: many(monthly.length, "ritual", "rituals"),
          panel: monthly.length
            ? GROUPS.filter((g) => g.key !== "weekly").map(({ key, label }) => {
                const these = monthly.filter((x) => x.group === key);
                return these.length ? (
                  <section key={key} className="year-regular">
                    <h4 className="year-regular-head">{label}</h4>
                    {list(these)}
                  </section>
                ) : null;
              })
            : none,
        },
        {
          key: "week",
          ta: "வாரம்",
          en: "The Ritual Week",
          count: many(weekly.length, "ritual", "rituals"),
          panel: weekly.length ? (
            <section className="year-regular">
              <h4 className="year-regular-head">Every week</h4>
              {list(weekly)}
            </section>
          ) : (
            none
          ),
        },
      ]}
    />
  );
}

/** The day of the week a weekly one falls on (its timing begins with it), Sunday first, for their order. */
function weekdayOf(short: string) {
  const i = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].findIndex((d) => short.toLowerCase().startsWith(d));
  return i < 0 ? 7 : i;
}

/** One of them: its Tamil, its English (TBC when to be confirmed; the red mark
    and `after` beside it), and what follows; a link to its festival's or
    ritual's page when it has one. */
function Entry({ e, className, after, children }: { e: TempleYearEntry; className: string; after: string | null; children?: ReactNode }) {
  const ta = e.tamil ?? e.observance?.tamil;
  return (
    <FestivalLink id={e.observance?.id} className={className}>
      {ta && (
        <span className="t" lang="ta">
          {ta}
        </span>
      )}
      <span className="caps">
        {e.tbc && (
          <abbr className="tbc-mark" title="To be confirmed">
            TBC
          </abbr>
        )}
        {e.name ?? e.observance?.name}
        {after && (
          <span className="year-days">
            <span className="lingam" aria-hidden="true" />
            {after}
          </span>
        )}
      </span>
      {children}
    </FestivalLink>
  );
}
