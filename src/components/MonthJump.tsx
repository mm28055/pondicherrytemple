"use client";

import { useRouter } from "next/navigation";
import { DropBand } from "@/components/DropBand";
import { TAMIL_MONTHS } from "@/lib/calendar";

/** Any month, not only the one before or after: a band of dropdowns, a
    year and a month, in the month's colour, and a link down the page to
    Varam, what is done every week. A choice goes to that month,
    the calendar staying where it was on the screen. A month's year is the
    year it falls in (Thai 2027 is January 2027); the months before the
    calendar begins are not offered. */
export function MonthJump({ month, year, begins, years }: { month: string; year: number; begins: string; years: number[] }) {
  const router = useRouter();
  const go = (slug: string, y: number) => router.push(`/festivals-and-rituals/month/${slug}/${y}`, { scroll: false });
  // whether a month is in the calendar's line (on or after its first month)
  const open = (slug: string, y: number) => `${y}-${TAMIL_MONTHS.find((m) => m.slug === slug)!.starts}` >= begins;
  // a year without this month in the line (2026 has no Thai): its first month that is
  const toYear = (y: number) => go(open(month, y) ? month : TAMIL_MONTHS.find((m) => open(m.slug, y))!.slug, y);

  return (
    <DropBand
      className="month-jump"
      note={
        <>
          <span className="on-mouse">Click</span>
          <span className="on-touch">Tap</span> on a day to see what the temples keep in it
        </>
      }
      drops={[
        {
          key: "year",
          label: "Year",
          value: String(year),
          chosen: String(year),
          choices: years.map((y) => ({ id: String(y), label: String(y) })),
          onPick: (y) => toYear(Number(y)),
        },
        {
          key: "month",
          label: "Month",
          value: TAMIL_MONTHS.find((m) => m.slug === month)!.name,
          chosen: month,
          choices: TAMIL_MONTHS.map((m) => ({ id: m.slug, label: m.name, disabled: !open(m.slug, year) })),
          onPick: (slug) => go(slug, year),
        },
      ]}
      links={[{ label: "Varam · Every week", href: "#varam" }]}
    />
  );
}
