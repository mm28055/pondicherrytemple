import type { Metadata } from "next";
import { BackLink } from "@/components/BackLink";
import { getLineBegins } from "@/lib/data";
import { RitualYear } from "@/components/RitualYear";

export const metadata: Metadata = {
  title: "Calendar",
  description: "The ritual year of the temples, month by month: open a month to see what the temples keep in it.",
};

// Rebuilt once a day, so the month marked "Now" moves on by itself.
export const revalidate = 86400;

/** The calendar: the ritual year as a chart of its twelve months, each
    opening its own page; its year in the middle, the Year dropdown above it.
    In the menu, under Festivals & Rituals. On a phone, its months are a
    circle (components/MonthRing), and the year is beside the title. */
export default async function CalendarPage() {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  return (
    <div className="wrap">
      <RitualYear
        today={today}
        begins={await getLineBegins()}
        head={
          <>
            <BackLink className="crumb" href="/festivals-and-rituals">
              ← Festivals &amp; rituals
            </BackLink>
            <h1 className="page-title">Calendar</h1>
          </>
        }
      />
    </div>
  );
}
