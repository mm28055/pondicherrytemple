/* On this computer only: the tithis worked out by src/lib/tithi.ts, for
   Chennai, against the Prokerala Tamil calendar's (scraped to a JSON file:
   day → its sunrise tithi, when it ends, and its event icons).
   npx tsx scripts/check-tithis.ts <prokerala.json> */
import fs from 'node:fs'
import { Observer } from 'astronomy-engine'
import { TITHIS, nakshatraAt, nakshatrasBetween, tithiAt, tithisBetween } from '../src/lib/tithi'
import type { TithiKey } from '../src/lib/tithiNames'

const P: Record<string, { t: string; ev: string[] }> = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const CHENNAI = new Observer(13.0827, 80.2707, 0)
const NAMES = ['Pradhamai', 'Dwithiya', 'Trithiya', 'Chathurthi', 'Panchami', 'Shashthi', 'Sapthami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi']
const days = Object.keys(P).sort()

// Prokerala's sunrise tithi as 1–30, and the moment it ends
let krishna = tithiAt(new Date(`${days[0]}T01:00:00Z`)) > 15
let last = 0 // the tithi before, 1–14, to see a fortnight turn when its last day was skipped
const theirs = new Map<string, { n: number; ends: number }>()
for (const d of days) {
  const m = P[d].t.match(/^(\S+) (\+ )?([MAEN]) (\d+):(\d+)/)
  if (!m) throw new Error(`${d}: ${P[d].t}`)
  const [, name, plus, part, hh, mm] = m
  let n: number
  if (name === 'Pournami') { n = 15; krishna = true }
  else if (name === 'Amavasai') { n = 30; krishna = false }
  else {
    const i = NAMES.indexOf(name) + 1
    if (i < last) krishna = !krishna // Pournami or Amavasai passed over between two sunrises
    n = i + (krishna ? 15 : 0)
  }
  last = n === 15 || n === 30 ? 0 : ((n - 1) % 15) + 1
  const h = (Number(hh) % 12) + (part === 'M' ? 0 : 12)
  let ends = Date.parse(`${d}T00:00:00Z`) - 5.5 * 3_600_000 + (plus ? 86_400_000 : 0) + (h * 60 + Number(mm)) * 60_000
  // a tithi held at sunrise ends after it: an hour after midnight shown without its "+"
  if (!plus && h < 5) ends += 86_400_000
  theirs.set(d, { n, ends })
}

// 1. the tithi at sunrise, and when it ends
let sunriseOff = 0, worst = 0
for (const d of days) {
  const mine = tithiAt(new Date(theirs.get(d)!.ends - 60_000)) // just before their end: should be theirs
  const after = tithiAt(new Date(theirs.get(d)!.ends + 60_000)) // just after: the next
  if (mine !== theirs.get(d)!.n || after === mine) {
    sunriseOff++
    // how far apart: search for my end of their tithi
    let t = theirs.get(d)!.ends
    let step = 0
    while (tithiAt(new Date(t)) === theirs.get(d)!.n && step < 240) { t += 60_000; step++ }
    let back = 0
    t = theirs.get(d)!.ends
    while (tithiAt(new Date(t)) !== theirs.get(d)!.n && back < 240) { t -= 60_000; back++ }
    worst = Math.max(worst, step || back)
    console.log(`end time differs ${d}: ${P[d].t} (by ${step || -back} min)`)
  }
}
console.log(`tithi end times: ${days.length - sunriseOff} of ${days.length} within a minute; worst ${worst} min`)

// 2. the kept days against Prokerala's own icons
const kept = tithisBetween(days[1], days[days.length - 2], CHENNAI)
const ICON: Partial<Record<TithiKey, string>> = {
  'pradosham-s': 'Pradosham',
  'pradosham-k': 'Pradosham',
  'vinayaka-chaturthi': 'Chaturthi Vratham',
  shashti: 'Shashti Vratham',
}
for (const icon of ['Pradosham', 'Chaturthi Vratham', 'Shashti Vratham']) {
  const mine = new Set([...kept].filter(([, ks]) => ks.some((k) => ICON[k] === icon)).map(([d]) => d))
  const theirsDays = new Set(days.slice(1, -1).filter((d) => P[d].ev.includes(icon)))
  const onlyMine = [...mine].filter((d) => !theirsDays.has(d))
  const onlyTheirs = [...theirsDays].filter((d) => !mine.has(d))
  console.log(`${icon}: ${theirsDays.size} on Prokerala, ${mine.size} mine; only mine ${onlyMine.join(' ') || '-'}; only theirs ${onlyTheirs.join(' ') || '-'}`)
}
// every kept tithi, a count per month, to see none is missing or doubled
const per = new Map<string, number>()
for (const [d, ks] of kept) for (const k of ks) per.set(`${d.slice(0, 7)} ${k}`, (per.get(`${d.slice(0, 7)} ${k}`) ?? 0) + 1)
const total = Object.fromEntries((Object.keys(TITHIS) as TithiKey[]).map((k) => [k, [...kept.values()].filter((ks) => ks.includes(k)).length]))
console.log('kept in all:', total)

