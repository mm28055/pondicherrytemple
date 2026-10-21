"use client";

import Link from "next/link";
import { FestivalLink } from "@/components/FestivalLink";
import { inGlide, startGlide } from "@/components/MonthSwipe";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type TouchEvent,
} from "react";
import {
  dateParts,
  daysBetween,
  formatDate,
  monthDates,
  monthYearOf,
  moonsBetween,
  TAMIL_MONTHS,
  tamilMonthOf,
  type TamilMonth,
} from "@/lib/calendar";
import { HIDDEN_TITHIS, TITHI_NAMES, type TithiKey } from "@/lib/tithiNames";
import type { SpecialIconKey } from "@/lib/specialIcons";
import { NAKSHATRAS } from "@/lib/nakshatraNames";
import { NakshatraIcon } from "@/components/NakshatraIcon";
import { SpecialIcon, TithiIcon } from "@/components/TithiIcon";

export interface CalendarEvent {
  date: string;
  /** The temple, and its page; `short` without "Koil" or "Devasthanam". */
  place: string;
  short: string;
  placeHref?: string;
  /** What happened, and the field note about it. */
  label: string;
  noteHref?: string;
  /** The festivals and rituals it was part of, each with its page. */
  observances: { label: string; href?: string }[];
  /** Still to be confirmed: shown fainter, marked "TBC". */
  tbc?: boolean;
}

const WEEK = [
  ["Sun", "ஞாயிறு"],
  ["Mon", "திங்கள்"],
  ["Tue", "செவ்வாய்"],
  ["Wed", "புதன்"],
  ["Thu", "வியாழன்"],
  ["Fri", "வெள்ளி"],
  ["Sat", "சனி"],
];

const MOON = {
  full: { ta: "பௌர்ணமி", en: "Pournami" },
  new: { ta: "அமாவாசை", en: "Amavasya" },
};

/** A day's tithis (worked out on the server, tithi.ts): its full or new
    moon, and the others, each shown by its icon. */
type Tithis = Record<string, TithiKey[]>;
const moonOf = (keys: TithiKey[] = []) =>
  keys.includes("pournami") ? ("full" as const) : keys.includes("amavasya") ? ("new" as const) : undefined;
const othersOf = (keys: TithiKey[] = []) => keys.filter((k) => k !== "pournami" && k !== "amavasya");
const MOON_KEY = { full: "pournami", new: "amavasya" } as const;

/** day → what is kept on it as the year's great days (rules set in the
    admin), each with the day's name: a tithi, its moon or icon circled; or,
    for a day kept on its nakshatram, the nakshatram, its icon circled. The
    name is given in the pop-up. */
export type Great = Record<string, { name: string; tamil: string; tithi?: TithiKey; nakshatra?: number; icon?: SpecialIconKey }[]>;
/** day → nakshatra → the icon chosen (in the admin) to show a special nakshatram by, in place of its own */
export type Swap = Record<string, Record<number, SpecialIconKey>>;
const tithiMark = (great: Great | undefined, day: string, k: TithiKey) => great?.[day]?.find((m) => m.tithi === k);
/** A tithi's icon on a day: the one a rule chose in its place, if any, or its own. */
const tithiFace = (great: Great | undefined, day: string, k: TithiKey) => {
  const icon = tithiMark(great, day, k)?.icon;
  return icon ? <SpecialIcon k={icon} /> : <TithiIcon k={k} />;
};
/** A nakshatram's icon in a day's box: the one chosen in its place, if any, or its own. */
const nakFace = (swap: Swap, great: Great, day: string, k: number) => {
  const icon = swap[day]?.[k] ?? great[day]?.find((m) => m.nakshatra === k)?.icon;
  return icon ? <SpecialIcon k={icon} /> : <NakshatraIcon n={k} />;
};
/** The tithis shown on a day: all but those kept only where a rule names them. */
const shownOf = (keys: TithiKey[] | undefined, great: Great | undefined, day: string) =>
  othersOf(keys).filter((k) => !HIDDEN_TITHIS.has(k) || tithiMark(great, day, k));
