// A month in a given year (/month/panguni/2027): the same page as the month
// on its own, which is the month in the cycle we are in now.
export { default, generateMetadata } from "../page";

// Rebuilt once a day, so "today" on the calendar moves on by itself.
export const revalidate = 86400;
