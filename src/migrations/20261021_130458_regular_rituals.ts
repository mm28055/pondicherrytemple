// @ts-nocheck -- written for the regular rituals' fields as they were then (one temple list, and days and time, on each entry); it has run, and is kept as it was
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { EXISTING_WORDS, REGULAR_RITUALS } from './data/regular-rituals-2026-10-21'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_weekly_rituals_often" AS ENUM('weekly', 'fortnightly', 'monthly');
  ALTER TABLE "weekly_rituals" ADD COLUMN "tamil" varchar;
  ALTER TABLE "weekly_rituals" ADD COLUMN "often" "enum_weekly_rituals_often" DEFAULT 'weekly';
  ALTER TABLE "weekly_rituals" ADD COLUMN "on" varchar;
  ALTER TABLE "weekly_rituals" ADD COLUMN "tbc" boolean DEFAULT false;
  ALTER TABLE "weekly_rituals" ADD COLUMN "about" varchar;`)
  await regularRitualsData({ payload, req })
}

/* The temples' regular rituals from their ritual calendars (see
   data/regular-rituals-2026-10-21), entered: each one only where that temple
   has none of the same name already. Varadaraja Perumal's two Friday entries
   become one, as its calendar has it ("Thayar Thirumanjanam and
   Ul-purappadu", 5 pm), the morning one removed only if it is still as it
   was. The entries already there are given Tamil names and a few words where
   they have none. Exported for this computer's copy of the database, which
   takes its columns by itself (scripts). */
export async function regularRitualsData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, context: { skipRevalidate: true } } as const
  const idsOf = async (collection: 'temples' | 'observances', slugs: string[]) => {
    const found = await payload.find({ collection, where: { slug: { in: slugs } }, limit: 500, depth: 0, pagination: false, ...quiet })
    return new Map(found.docs.map((d) => [d.slug as string, d.id as number]))
  }
  const temples = await idsOf('temples', [...new Set(REGULAR_RITUALS.map((r) => r.temple))])
  const observances = await idsOf('observances', [...new Set(REGULAR_RITUALS.flatMap((r) => (r.link ? [r.link] : [])))])
  const all = async () => (await payload.find({ collection: 'weekly-rituals', limit: 1000, depth: 0, pagination: false, ...quiet })).docs
  const atTemple = (d: { temples?: unknown[] | null }, id: number) =>
    (d.temples ?? []).some((t) => (typeof t === 'object' && t ? (t as { id: number }).id : t) === id)

  // Varadaraja Perumal's Fridays: one entry, as in its calendar
  const vp = temples.get('varadaraja-perumal')
  if (vp) {
    const docs = await all()
    const morning = docs.find(
      (d) => d.what === 'Thayar Abhishekam' && atTemple(d, vp) && (d.days ?? []).join() === 'fri' && (d.time ?? '') === 'Morning',
    )
    if (morning) await payload.delete({ collection: 'weekly-rituals', id: morning.id, ...quiet })
    const evening = docs.find((d) => d.what === 'Thayar Ul-purappadu' && atTemple(d, vp))
    const entry = REGULAR_RITUALS.find((r) => r.temple === 'varadaraja-perumal' && r.what === 'Thayar Thirumanjanam and Ul-purappadu')!
    if (evening)
      await payload.update({
        collection: 'weekly-rituals',
        id: evening.id,
        data: {
          what: entry.what,
          tamil: evening.tamil || entry.tamil,
          about: evening.about || entry.about,
          observances: evening.observances?.length ? evening.observances : [observances.get('purappadu')!].filter(Boolean),
        },
        ...quiet,
      })
  }

  // the rest: each where its temple has none of the same name
  const docs = await all()
  for (const r of REGULAR_RITUALS) {
    const temple = temples.get(r.temple)
    if (!temple) continue
    if (docs.some((d) => d.what === r.what && atTemple(d, temple) && (r.days ?? []).every((x) => (d.days ?? []).includes(x)))) continue
    await payload.create({
      collection: 'weekly-rituals',
      data: {
        what: r.what,
        tamil: r.tamil,
        often: r.often,
        days: r.days,
        on: r.on,
        time: r.time,
        about: r.about,
        tbc: r.tbc ?? false,
        temples: [temple],
        observances: r.link && observances.get(r.link) ? [observances.get(r.link)!] : [],
      },
      ...quiet,
    })
  }

  // the ones already there: Tamil names and a few words, where they have none
  for (const d of await all()) {
    const words = EXISTING_WORDS.find((w) => w.what === d.what)
    if (!words || (d.tamil && d.about)) continue
    await payload.update({
      collection: 'weekly-rituals',
      id: d.id,
      data: { tamil: d.tamil || words.tamil, about: d.about || words.about },
      ...quiet,
    })
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "weekly_rituals" DROP COLUMN "tamil";
  ALTER TABLE "weekly_rituals" DROP COLUMN "often";
  ALTER TABLE "weekly_rituals" DROP COLUMN "on";
  ALTER TABLE "weekly_rituals" DROP COLUMN "tbc";
  ALTER TABLE "weekly_rituals" DROP COLUMN "about";
  DROP TYPE "public"."enum_weekly_rituals_often";`)
}
