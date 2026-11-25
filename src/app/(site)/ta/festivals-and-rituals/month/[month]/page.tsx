import type { Metadata } from "next";
import { MonthView } from "@/components/MonthView";
import { MONTH_TA } from "@/content/eventsTa";
import { TAMIL_MONTHS } from "@/lib/calendar";

type Props = { params: Promise<{ month: string; year?: string }> };

// Rebuilt once a day, so "today" on the calendar moves on by itself.
export const revalidate = 86400;

export function generateStaticParams() {
  return TAMIL_MONTHS.map((m) => ({ month: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { month, year } = await params;
  const m = TAMIL_MONTHS.find((x) => x.slug === month);
  return m ? { title: { absolute: MONTH_TA.title(m.tamil, year ?? "") } } : {};
}

/** A month's page in Tamil (its words: content/eventsTa, content/monthTa). */
export default async function MonthPageTamil({ params }: Props) {
  const { month, year } = await params;
  return <MonthView slug={month} asked={year} ta />;
}
