import type { Kalam, TempleDay } from "@/content/types";
import type { TempleRitualYear, TempleYearEntry } from "@/lib/data";
import { FestivalLink } from "@/components/FestivalLink";
import { MonthHead } from "@/components/MonthHead";
import { RitualTabs } from "@/components/RitualTabs";
import type { ReactNode } from "react";
import { EditText, type Target } from "@/components/edit/Editable";
import type { YearEdit } from "@/lib/editing";
import { said, YEAR_TA } from "@/content/templeTa";

/* A few words on each festival, below its name: to be written (for now, a stand-in). */

const GROUPS = [
  { key: "weekly", label: "Every week" },
  { key: "fortnightly", label: "Twice a month" },
  { key: "monthly", label: "Every month" },
] as const;

const DAYS: Record<string, string> = { sun: "Sunday", mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday" };
const plain = (s: string) => ` ${s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;

/* The Pancha Paruva Utsavam's five, in their order; anything else after them, as it comes. */
const SET_ORDER = ["Amavasya", "Pournami", "Masa Pirappu", "Masa Sivaratri", "Theipirai Ashtami"];
const setOrder = (name = "") => {
  const i = SET_ORDER.indexOf(name);
  return i < 0 ? SET_ORDER.length : i;
};

/** How often it comes round (its group), and when, below its name: how
    often is said once, in the group's heading, and what its name says
    already is not said again (Theipirai Ashtami: "11 am", not "On
    Theipirai Ashtami, 11 am"; Masa Pirappu: nothing, not "On the first day
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
        ? // (the day said once, where its "On" is the day itself: "Sunday, morning")
          [(e.weekdays ?? []).map((d) => DAYS[d] ?? d).join(" and "), (e.weekdays ?? []).some((d) => plain(DAYS[d] ?? d) === plain(e.on ?? "")) ? "" : e.on]
            .filter(Boolean)
            .join(", ")
        : e.on && !said(e.on)
          ? `on ${e.on}`
          : "";
    // "After 7:30 pm" and "Morning" in lower case after the day; a name ("Pradosha kaalam") as it is
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

/** A temple's ritual calendar (lib/data getTempleRitualYear), in three or four
    parts chosen at the top (components/RitualTabs): the year, the month, the
    week and, where it is written, the day, each with how many there are.
    The Year: the twelve months from Chithirai to Panguni, the one we
    are in in its own colour; under each its festivals (anything that comes
    once a year, or a few times), each in a pale panel: the Tamil name, the
    English beneath it with the red mark and the number of days its ritual
    calendar gives ("Brahmotsavam • 15 days"; none if it gives none), and a few words on it.
    The Month: what comes twice a month and every month; The
    Week: what comes every week. Each once, in a pale panel too, two to a
    line, under its heading: the Tamil, the English, and the day and time
    below ("On Thiruvonam", in italics), then its few words at the temple;
    those of a
    set (the Pancha Paruva Utsavam) together, after the rest, under its
    name. A day listed
    under its own name ("Bhairava Abhishekam") shows that name, its rite's
    Tamil above it, and leads to the rite's page. */
export function TempleYear({ year, day, edit, ta = false }: { year: TempleRitualYear; day?: TempleDay; edit?: YearEdit; /** in Tamil (content/templeTa) */ ta?: boolean }) {
  const T = ta ? YEAR_TA : null;
  const say = (s: string) => (ta ? said(s) : s);
  const groupLabel = (key: string, label: string) => (T ? (key === "fortnightly" ? T.twiceAMonth : T.everyMonth) : label);
  // the tab's count: the kaalams its puja names ("4 kaalam puja"), else the kalams written
  const kaalams = Number(day?.standard?.match(/^\s*(\d+)/)?.[1] ?? day?.kalams.length ?? 0);
  const regular = year.regular.map((e) => ({ e, ...timing(e) }));
  const weekly = regular.filter((x) => x.group === "weekly").sort((a, b) => weekdayOf(a.short) - weekdayOf(b.short));
  const monthly = regular.filter((x) => x.group !== "weekly");
  const festivals = year.months.reduce((n, m) => n + m.festivals.length, 0);
  const many = (n: number, one: string, more: string) => `${n} ${n === 1 ? one : more}`;
  const grid = (these: typeof regular) => (
    <div className="year-regular-list">
      {these.map(({ e, short }) => (
        <Entry key={`${e.name ?? ""}|${e.observance?.id ?? ""}|${e.when ?? ""}`} e={e} className="regular" after={null} edit={edit} ta={ta}>
          {edit && e.ritualId && edit.rituals[e.ritualId] ? (
            <RegularEdit e={e} short={short} edit={edit} />
          ) : (
            <>
              {short && <span className="year-when">{say(short)}</span>}
              {/* its few words at this temple (the admin: "In a few words, here") */}
              {e.about && <span className="year-regular-about">{say(e.about)}</span>}
            </>
          )}
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
          const tamil = members.find((x) => x.e.partOfTamil)?.e.partOfTamil;
          return (
            <div key={set} className="year-set">
              <h5 className="year-set-head">
                {tamil && (
                  <span className="t" lang="ta">
                    {tamil}
                  </span>
                )}
                <span className="caps" lang={ta ? "en" : undefined}>{set}</span>
              </h5>
              {grid(members)}
            </div>
          );
        })}
      </>
    );
  };
  const none = <p className="year-none">{T?.none ?? "Nothing recorded yet."}</p>;

  return (
    <RitualTabs
      ta={ta}
      tabs={[
        {
          key: "year",
          ta: "வருடம்",
          en: "The Year",
          count: T?.festivals(festivals) ?? many(festivals, "festival", "festivals"),
          panel: (
            <div>
              {/* only the months with something recorded in them */}
              {festivals === 0 && none}
              {year.months.filter(({ festivals: these }) => these.length > 0).map(({ month, festivals: these }) => (
                <section key={month.slug} className="year-month">
                  <MonthHead month={month} nowTa={T?.now} />
                  {these.length === 0 ? (
                    none
                  ) : (
                    <div className="year-list">
                      {these.map((e) => (
                        <Entry key={`${e.name ?? ""}|${e.observance?.id ?? ""}`} e={e} className="festival" after={e.length ? (T?.days(e.length) ?? `${e.length} ${e.length === 1 ? "day" : "days"}`) : null} edit={edit} month={month.slug} ta={ta}>
                          {/* its line below the name (Admin2: a box, on the day it is written on) */}
                          {edit && e.aboutRef ? (
                            <EditText className="year-about" value={e.about ?? ""} placeholder="A line below its name" target={{ collection: "occasions", id: e.aboutRef, field: "yearNote", label: "Line below its name (this temple)" }} />
                          ) : (
                            e.about && <span className="year-about">{say(e.about)}</span>
                          )}
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
          en: "The Month",
          count: T?.rituals(monthly.length) ?? many(monthly.length, "ritual", "rituals"),
          panel: monthly.length
            ? GROUPS.filter((g) => g.key !== "weekly").map(({ key, label }) => {
                const these = monthly.filter((x) => x.group === key);
                return these.length ? (
                  <section key={key} className="year-regular">
                    <h4 className="year-regular-head">{groupLabel(key, label)}</h4>
                    {list(these)}
                  </section>
                ) : null;
              })
            : none,
        },
        {
          key: "week",
          ta: "வாரம்",
          en: "The Week",
          count: T?.rituals(weekly.length) ?? many(weekly.length, "ritual", "rituals"),
          panel: weekly.length ? (
            <section className="year-regular">
              <h4 className="year-regular-head">{T?.everyWeek ?? "Every week"}</h4>
              {list(weekly)}
            </section>
          ) : (
            none
          ),
        },
        // only for a temple whose day has been written
        ...(day
          ? [
              {
                key: "day",
                ta: "நாள்",
                en: "The Day",
                count: kaalams ? (T?.kaalams(kaalams) ?? many(kaalams, "kaalam", "kaalams")) : "",
                panel: <RitualDay day={day} temple={edit?.temple} ta={ta} />,
              },
            ]
          : []),
      ]}
    />
  );
}

/** Text written in a box of the admin: a paragraph for each line. */
function Paras({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <>
      {text
        .split(/\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className="day-para">
            {p}
          </p>
        ))}
    </>
  );
}

/** The temple's day: its puja ("4 kaalam puja") as the heading, what holds
    for every kaalam (or, with no kalams, the whole day), then kaalam by
    kaalam (its Tamil, its name and time, a note on the time, what happens,
    and its naivedyam, each only when it is written), then any text after
    them in a box of its own. */
function RitualDay({ day: written, temple, ta = false }: { day: TempleDay; temple?: number; ta?: boolean }) {
  const say = (s?: string) => (ta && s ? said(s) : s);
  const day: TempleDay = ta
    ? {
        ...written,
        standard: say(written.standard),
        intro: say(written.intro),
        notesHeading: say(written.notesHeading),
        notes: say(written.notes),
        kalams: written.kalams.map((k) => ({
          ...k,
          time: say(k.time),
          timingNote: say(k.timingNote),
          whatHappens: say(k.whatHappens),
          naivedyam: say(k.naivedyam),
        })),
      }
    : written;
  // Admin2 (lib/editing): each written part a box to edit, the temple's own;
  // the parts not yet written there too, faintly, to be filled in
  const box = (field: string, label: string, value: string | undefined, as: "h4" | "div", className?: string, long = false) =>
    temple !== undefined ? (
      <EditText as={as} className={className} long={long} value={value ?? ""} placeholder={label} target={{ collection: "temples", id: temple, field, label: `${label} (this temple)` }} />
    ) : null;
  if (temple !== undefined)
    return (
      <>
        <section className="year-regular">
          {box("dayStandard", "The day's puja", day.standard, "h4", "year-regular-head")}
          {box("dayIntro", "About the day", day.intro, "div", "day-para", true)}
          {day.kalams.length > 0 && <Kalams kalams={day.kalams} temple={temple} />}
        </section>
        <section className="year-regular">
          {box("dayNotesHeading", "Heading of the text after", day.notesHeading, "h4", "year-regular-head")}
          {box("dayNotes", "Text after the kaalams", day.notes, "div", "day-para", true)}
        </section>
      </>
    );
  return (
    <>
      <section className="year-regular">
        {day.standard && <h4 className="year-regular-head">{day.standard}</h4>}
        <Paras text={day.intro} />
        {day.kalams.length > 0 && <Kalams kalams={day.kalams} ta={ta} />}
      </section>
      {day.notes && (
        <section className="year-regular">
          {day.notesHeading && <h4 className="year-regular-head">{day.notesHeading}</h4>}
          <Paras text={day.notes} />
        </section>
      )}
    </>
  );
}

function Kalams({ kalams, temple, ta = false }: { kalams: Kalam[]; temple?: number; ta?: boolean }) {
  // Admin2: each part of a kaalam a box (its row in the temple's Ritual Day)
  const box = (k: Kalam, field: string, label: string, as: "span" | "p" | "div", className?: string, long = false, lang?: string) => {
    const value = (k[field as keyof Kalam] as string | undefined) ?? "";
    return (
      <EditText
        as={as}
        className={className}
        long={long}
        lang={lang}
        value={value}
        placeholder={label}
        required={field === "kalam"}
        target={{ collection: "temples", id: temple!, field: `ritualDay.${k.at}.${field}`, label: `${k.kalam}: ${label.toLowerCase()} (this temple)` }}
      />
    );
  };
  return (
    <div className="year-list year-day">
      {kalams.map((k, i) =>
        temple !== undefined && k.at !== undefined ? (
          <div key={i} className="fl">
            {box(k, "tamil", "In Tamil", "span", "t", false, "ta")}
            <span className="caps">
              {box(k, "kalam", "Kaalam", "span")}
              {" · "}
              {box(k, "time", "Time", "span")}
            </span>
            {box(k, "timingNote", "Note on the time", "p", "day-when", true)}
            <h5>What happens</h5>
            {box(k, "whatHappens", "What happens", "p", undefined, true)}
            <h5>Naivedyam</h5>
            {box(k, "naivedyam", "Naivedyam", "p", undefined, true)}
          </div>
        ) : (
          <div key={i} className="fl">
            {k.tamil && (
              <span className="t" lang="ta">
                {k.tamil}
              </span>
            )}
            <span className="caps">
              {ta ? (
                <>
                  <span lang="en">{k.kalam}</span>
                  {k.kalam && k.time && " · "}
                  {k.time}
                </>
              ) : (
                [k.kalam, k.time].filter(Boolean).join(" · ")
              )}
            </span>
            {k.timingNote && <p className="day-when">{k.timingNote}</p>}
            {k.whatHappens && (
              <>
                <h5>{ta ? YEAR_TA.happens : "What happens"}</h5>
                <p>{k.whatHappens}</p>
              </>
            )}
            {k.naivedyam && (
              <>
                <h5>{ta ? YEAR_TA.naivedyam : "Naivedyam"}</h5>
                <p>{k.naivedyam}</p>
              </>
            )}
          </div>
        ),
      )}
    </div>
  );
}

/** Admin2: a regular ritual's line of when, and its few words, as boxes.
    The line is put together from this temple's row of the ritual (Regular
    rituals → At each temple → When, here): its day of the week (the
    ritual's, not changed here), then On, When in the day and Details, each
    a box of its own (faint where empty, to be filled in). Its few words:
    this temple's own if it has them, else the ritual's (every temple). */
function RegularEdit({ e, short, edit }: { e: TempleYearEntry; short: string; edit: YearEdit }) {
  const r = edit.rituals[e.ritualId!];
  const id = Number(e.ritualId);
  // which of its times here this line is
  const i = r.times.findIndex((x) => x.on === (e.on ?? "") && x.time === (e.time ?? "") && x.details === (e.details ?? ""));
  const day = (e.weekdays ?? []).map((d) => DAYS[d] ?? d).join(" and ");
  const part = (field: "on" | "time" | "details", label: string, value: string | undefined) => (
    <EditText
      value={value ?? ""}
      placeholder={label}
      target={{ collection: "weekly-rituals", id, field: `atTemples.${r.row}.times.${i}.${field}`, label: `${label} (this temple)` }}
    />
  );
  return (
    <>
      <span className="year-when">
        {i < 0 ? (
          short
        ) : (
          <>
            {day && `${day} · `}
            {part("on", "On", e.on)}
            {" · "}
            {part("time", "When in the day", e.time)}
            {" · "}
            {part("details", "Details", e.details)}
          </>
        )}
      </span>
      <EditText
        className="year-regular-about"
        long
        value={e.about ?? ""}
        placeholder="In a few words"
        target={
          r.about
            ? { collection: "weekly-rituals", id, field: `atTemples.${r.row}.about`, label: "In a few words (this temple)" }
            : { collection: "weekly-rituals", id, field: "about", label: "In a few words (every temple)" }
        }
      />
    </>
  );
}

/** Admin2: where a festival's length here is kept (the temple's From the
    ritual calendar): its row for this month, else its row for any month,
    else a new row (any month) made when a number is first saved. */
function lengthSource(e: TempleYearEntry, edit: YearEdit, month: string): Target | undefined {
  const festival = e.observance && e.name === undefined ? edit.observances[e.observance.id] : undefined;
  if (!festival) return undefined;
  const row =
    edit.lengths.find((r) => r.festival === festival && r.month === month) ?? edit.lengths.find((r) => r.festival === festival && !r.month);
  return {
    collection: "temples",
    id: edit.temple,
    field: row ? `festivalLengths.${row.row}.days` : `festivalLengths.new.${festival}.any`,
    label: "Length in days (this temple)",
  };
}

/** Admin2: where an entry's names are kept, for its boxes. A regular
    ritual's: this temple's own name or Tamil if it has one there, else the
    ritual's (for every temple). A festival's or ritual's: its own entry
    (every page it is on); a day listed under a name of its own keeps that
    name in the day itself, so it has no box here. */
function sources(e: TempleYearEntry, edit: YearEdit): { nameAt?: Target; tamilAt?: Target } {
  const ritual = e.ritualId ? edit.rituals[e.ritualId] : undefined;
  if (e.ritualId && ritual) {
    const at = (own: boolean, field: "name" | "tamil", base: "what" | "tamil", label: string): Target =>
      own
        ? { collection: "weekly-rituals", id: Number(e.ritualId), field: `atTemples.${ritual.row}.${field}`, label: `${label} (this temple)` }
        : { collection: "weekly-rituals", id: Number(e.ritualId), field: base, label: `${label} (every temple)` };
    return { nameAt: at(ritual.name, "name", "what", "Ritual name"), tamilAt: at(ritual.tamil, "tamil", "tamil", "Tamil name") };
  }
  const id = e.observance ? edit.observances[e.observance.id] : undefined;
  if (!id || (e.name && e.name !== e.observance?.name)) return {};
  return {
    nameAt: { collection: "observances", id, field: "name", label: "Festival name (every page)" },
    tamilAt: { collection: "observances", id, field: "tamil", label: "Tamil name (every page)" },
  };
}

/** The day of the week a weekly one falls on (its timing begins with it), Sunday first, for their order. */
function weekdayOf(short: string) {
  const i = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].findIndex((d) => short.toLowerCase().startsWith(d));
  return i < 0 ? 7 : i;
}

/** One of them: its Tamil, its English (TBC when to be confirmed; the red mark
    and `after` beside it), and what follows; a link to its festival's or
    ritual's page when it has one. */
function Entry({ e, className, after, children, edit, month, ta: inTamil = false }: { e: TempleYearEntry; className: string; after: string | null; children?: ReactNode; edit?: YearEdit; month?: string; ta?: boolean }) {
  // its own Tamil; else its festival's, when it goes by that festival's name
  // (a day under a name of its own, "Aani Utthiram", is not "Abhishekam")
  const named = e.name && e.name !== e.observance?.name;
  const english = e.name ?? e.observance?.name;
  const own = e.tamil ?? (named ? undefined : e.observance?.tamil);
  // (on a Tamil page, its English kept beside its Tamil)
  const ta = own ?? (inTamil && english ? said(english) : undefined);
  const name = english;
  // Admin2 (lib/editing): its names as boxes, each saved where it comes from
  const { nameAt, tamilAt } = edit ? sources(e, edit) : { nameAt: undefined, tamilAt: undefined };
  const lengthAt = edit && month ? lengthSource(e, edit, month) : undefined;
  return (
    <FestivalLink id={e.observance?.id} className={className}>
      {tamilAt ? (
        <EditText className="t" lang="ta" value={ta ?? ""} placeholder="Tamil name" target={tamilAt} />
      ) : (
        ta && (
          <span className="t" lang="ta">
            {ta}
          </span>
        )
      )}
      <span className="caps">
        {e.tbc && (
          <abbr className="tbc-mark" title={inTamil ? YEAR_TA.tbc : "To be confirmed"}>
            {inTamil ? YEAR_TA.tbcShort : "TBC"}
          </abbr>
        )}
        {nameAt ? <EditText value={name ?? ""} target={nameAt} required /> : inTamil ? <span lang="en">{name}</span> : name}
        {lengthAt ? (
          // Admin2: its length here, a box (the number alone; faint "days" while it has none)
          <span className="year-days">
            <span className="lingam" aria-hidden="true" />
            <EditText value={e.length ? String(e.length) : ""} placeholder="days" target={lengthAt} />
            {e.length ? (e.length === 1 ? " day" : " days") : ""}
          </span>
        ) : (
          after && (
            <span className="year-days">
              <span className="lingam" aria-hidden="true" />
              {after}
            </span>
          )
        )}
      </span>
      {children}
    </FestivalLink>
  );
}