// 3. Prokerala's own lists of dates (Chennai), for the tithis its calendar has no icon for
if (process.argv[3]) {
  const lists: Record<string, string[]> = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'))
  for (const [k, dates] of Object.entries(lists)) {
    const inRange = dates.filter((d) => d >= days[1] && d <= days[days.length - 2])
    const mine = [...kept].filter(([d, ks]) => ks.includes(k as TithiKey) && d <= inRange[inRange.length - 1]).map(([d]) => d)
    const onlyMine = mine.filter((d) => !inRange.includes(d))
    const onlyTheirs = inRange.filter((d) => !mine.includes(d))
    console.log(`${k}: ${inRange.length} listed, ${mine.length} mine; only mine ${onlyMine.join(' ') || '-'}; only theirs ${onlyTheirs.join(' ') || '-'}`)
  }
}

// 4. Pournami and Amavasya against Prokerala's icons
for (const [k, icon] of [['pournami', 'Pournami'], ['amavasya', 'Amavasai']] as const) {
  const mine = [...kept].filter(([, ks]) => ks.includes(k)).map(([d]) => d)
  const theirsDays = days.slice(1, -1).filter((d) => P[d].ev.includes(icon))
  console.log(`${icon}: ${theirsDays.length} on Prokerala, ${mine.length} mine; only mine ${mine.filter((d) => !theirsDays.includes(d)).join(' ') || '-'}; only theirs ${theirsDays.filter((d) => !mine.includes(d)).join(' ') || '-'}`)
}

// 5. the nakshatra at sunrise, and when it ends
{
  const NK = ['Asvini', 'Bharani', 'Karthikai', 'Rohini', 'Mrigashirsham', 'Thiruvathirai', 'Punarpoosam', 'Poosam', 'Ayilyam', 'Makam', 'Pooram', 'Uthiram', 'Hastham', 'Chithirai', 'Swathi', 'Visakam', 'Anusham', 'Kettai', 'Moolam', 'Pooradam', 'Uthiradam', 'Tiruvonam', 'Avittam', 'Sadhayam', 'Poorattadhi', 'Uthirattadhi', 'Revathi']
  const mine = nakshatrasBetween(days[0], days[days.length - 1], CHENNAI)
  let sameName = 0
  const offs: number[] = []
  for (const d of days) {
    const m = (P[d] as any).nk.match(/^(\S+) (\+ )?([MAEN]) (\d+):(\d+)/)
    if (!m) continue
    const [, name, plus, part, hh, mm] = m
    if (NK[mine[d][0]] === name) sameName++
    else console.log(`nakshatra differs ${d}: Prokerala ${name}, mine ${mine[d].map((n) => NK[n]).join(', ')}`)
    const h = (Number(hh) % 12) + (part === 'M' ? 0 : 12)
    let ends = Date.parse(`${d}T00:00:00Z`) - 5.5 * 3_600_000 + (plus ? 86_400_000 : 0) + (h * 60 + Number(mm)) * 60_000
    if (!plus && h < 5) ends += 86_400_000
    // my end of their nakshatra, to the minute
    const n = NK.indexOf(name)
    let t = ends - 120 * 60_000
    while (nakshatraAt(new Date(t)) !== n && t < ends + 120 * 60_000) t += 60_000
    while (nakshatraAt(new Date(t)) === n && t < ends + 240 * 60_000) t += 60_000
    offs.push(Math.round((t - ends) / 60_000))
  }
  console.log("end times more than 2 minutes apart:", offs.filter((o) => Math.abs(o) > 2).length)
  offs.sort((a, b) => a - b)
  console.log(`nakshatra at sunrise: ${sameName} of ${days.length} the same; end times, mine less theirs, in minutes: min ${offs[0]}, median ${offs[offs.length >> 1]}, max ${offs[offs.length - 1]}`)
}
