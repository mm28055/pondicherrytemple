import type { TempleRitualYear, TempleYearEntry } from "@/lib/data";
import { FestivalLink } from "@/components/FestivalLink";
import { MonthHead } from "@/components/MonthHead";
import { RitualTabs } from "@/components/RitualTabs";
import type { ReactNode } from "react";

/* A few words on each festival, below its name: to be written (for now, a stand-in). */

const GROUPS = [
  { key: "weekly", label: "Every week" },
  { key: "fortnightly", label: "Twice a month" },
  { key: "monthly", label: "Every month" },
] as const;

const DAYS: Record<string, string> = { sun: "Sunday", mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday" };
const plain = (s: string) => ` ${s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;

/* The Pancha Paruva Utsavam's five, in their order; anything else after them, as it comes. */
const SET_ORDER = ["Amavasya", "Pournami", "Maasa Pirappu", "Masa Shivaratri", "Theipirai Ashtami"];
const setOrder = (name = "") => {
  const i = SET_ORDER.indexOf(name);
  return i < 0 ? SET_ORDER.length : i;
};

/** How often it comes round (its group), and when, below its name: how
    often is said once, in the group's heading, and what its name says
    already is not said again (Theipirai Ashtami: "11 am", not "On
    Theipirai Ashtami, 11 am"; Maasa Pirappu: nothing, not "On the first day
    of the month"); what is left is the day and the time (Perumal
    Thirumanjanam: "On Thiruvonam"; Bhairava Abhishekam: "Sunday, after
    7:30 pm"). */
function timing(e: TempleYearEntry) {
  const how = e.recurs ?? e.observance?.recurs;
  const when = e.when || e.observance?.recursWhen || "";
  const group = how === "weekly" ? "weekly" : /^twice/i.test(when) ? "fortnightly" : "monthly";
  const name = e.name ?? e.observance?.name ?? "";
  // a regular ritual: from its day and time, as set in the admin
  if (e.time !== undefined) {
    const said = (on: string) => plain(name).includes(plain(on)) || (/first day of the month/i.test(on) && /pirappu/i.test(name));
    const day =
      group === "weekly"
        ? [(e.weekdays ?? []).map((d) => DAYS[d] ?? d).join(" and "), e.on].filter(Boolean).join(", ")
        : e.on && !said(e.on)
          ? `on ${e.on}`
          : "";
    // "After 7:30 pm" and "Morning" in lower case after the day; a name ("Pradosha kalam") as it is
    const time = day && /^(after|before|from|morning|evening|noon|night)\b/i.test(e.time) ? e.time.charAt(0).toLowerCase() + e.time.slice(1) : e.time;
    // then anything particular to this time
    const short = [[day, time].filter(Boolean).join(", "), e.details].filter(Boolean).join(" · ");
    return { group, short: short.charAt(0).toUpperCase() + short.slice(1) };
  }
  // a day listed under its own name: from what it says ("Every Friday")
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
    below ("On Thiruvonam", in italics), then its few words at the temple;
    those of a
    set (the Pancha Paruva Utsavam) together, after the rest, under its
    name. A day listed
    under its own name ("Bhairava Abhishekam") shows that name, its rite's
    Tamil above it, and leads to the rite's page. */
export function TempleYear({ year }: { year: TempleRitualYear }) {
  const regular = year.regular.map((e) => ({ e, ...timing(e) }));
  const weekly = regular.filter((x) => x.group === "weekly").sort((a, b) => weekdayOf(a.short) - weekdayOf(b.short));
  const monthly = regular.filter((x) => x.group !== "weekly");
  const festivals = year.months.reduce((n, m) => n + m.festivals.length, 0);
  const many = (n: number, one: string, more: string) => `${n} ${n === 1 ? one : more}`;
  const grid = (these: typeof regular) => (
    <div className="year-regular-list">
      {these.map(({ e, short }) => (
        <Entry key={`${e.name ?? ""}|${e.observance?.id ?? ""}|${e.when ?? ""}`} e={e} className="regular" after={null}>
          {short && <span className="year-when">{short}</span>}
          {/* its few words at this temple (the admin: "In a few words, here") */}
          {e.about && <span className="year-regular-about">{e.about}</span>}
        </Entry>
      ))}
    </div>
  );
  // those of no set, then each set under its name
  const list = (these: typeof regular) => {
    const sets = [...new Set(these.flatMap((x) => (x.e.partOf ? [x.e.partOf] : [])))];
    return (
      <>
        {grid(these.filter((x) => !x.e.partOf))}
        {sets.map((set) => {
          const members = these.filter((x) => x.e.partOf === set).sort((a, b) => setOrder(a.e.name) - setOrder(b.e.name));
          const ta = members.find((x) => x.e.partOfTamil)?.e.partOfTamil;
          return (
            <div key={set} className="year-set">
              <h5 className="year-set-head">
                {ta && (
                  <span className="t" lang="ta">
                    {ta}
                  </span>
                )}
                <span className="caps">{set}</span>
              </h5>
              {grid(members)}
            </div>
          );
        })}
      </>
    );
  };
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
              {/* only the months with something recorded in them */}
              {festivals === 0 && none}
              {year.months.filter(({ festivals: these }) => these.length > 0).map(({ month, festivals: these }) => (
                <section key={month.slug} className="year-month">
                  <MonthHead month={month} />
                  {these.length === 0 ? (
                    none
                  ) : (
                    <div className="year-list">
                      {these.map((e) => (
                        <Entry key={`${e.name ?? ""}|${e.observance?.id ?? ""}`} e={e} className="festival" after={e.days > 1 ? `${e.days} days` : null}>
                          {e.about && <span className="year-about">{e.about}</span>}
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
  // its own Tamil; else its festival's, when it goes by that festival's name
  // (a day under a name of its own, "Aani Utthiram", is not "Abhishekam")
  const named = e.name && e.name !== e.observance?.name;
  const ta = e.tamil ?? (named ? undefined : e.observance?.tamil);
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
