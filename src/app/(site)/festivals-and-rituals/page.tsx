import type { Metadata } from "next";
import {
  countTemplesForObservance,
  getObservances,
  getOccasionsForObservance,
  getRitualYear,
  getSectionIntro,
} from "@/lib/data";
import { tamilMonthOf } from "@/lib/calendar";
import { observanceRow } from "@/lib/view";
import { ObservanceRow } from "@/components/Rows";
import { RitualYear } from "@/components/RitualYear";

export const metadata: Metadata = {
  title: "Festivals & Rituals",
  description:
    "The festivals and rituals of the temples — each explained once, with every field note and article about it.",
};

// Rebuilt once a day, so the month marked "Now" moves on by itself.
export const revalidate = 86400;

export default async function ObservancesPage() {
  const year = await getRitualYear();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  const all = await Promise.all(
    (await getObservances()).map(async (o) => ({
      o,
      row: observanceRow(o, await countTemplesForObservance(o.id)),
      seen: (await getOccasionsForObservance(o.id)).length,
    }))
  );
  // most often seen first, within each kind
  const sorted = all.sort((a, b) => b.seen - a.seen || a.o.name.localeCompare(b.o.name));
  const festivals = sorted.filter((x) => x.o.kind === "festival");
  const rituals = sorted.filter((x) => x.o.kind === "ritual");

  return (
    <div className="wrap">
      <header className="page-head">
        <div className="kicker">The ritual year</div>
        <h1 className="page-title">Festivals &amp; Rituals</h1>
        <p className="page-lede">{await getSectionIntro("observances")}</p>
      </header>

      <section className="section">
        <div className="section-head">
          <h2>By month</h2>
        </div>
        <RitualYear months={year.months} throughYear={year.throughYear} now={tamilMonthOf(today)} />
      </section>

      <section className="section">
        <div className="section-head">
          <h2>All festivals</h2>
        </div>
        {festivals.map(({ row }) => (
          <ObservanceRow key={row.id} row={row} />
        ))}
      </section>

      <section className="section tight">
        <div className="section-head">
          <h2>All rituals</h2>
        </div>
        {rituals.map(({ row }) => (
          <ObservanceRow key={row.id} row={row} />
        ))}
      </section>
    </div>
  );
}
