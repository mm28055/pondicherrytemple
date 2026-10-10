import type { Metadata } from "next";
import Link from "next/link";
import { getLineBegins, getRitualYear } from "@/lib/data";
import { RitualYear } from "@/components/RitualYear";

export const metadata: Metadata = {
  title: "Calendar",
  description: "The ritual year of the temples, month by month: open a month to see what the temples keep in it.",
};

// Rebuilt once a day, so the month marked "Now" moves on by itself.
export const revalidate = 86400;

/** The calendar: the ritual year as a chart of its twelve months, each
    opening its own page; its year in the middle, the Year dropdown above it.
    In the menu, under Festivals & Rituals. */
export default async function CalendarPage() {
  const year = await getRitualYear();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  return (
    <div className="wrap">
      <header className="page-head calendar-head">
        <Link className="crumb" href="/festivals-and-rituals">
          ← Festivals &amp; rituals
        </Link>
        <h1 className="page-title">Calendar</h1>
      </header>

      <section className="section tight">
        {/* the home page's "Full calendar" opens here, the chart filling the screen */}
        <div id="calendar" className="calendar-anchor">
          <RitualYear
            throughYear={year.throughYear.map((o) => ({ id: o.id, name: o.name }))}
            today={today}
            begins={await getLineBegins()}
          />
        </div>
      </section>
    </div>
  );
}
