/* The Tamil months' first days (src/lib/tamilDate.ts) against the Prokerala
   Tamil calendar's (read 25 November 2026), January to December of each year.
   npx tsx scripts/check-tamil-months.ts */
import { tamilDate, tamilMonthStart } from '../src/lib/tamilDate'
import { monthDates, monthYearOf, TAMIL_MONTHS, tamilMonthOf } from '../src/lib/calendar'

const THEIRS: Record<number, number[]> = {
  2025: [14, 13, 15, 14, 15, 15, 17, 17, 17, 18, 17, 16],
  2026: [15, 13, 15, 14, 15, 15, 17, 18, 18, 18, 17, 16],
  2027: [15, 13, 15, 14, 15, 16, 17, 18, 18, 18, 17, 17],
}
let bad = 0
for (const [y, days] of Object.entries(THEIRS))
  days.forEach((d, i) => {
    const mine = tamilMonthStart((i + 9) % 12, Number(y))
    const theirs = `${y}-${String(i + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    if (mine !== theirs) {
      bad++
      console.log(`mine ${mine}, theirs ${theirs}`)
    }
  })
// every day: the date, the month and its pages agree
for (let t = Date.UTC(2020, 0, 1); t < Date.UTC(2060, 0, 1); t += 864e5) {
  const iso = new Date(t).toISOString().slice(0, 10)
  const [y, m, d] = iso.split('-').map(Number)
  const slug = tamilMonthOf(iso)
  const { first, last } = monthDates(slug, monthYearOf(iso))
  const n = Math.round((t - Date.parse(first)) / 864e5) + 1
  const x = tamilDate(y, m, d)
  if (iso < first || iso > last || n !== x.day || TAMIL_MONTHS.find((k) => k.slug === slug)!.name !== x.month.en) {
    bad++
    console.log('disagree', iso, slug, first, last, x)
  }
}
console.log(bad ? `${bad} wrong` : 'all match')
console.log(JSON.stringify([tamilDate(2026, 11, 24), tamilDate(2026, 11, 25), tamilDate(2026, 4, 13), tamilDate(2026, 4, 14), tamilDate(2027, 1, 14)]))
