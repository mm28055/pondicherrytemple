// A month in a given year, in Tamil: the same page as the month on its own.
export { default, generateMetadata } from "../page";

// Rebuilt once a day, so "today" on the calendar moves on by itself.
export const revalidate = 86400;

// None built ahead: each on its first visit (as the English ones).
export function generateStaticParams(): { month: string; year: string }[] {
  return [];
}
