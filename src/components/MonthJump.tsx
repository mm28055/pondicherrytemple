"use client";

import { useRouter } from "next/navigation";
import { DropBand } from "@/components/DropBand";
import { monthDates, TAMIL_MONTHS } from "@/lib/calendar";
import { keepScroll } from "@/lib/keepScroll";
import { CAL_TA } from "@/content/monthTa";

/** Any month, not only the one before or after: a band of dropdowns, a
    year and a month, in the month's colour, and a link down the page to
    Varam, what is done every week. A choice goes to that month,
    the calendar staying where it was on the screen. A month's year is the
    year it falls in (Thai 2027 is January 2027); the months before the
    calendar begins are not offered. */
export function MonthJump({ month, year, begins, years, ta = false }: { month: string; year: number; begins: string; years: number[]; ta?: boolean }) {
  const T = ta ? CAL_TA : null;
  const nameOf = (m: (typeof TAMIL_MONTHS)[number]) => (ta ? m.tamil : m.name);
  const router = useRouter();
  const go = (slug: string, y: number) => (keepScroll(), router.push(`${ta ? "/ta" : ""}/festivals-and-rituals/month/${slug}/${y}`, { scroll: false }));
  // whether a month is in the calendar's line (on or after its first month)
  const open = (slug: string, y: number) => monthDates(slug, y).first >= begins;
  // a year without this month in the line (2026 has no Thai): its first month that is
  const toYear = (y: number) => go(open(month, y) ? month : TAMIL_MONTHS.find((m) => open(m.slug, y))!.slug, y);

  return (
    <DropBand
      className="month-jump"
      note={
        // the Tamil page goes without it
        T ? undefined : (
          <>
            <span className="on-mouse">Click</span>
            <span className="on-touch">Tap</span> on a day to see what the temples keep in it
          </>
        )
      }
      drops={[
        {
          key: "year",
          label: T?.year ?? "Year",
          value: String(year),
          chosen: String(year),
          choices: years.map((y) => ({ id: String(y), label: String(y) })),
          onPick: (y) => toYear(Number(y)),
        },
        {
          key: "month",
          label: T?.month ?? "Month",
          value: nameOf(TAMIL_MONTHS.find((m) => m.slug === month)!),
          chosen: month,
          choices: TAMIL_MONTHS.map((m) => ({ id: m.slug, label: nameOf(m), disabled: !open(m.slug, year) })),
          onPick: (slug) => go(slug, year),
        },
      ]}
      links={[{ label: T ? `வாரம் · ${T.weekly}` : "Varam · Every week", href: "#varam" }]}
    />
  );
}