const nakMarks = (great: Great | undefined, day: string) => (great?.[day] ?? []).filter((m) => m.nakshatra !== undefined);
/** The full or new moon's disc; on a great day, in its halo. Every halo (the
    circle round a great day's moon or icon) is one box, the same in each view
    (site.css, .halo): the icon in its middle, the same space round it. */
function MoonDot({ halo }: { halo: boolean }) {
  return halo ? (
    <span className="halo">
      <span className="dot" aria-hidden="true" />
    </span>
  ) : (
    <span className="dot" aria-hidden="true" />
  );
}
/** A great day's name, then the tithi it is (when the name doesn't say it), for the pop-up. */
function GreatName({ g, plain }: { g: { name: string; tamil: string }; plain: string }) {
  return (
    <>
      {g.name}
      {g.tamil && (
        <>
          {" · "}
          <span lang="ta">{g.tamil}</span>
        </>
      )}
      {!g.name.toLowerCase().includes(plain.toLowerCase()) && (
        <>
          {" "}
          <span className="great-plain">{plain}</span>
        </>
      )}
    </>
  );
}

/** The temple, what happened, and the festivals it was part of — each its own
    link — and the field note about it. */
function item(e: CalendarEvent) {
  return (
    <>
      <span className={e.tbc ? "cal-line tbc" : "cal-line"}>
        {e.tbc && (
          <abbr className="tbc-mark" title="To be confirmed">
            TBC
          </abbr>
        )}
        {e.placeHref ? (
          <Link className="cal-place" href={e.placeHref} title={e.place}>
            {e.place}
          </Link>
        ) : (
          <span className="cal-place">{e.place}</span>
        )}
        {e.label && <span className="cal-label"> · {e.label}</span>}
      </span>
      {e.observances.length > 0 && (
        <span className="cal-tags">
          {e.observances.map((o) => (
            <FestivalLink key={o.label} href={o.href} title={o.label}>
              {o.label}
            </FestivalLink>
          ))}
        </span>
      )}
      {e.noteHref && (
        <Link className="cal-read arrow-link" href={e.noteHref}>
          Read the field note
        </Link>
      )}
    </>
  );
}

/** A day, large, over the page: its date, English and Tamil, the moon, and
    everything recorded on it. On a month's calendar, and from the home
    page's "Today". Shown while `day` is set; closing it calls onClose.
    Given the month's `days` and `onDay`, it steps to the day before or after:
    with the arrows at its sides, the arrow keys, a swipe of a finger, a drag
    of the mouse, or two fingers across a trackpad. */
