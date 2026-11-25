import type { Metadata } from "next";
import { MonthView } from "@/components/MonthView";
import { TAMIL_MONTHS } from "@/lib/calendar";

type Props = { params: Promise<{ month: string; year?: string }> };

// Rebuilt once a day, so "today" on the calendar moves on by itself.
export const revalidate = 86400;

export function generateStaticParams() {
  return TAMIL_MONTHS.map((m) => ({ month: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { month: slug, year } = await params;
  const m = TAMIL_MONTHS.find((x) => x.slug === slug);
  return m
    ? {
        title: `${m.name}${year ? ` ${year}` : ""}: festivals & rituals`,
        description: `The festivals and rituals of ${m.name}, ${m.span}.`,
      }
    : {};
}

/** A month's page (components/MonthView). In Tamil: /ta. */
export default async function MonthPage({ params }: Props) {
  const { month, year } = await params;
  return <MonthView slug={month} asked={year} />;
}
