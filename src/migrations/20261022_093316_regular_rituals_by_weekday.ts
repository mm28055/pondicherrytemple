import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // the entries' day of the week (20261022_100844_regular_rituals_weekday), here first: the day
  // entries are made with it, and the code's entries have it already
  await db.execute(sql`
   DO $$ BEGIN
    CREATE TYPE "public"."enum_weekly_rituals_weekday" AS ENUM('sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  ALTER TABLE "weekly_rituals" ADD COLUMN IF NOT EXISTS "weekday" "enum_weekly_rituals_weekday";`)
  await regularRitualsByWeekdayData({ db, payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the day entries are kept: nothing to undo
}

const DAYS = [
  { key: 'sun', name: 'Sundays' },
  { key: 'mon', name: 'Mondays' },
  { key: 'tue', name: 'Tuesdays' },
  { key: 'wed', name: 'Wednesdays' },
  { key: 'thu', name: 'Thursdays' },
  { key: 'fri', name: 'Fridays' },
  { key: 'sat', name: 'Saturdays' },
] as const
type Day = (typeof DAYS)[number]['key']
const idOf = (v: unknown) => (typeof v === 'object' && v ? (v as { id: number }).id : (v as number))
const clean = (v: string | null | undefined) => (v ?? '').trim() || undefined

/* What is done every week, an entry for each day of the week ("Fridays",
   its day set), with a section for each temple and what it does that day:
   Thayar Ul-purappadu at Varadaraja Perumal, Parashakti Ul-purappadu at
   Chetty Koil, Velli Kavacha Alankaram at Mutthumariamman. Each section keeps
   its ritual's name, Tamil, few words, festival or ritual, Pancha Parvam and
   to be confirmed, and its times that day; a ritual done on two days
   (Tuesdays and Thursdays) is in both. The rituals they came from are
   removed. The times' days are read from the database (the code no longer
   has them: the day is the entry's). Run again, it leaves the day entries as
   they are. Exported for this computer's copy of the database (scripts). */
export async function regularRitualsByWeekdayData({ db, payload, req }: Pick<MigrateUpArgs, 'db' | 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, context: { skipRevalidate: true } } as const
  const dayRows = (await db.execute(sql`SELECT "parent_id", "value" FROM "weekly_rituals_at_temples_times_days" ORDER BY "parent_id", "order"`)).rows as {
    parent_id: string
    value: Day
  }[]
  const daysOf = (timeId: string | null | undefined) => dayRows.filter((d) => d.parent_id === timeId).map((d) => d.value)
  const all = (await payload.find({ collection: 'weekly-rituals', where: { often: { equals: 'weekly' } }, limit: 1000, depth: 0, pagination: false, ...quiet })).docs
  const dayNames = new Set<string>(DAYS.map((d) => d.name.toLowerCase()))
  const rituals = all.filter((r) => !dayNames.has(r.what.trim().toLowerCase()))
  if (!rituals.length) return
  type Section = {
    temple: number
    name: string
    tamil?: string
    about?: string
    panchaParvam: boolean
    tbc: boolean
    observances: number[]
    times: { time?: string; details?: string }[]
  }
  const byDay = new Map<Day, Section[]>(DAYS.map((d) => [d.key, []]))
  for (const r of rituals) {
    for (const at of r.atTemples ?? []) {
      const name = clean(at.name) ?? r.what.trim()
      const observances = (at.observances?.length ? at.observances : (r.observances ?? [])).map(idOf)
      for (const time of at.times ?? []) {
        for (const day of daysOf(time.id)) {
          const sections = byDay.get(day)!
          let here = sections.find((s) => s.temple === idOf(at.temple) && s.name === name)
          if (!here) {
            here = {
              temple: idOf(at.temple),
              name,
              tamil: clean(at.tamil) ?? clean(r.tamil),
              about: clean(at.about) ?? clean(r.about),
              panchaParvam: Boolean(at.panchaParvam),
              tbc: Boolean(at.tbc),
              observances,
              times: [],
            }
            sections.push(here)
          }
          here.times.push({ time: clean(time.time), details: clean(time.details) })
        }
      }
    }
  }
  for (const d of DAYS) {
    const sections = byDay.get(d.key)!
    if (!sections.length) continue
    const had = all.find((r) => r.what.trim().toLowerCase() === d.name.toLowerCase())
    const atTemples = [...((had?.atTemples ?? []) as unknown as Section[]), ...sections]
    if (had) await payload.update({ collection: 'weekly-rituals', id: had.id, data: { weekday: d.key, atTemples }, ...quiet })
    else await payload.create({ collection: 'weekly-rituals', data: { what: d.name, often: 'weekly', weekday: d.key, atTemples }, ...quiet })
  }
  for (const r of rituals) await payload.delete({ collection: 'weekly-rituals', id: r.id, ...quiet })
}