export function DayDialog({
  day,
  events,
  onClose,
  days,
  onDay,
  tithis,
  nakshatras,
  special,
  swap,
  great,
  className,
  style,
}: {
  day: string | null;
  events: CalendarEvent[];
  onClose: () => void;
  days?: string[];
  /** the month's tithis; without them (the home page's "Today"), the full and new moons alone */
  tithis?: Tithis;
  nakshatras?: Record<string, number[]>;
  special?: Record<string, number[]>;
  swap?: Swap;
  great?: Great;
  onDay?: (day: string) => void;
  /** where it sits, when not in the middle of the screen (the home page's "Today") */
  className?: string;
  style?: CSSProperties;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (day && !dialog.current?.open) dialog.current?.showModal();
  }, [day]);
  const month = day ? TAMIL_MONTHS.find((m) => m.slug === tamilMonthOf(day))! : null;
  const dayOfMonth = day && month ? daysBetween(monthDates(month.slug, monthYearOf(day)).first, day).length : 0;
  const moon = day ? (tithis ? moonOf(tithis[day]) : moonsBetween(day, day).get(day)) : undefined;
  const others = day && tithis ? shownOf(tithis[day], great, day) : [];
  const on = day ? events.filter((e) => e.date === day) : [];

  // the day before and after, within the month
  const at = day && days ? days.indexOf(day) : -1;
  const before = at > 0 ? days![at - 1] : null;
  const after = at >= 0 && at < days!.length - 1 ? days![at + 1] : null;
  // which way the new day slides in from
  const [way, setWay] = useState<"next" | "prev" | null>(null);
  const step = (dir: -1 | 1) => {
    const to = dir > 0 ? after : before;
    follow(0, true);
    if (!to || !onDay) return;
    setWay(dir > 0 ? "next" : "prev");
    onDay(to);
  };
  const latest = useRef(step);
  latest.current = step;

  // the day follows the finger (or mouse) across; towards an end of the
  // month, only a little
  const follow = (dx: number, settle = false) => {
    const el = body.current;
    if (!el) return;
    const ok = (dx < 0 ? after : before) || dx === 0;
    const x = ok ? dx : Math.sign(dx) * 30 * (1 - Math.exp(-Math.abs(dx) / 100));
    el.style.transition = settle ? "transform 0.2s ease-out, opacity 0.2s" : "none";
    el.style.transform = x ? `translateX(${x}px)` : "";
    el.style.opacity = x ? String(Math.max(0.35, 1 - Math.abs(x) / 400)) : "";
  };

  // a swipe or drag: decided once, after a little movement, across or not
  const start = useRef<{ x: number; y: number; t: number; along: boolean | null } | null>(null);
  const moved = useRef(false);
  const begin = (x: number, y: number) => {
    start.current = { x, y, t: Date.now(), along: null };
    moved.current = false;
  };
  const move = (x: number, y: number) => {
    const s = start.current;
    if (!s) return false;
    const dx = x - s.x, dy = y - s.y;
    if (s.along === null && Math.hypot(dx, dy) > 8) s.along = Math.abs(dx) > Math.abs(dy) * 1.2;
    if (s.along) {
      moved.current = true;
      follow(dx);
    }
    return Boolean(s.along);
  };
  const end = (x: number) => {
    const s = start.current;
    start.current = null;
    if (!s?.along) return;
    const dx = x - s.x;
    const flick = Math.abs(dx) / Math.max(1, Date.now() - s.t) > 0.5 && Math.abs(dx) > 30;
    if (Math.abs(dx) < 80 && !flick) return follow(0, true); // back into place
    step(dx < 0 ? 1 : -1);
  };

  // on the month's page, the calendar itself swipes to the next month: a
  // swipe in here is the pop-up's own, and goes no further
  const touch = {
    onTouchStart: (e: TouchEvent) => {
      e.stopPropagation();
      if (days) begin(e.touches[0].clientX, e.touches[0].clientY);
    },
    onTouchMove: (e: TouchEvent) => {
      e.stopPropagation();
      move(e.touches[0].clientX, e.touches[0].clientY);
    },
    onTouchEnd: (e: TouchEvent) => {
      e.stopPropagation();
      end(e.changedTouches[0].clientX);
    },
    onTouchCancel: (e: TouchEvent) => {
      e.stopPropagation();
      start.current = null;
      follow(0, true);
    },
  };
  // the mouse: pressed, dragged across, let go
  const mouse = {
    onPointerDown: (e: PointerEvent) => {
      if (!days || e.pointerType !== "mouse" || e.button !== 0) return;
      begin(e.clientX, e.clientY);
    },
    onPointerMove: (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !start.current) return;
      if (move(e.clientX, e.clientY) && !dialog.current?.hasPointerCapture(e.pointerId)) {
        dialog.current?.setPointerCapture(e.pointerId);
        dialog.current?.classList.add("dragging");
      }
    },
    onPointerUp: (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      dialog.current?.classList.remove("dragging");
      end(e.clientX);
    },
  };

  // two fingers across a trackpad: past a little way, the next day (and the
  // glide after the fingers lift is let go of, so one swipe is one day)
  useEffect(() => {
    const el = dialog.current;
    if (!el || !days) return;
    let dx = 0;
    let rest: number | undefined;
    const onWheel = (e: WheelEvent) => {
      e.stopPropagation(); // not the month's own swipe
      const across = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!dx && !across) return; // up and down: the pop-up scrolls
      e.preventDefault();
      if (inGlide(e.deltaX)) return;
      dx -= e.deltaX;
      window.clearTimeout(rest);
      if (Math.abs(dx) > 90) {
        const dir = dx < 0 ? 1 : -1;
        dx = 0;
        startGlide(e.deltaX);
        latest.current(dir);
        return;
      }
      follow(dx);
      rest = window.setTimeout(() => {
        dx = 0;
        follow(0, true);
      }, 200);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, day]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (!days) return;
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  };

  return (
    <dialog
      ref={dialog}
      className={`day-dialog${days ? " stepped" : ""}${className ? ` ${className}` : ""}`}
      style={{ ...(month ? ({ "--m": month.colour } as CSSProperties) : {}), ...style }}
      onClose={() => {
        setWay(null);
        onClose();
      }}
      onKeyDown={onKeyDown}
      {...touch}
      {...mouse}
      // a drag across is not a click: it neither follows a link nor closes the pop-up
      onClickCapture={(e) => {
        if (!moved.current) return;
        moved.current = false;
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
    >
      {day && month && (
        <>
          <button type="button" className="day-close" onClick={() => dialog.current?.close()} aria-label="Close">
            ×
          </button>
          {days && (
            <>
              <button
                type="button"
                className="day-step prev"
                onClick={() => step(-1)}
                disabled={!before}
                aria-label="The day before"
              >
                ‹
              </button>
              <button
                type="button"
                className="day-step next"
                onClick={() => step(1)}
                disabled={!after}
                aria-label="The day after"
              >
                ›
              </button>
            </>
          )}
          <div className="day-body" ref={body}>
            <div key={day} className={way ? `day-slide from-${way}` : "day-slide"}>
              <div className="day-head">
                <span className="day-num">{Number(day.slice(8))}</span>
                <span>
                  {/* the day of the month is the large number: here only its month, year and weekday */}
                  <span className="day-date">
                    {dateParts(day).month} {dateParts(day).year},{" "}
                    {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date(`${day}T00:00:00Z`).getUTCDay()]}
                  </span>
                  <span className="day-local">
                    {month.name} {dayOfMonth} ·{" "}
                    <span lang="ta">
                      {month.tamil} {dayOfMonth}
                    </span>
                  </span>
                  {/* the moon, the tithis and the nakshatrams: a line each,
                      every icon in one column (as wide as a halo), sitting on
                      its line's baseline, the names after it all starting at
                      one place and wrapping under themselves */}
                  {moon && (
                    <span className={`day-line cal-moon ${moon}`}>
                      <span className="day-icon">
                        <MoonDot halo={Boolean(tithiMark(great, day, MOON_KEY[moon]))} />
                      </span>
                      <span className="day-text">
                        {tithiMark(great, day, MOON_KEY[moon]) ? (
                          <GreatName g={tithiMark(great, day, MOON_KEY[moon])!} plain={MOON[moon].en} />
                        ) : (
                          <>
                            {MOON[moon].en} · <span lang="ta">{MOON[moon].ta}</span>
                          </>
                        )}
                      </span>
                    </span>
                  )}
                  {others.map((k) => (
                    <span key={k} className="day-line">
                      <span className="day-icon">
                        <span className={`cal-tithi${tithiMark(great, day, k) ? " great halo" : ""}`} aria-hidden="true">
                          {tithiFace(great, day, k)}
                        </span>
                      </span>
                      <span className="day-text">
                        {tithiMark(great, day, k) ? (
                          <GreatName g={tithiMark(great, day, k)!} plain={TITHI_NAMES[k].name} />
                        ) : (
                          <>
                            {TITHI_NAMES[k].name} · <span lang="ta">{TITHI_NAMES[k].tamil}</span>
                          </>
                        )}
                      </span>
                    </span>
                  ))}
                  {nakMarks(great, day).map((m) => (
                    <span key={m.name} className="day-line">
                      <span className="day-icon">
                        <span className="cal-nak-mark great halo" aria-hidden="true">
                          {m.icon ? <SpecialIcon k={m.icon} /> : <NakshatraIcon n={m.nakshatra!} />}
                        </span>
                      </span>
                      <span className="day-text">
                        <GreatName g={m} plain={NAKSHATRAS[m.nakshatra!].name} />
                      </span>
                    </span>
                  ))}
                  {/* the nakshatra at sunrise, then any that begin before the next, a line each */}
                  {nakshatras?.[day]?.map((k, i) => (
                    <span key={k} className={`day-line day-nak${special?.[day]?.includes(k) ? " special" : ""}`}>
                      <span className="day-icon">
                        {special?.[day]?.includes(k) ? (
                          <span className="cal-nak-mark great halo">
                            {swap?.[day]?.[k] ? <SpecialIcon k={swap[day][k]} /> : <NakshatraIcon n={k} />}
                          </span>
                        ) : (
                          <NakshatraIcon n={k} />
                        )}
                      </span>
                      <span className="day-text">
                        {i > 0 && <span className="cal-nak-then">then </span>}
                        <span className="cal-nak-name">{NAKSHATRAS[k].name}</span>
                      </span>
                    </span>
                  ))}
                </span>
              </div>
              {on.length > 0 ? (
                <ul className="day-events">
                  {on.map((e) => (
                    <li key={e.place + e.label}>{item(e)}</li>
                  ))}
                </ul>
              ) : (
                <p className="day-none">Nothing recorded on this day.</p>
              )}
              {/* what "TBC" means, when there is one */}
              {on.some((e) => e.tbc) && (
                <p className="tbc-key">
                  <abbr className="tbc-mark" title="To be confirmed">
                    TBC
                  </abbr>
                  to be confirmed
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </dialog>
  );
}

/** One Tamil month in one year, laid out like the sheet calendar on a
    Tamil kitchen wall: the English date large, the day of the Tamil month
    small, the full and new moons marked, and the days the team was at the
    temples tinted. A click on a day opens it, with all that was recorded. */
export function MonthCalendar({
  month,
  year,
  events,
  tithis,
  nakshatras,
  special,
  swap = {},
  great = {},
  today,
}: {
  month: TamilMonth;
  year: number;
  events: CalendarEvent[];
  tithis: Tithis;
  /** day → its nakshatras, 0–26 */
  nakshatras: Record<string, number[]>;
  /** day → the nakshatrams kept specially on it (rules set in the admin) */
  special: Record<string, number[]>;
  /** day → nakshatra → the icon a special nakshatram is shown by in place of its own */
  swap?: Swap;
  /** day → the tithis kept on it as great days (rules set in the admin) */
  great?: Great;
  today: string;
}) {
  const { first, last } = monthDates(month.slug, year);
  const days = daysBetween(first, last);
  const blanks = new Date(`${first}T00:00:00Z`).getUTCDay();
  const count = (day: string) => events.filter((e) => e.date === day).length;
  const weeks = Math.ceil((blanks + days.length) / 7); // the boxes share the screen's height

  const [open, setOpen] = useState<string | null>(null);
  const choose = (e: { preventDefault: () => void }, day: string) => {
    e.preventDefault();
    setOpen(day);
  };

  return (
    <section className="month-cal">
      <div
        className="cal"
        role="grid"
        aria-label={`${month.name} ${year}`}
        style={{ "--weeks": weeks } as CSSProperties}
      >
        {WEEK.map(([en, ta]) => (
          <div key={en} className="cal-wd" role="columnheader">
            <span lang="ta">{ta}</span>
            <span className="caps">{en}</span>
          </div>
        ))}
        {Array.from({ length: blanks }, (_, i) => (
          <div key={`b${i}`} className="cal-blank" aria-hidden="true" />
        ))}
        {days.map((day, i) => {
          const n = count(day);
          const moon = moonOf(tithis[day]);
          const others = shownOf(tithis[day], great, day);
          return (
            <div
              key={day}
              role="gridcell"
              tabIndex={0}
              aria-label={`${formatDate(day)}${others.length ? `, ${others.map((k) => tithiMark(great, day, k)?.name ?? TITHI_NAMES[k].name).join(", ")}` : ""}${n ? `: ${n} recorded` : ""}`}
              onClick={(e) => choose(e, day)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && choose(e, day)}
              className={`cal-day${n ? " has" : ""}${day === today ? " is-today" : ""}`}
            >
              <div className="cal-top">
                <span className="cal-date">
                  <span className="cal-num">
                    {Number(day.slice(8))}
                    {/* the full or new moon: just its white or black disc, beside the date */}
                    {moon && (
                      <span
                        className={`cal-moon in-box ${moon}${tithiMark(great, day, MOON_KEY[moon]) ? " great" : ""}`}
                        title={tithiMark(great, day, MOON_KEY[moon])?.name ?? MOON[moon].en}
                        aria-label={tithiMark(great, day, MOON_KEY[moon])?.name ?? MOON[moon].en}
                      >
                        <MoonDot halo={Boolean(tithiMark(great, day, MOON_KEY[moon]))} />
                      </span>
                    )}
                  </span>
                  {/* the tithis kept on the day: an icon each, named on hover */}
                  {others.map((k) => (
                    <span
                      key={k}
                      className={`cal-tithi${tithiMark(great, day, k) ? " great halo" : ""}`}
                      title={tithiMark(great, day, k)?.name ?? TITHI_NAMES[k].name}
                      aria-label={tithiMark(great, day, k)?.name ?? TITHI_NAMES[k].name}
                      role="img"
                    >
                      {tithiFace(great, day, k)}
                    </span>
                  ))}
                </span>
                <span className="cal-ta" title={`${month.name} ${i + 1}`}>
                  {i + 1}
                </span>
              </div>
              {/* the day's nakshatras: the one at sunrise, then any that begin before the next */}
              <ul className="cal-naks">
                {(nakshatras[day] ?? []).map((k) => (
                  <li key={k} title={NAKSHATRAS[k].name} className={special[day]?.includes(k) || nakMarks(great, day).some((m) => m.nakshatra === k) ? "special" : undefined}>
                    {special[day]?.includes(k) || nakMarks(great, day).some((m) => m.nakshatra === k) ? (
                      <span className="cal-nak-mark great halo">
                        {nakFace(swap, great, day, k)}
                      </span>
                    ) : (
                      <NakshatraIcon n={k} />
                    )}
                    <span className="cal-nak-name">{NAKSHATRAS[k].name}</span>
                  </li>
                ))}
              </ul>
              {/* On a phone, under the dates, from the box's left edge: the full or new
                  moon, a special nakshatram's icon (circled) and the tithis' icons in one row (the
                  nakshatras left to the pop-up); then a dot for each thing recorded on the
                  day, overlapping, up to four */}
              <span className="cal-foot" aria-hidden="true">
                <span className="cal-icons">
                  {moon && (
                    <span className={`cal-moon ${moon}${tithiMark(great, day, MOON_KEY[moon]) ? " great" : ""}`} title={tithiMark(great, day, MOON_KEY[moon])?.name ?? MOON[moon].en}>
                      <MoonDot halo={Boolean(tithiMark(great, day, MOON_KEY[moon]))} />
                    </span>
                  )}
                  {(special[day] ?? []).map((k) => (
                    <span key={`n${k}`} className="cal-nak-mark great halo" title={NAKSHATRAS[k].name}>
                      {swap[day]?.[k] ? <SpecialIcon k={swap[day][k]} /> : <NakshatraIcon n={k} />}
                    </span>
                  ))}
                  {nakMarks(great, day).filter((m) => !special[day]?.includes(m.nakshatra!)).map((m) => (
                    <span key={m.name} className="cal-nak-mark great halo" title={m.name}>
                      {m.icon ? <SpecialIcon k={m.icon} /> : <NakshatraIcon n={m.nakshatra!} />}
                    </span>
                  ))}
                  {others.map((k) => (
                    <span key={k} className={`cal-tithi${tithiMark(great, day, k) ? " great halo" : ""}`} title={tithiMark(great, day, k)?.name ?? TITHI_NAMES[k].name}>
                      {tithiFace(great, day, k)}
                    </span>
                  ))}
                </span>
                {/* kept even when empty, so the icons sit at the same height on every day */}
                <span className="cal-dots">
                  {Array.from({ length: Math.min(n, 4) }, (_, i) => (
                    <i key={i} />
                  ))}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      {!events.length && (
        <p className="note-line month-cal-none">
          No days recorded yet in {month.name} {year}.
        </p>
      )}

      {/* A day, large, over the page; from it, the days either side */}
      <DayDialog day={open} events={events} days={days} tithis={tithis} nakshatras={nakshatras} special={special} swap={swap} great={great} onDay={setOpen} onClose={() => setOpen(null)} />
    </section>
  );
}
