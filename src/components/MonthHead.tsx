"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { tamilMonthOf, type TamilMonth } from "@/lib/calendar";
import { todayInIndia } from "@/lib/tamilDate";

/** A month's name over its part of a temple's Ritual Year; the month we are
    in, in its own colour, as on the calendar, marked "Now". Today is found
    in the visitor's browser, the page being built ahead (so it moves on by
    itself, month to month). */
export function MonthHead({ month, nowTa }: { month: TamilMonth; /** on a Tamil page: its word for "Now", and the month's Tamil name */ nowTa?: string }) {
  const [now, setNow] = useState(false);
  useEffect(() => {
    const { y, m, d } = todayInIndia();
    setNow(tamilMonthOf(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`) === month.slug);
  }, [month.slug]);
  return (
    <h3 className={now ? "now" : undefined} style={now ? ({ "--m": month.colour } as CSSProperties) : undefined}>
      {nowTa ? month.tamil : month.name}
      {now && <span className="year-now"> · {nowTa ?? "Now"}</span>}
    </h3>
  );
}
