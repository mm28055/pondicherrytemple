import type { Metadata } from "next";
import { BackLink } from "@/components/BackLink";
import { RitualYear } from "@/components/RitualYear";
import { CALENDAR_TA } from "@/content/festivalsTa";
import { getLineBegins } from "@/lib/data";

export const metadata: Metadata = { title: { absolute: `${CALENDAR_TA.title} — ஸ்தலம்` } };

// Rebuilt once a day, so the month marked "Now" moves on by itself.
export const revalidate = 86400;

/** The Calendar in Tamil (its words: content/festivalsTa), the months' names
    in both languages as on the English page. */
export default async function CalendarPageTamil() {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  return (
    <div className="wrap in-ta" lang="ta">
      <RitualYear
        ta
        today={today}
        begins={await getLineBegins()}
        head={
          <>
            <BackLink className="crumb" href="/ta/festivals-and-rituals">
              ← {CALENDAR_TA.back}
            </BackLink>
            <h1 className="page-title">{CALENDAR_TA.title}</h1>
          </>
        }
      />
    </div>
  );
}
