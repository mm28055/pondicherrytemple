import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* Varam's photographs (8 November 2026): a photo set can be tagged with the
   weekly ritual it shows ("Fridays"), and its photos then come under that day
   of the week at its temples, in place of the stand-ins. A new column for
   the tag; then the weekly rituals put right and the sets tagged:
   - Pandarinatha Bhajanai at Varadaraja Perumal is the Panduranga Bhajanai,
     on Saturdays, not Sundays;
   - Dakshinamurti Abhishekam at Vedapuriswara at 7 am, Pechaiamman Padayal
     at Angalamman at 6 pm, where no time is written yet;
   - Manimutthumariamman's Friday Abhishekam and Annadanam added to Fridays,
     at 12 pm;
   - the eleven sets of a weekly ritual tagged with it (found by folder),
     each tag only added, nothing else of a set touched. */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "photo_sets_rels" ADD COLUMN IF NOT EXISTS "weekly_rituals_id" integer;
  DO $$ BEGIN
    ALTER TABLE "photo_sets_rels" ADD CONSTRAINT "photo_sets_rels_weekly_rituals_fk" FOREIGN KEY ("weekly_rituals_id") REFERENCES "public"."weekly_rituals"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  CREATE INDEX IF NOT EXISTS "photo_sets_rels_weekly_rituals_id_idx" ON "photo_sets_rels" USING btree ("weekly_rituals_id");`)
  await varamPhotosData({ payload, req })
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "photo_sets_rels" DROP CONSTRAINT IF EXISTS "photo_sets_rels_weekly_rituals_fk";
  DROP INDEX IF EXISTS "photo_sets_rels_weekly_rituals_id_idx";
  ALTER TABLE "photo_sets_rels" DROP COLUMN IF EXISTS "weekly_rituals_id";`)
}

/** The sets, by folder, and the weekly entry each shows (by its name). */
const TAGS: [folder: string, entry: string][] = [
  ['Kāḻattīsvarar Chetty Koyil_Pondicherry/2026-04-12_Bhairava Puja', 'Sundays'],
  ['Kāḻattīsvarar Chetty Koyil_Pondicherry/2026-04-28_Durgai Vaaram Utsavam', 'Tuesdays'],
  ['Kāḻattīsvarar Chetty Koyil_Pondicherry/2026-08-25_Durga Vaaram Utsavam', 'Tuesdays'],
  ['Kāḻattīsvarar Chetty Koyil_Pondicherry/2026-04-24_Parasakti Ul Purappadu', 'Fridays'],
  [
    'Kāḻattīsvarar Chetty Koyil_Pondicherry/2026-05-15 Friday Amman Purappadu Pradosha Nayakar and Vishnupati punya Kaalam Perumal Dwajasthamba',
    'Fridays',
  ],
  ['Varadarāja Perumal_Pondicherry/2026-05-15 Friday Amman Purappadu', 'Fridays'],
  ['Manimutthumariamman/2026-03-20 Friday Abhishekam Annadanam', 'Fridays'],
  ['Varadarāja Perumal_Pondicherry/2026-07-21_Panduranga Bhajanai', 'Panduranga Bhajanai'],
  ['Varadarāja Perumal_Pondicherry/2026-07-25_Panduranga Bhajanai', 'Panduranga Bhajanai'],
]

const same = (a: string, b: string) => a.normalize('NFC').trim().toLowerCase() === b.normalize('NFC').trim().toLowerCase()
const idOf = (v: any): number | undefined => (v && typeof v === 'object' ? v.id : (v ?? undefined))

export async function varamPhotosData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>) {
  const o = { req, overrideAccess: true, depth: 0, limit: 0, pagination: false } as const
  const w = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const temples = (await payload.find({ collection: 'temples', ...o, draft: true } as any)).docs as any[]
  const templeId = (slug: string) => temples.find((t) => t.slug === slug)?.id as number | undefined
  const entries = async () =>
    (await payload.find({ collection: 'weekly-rituals', ...o, where: { often: { equals: 'weekly' } } } as any)).docs as any[]

  // the bhajan: its right name, on Saturdays
  for (const e of await entries())
    if (same(e.what ?? '', 'Pandarinatha Bhajanai'))
      await payload.update({ collection: 'weekly-rituals', id: e.id, data: { what: 'Panduranga Bhajanai', weekday: 'sat' }, ...w } as any)

  // a temple's time on a day, where none is written yet
  const timeAt = async (entry: string, temple: string, time: string) => {
    const e = (await entries()).find((x) => same(x.what ?? '', entry))
    const t = templeId(temple)
    if (!e || !t) return
    let changed = false
    const atTemples = (e.atTemples ?? []).map((a: any) => {
      if (idOf(a.temple) !== t) return a
      const times = a.times?.length ? a.times : [{}]
      if (times.some((x: any) => x.time?.trim())) return a
      changed = true
      return { ...a, times: [{ ...times[0], time }, ...times.slice(1)] }
    })
    if (changed) await payload.update({ collection: 'weekly-rituals', id: e.id, data: { atTemples }, ...w } as any)
  }
  await timeAt('Thursdays', 'vedapuriswara', '7 am')
  await timeAt('Sundays', 'angala-parameswari', '6 pm')

  // Manimutthumariamman on Fridays, unless it is there already
  const fri = (await entries()).find((x) => same(x.what ?? '', 'Fridays'))
  const mani = templeId('manimutthumariamman')
  if (fri && mani && !(fri.atTemples ?? []).some((a: any) => idOf(a.temple) === mani)) {
    const abh = (await payload.find({ collection: 'observances', ...o, where: { name: { equals: 'Abhishekam' } } } as any)).docs[0] as any
    await payload.update({
      collection: 'weekly-rituals',
      id: fri.id,
      data: {
        atTemples: [
          ...(fri.atTemples ?? []),
          { temple: mani, name: 'Abhishekam and Annadanam', times: [{ time: '12 pm' }], observances: abh ? [abh.id] : [], tbc: false },
        ],
      },
      ...w,
    } as any)
  }
  await timeAt('Fridays', 'manimutthumariamman', '12 pm')

  // the sets, each tagged with its weekly ritual (added to any it has)
  const all = await entries()
  const sets = (await payload.find({ collection: 'photo-sets', ...o, joins: false } as any)).docs as any[]
  for (const [folder, entry] of TAGS) {
    const s = sets.find((x) => same(x.folder ?? '', folder))
    const e = all.find((x) => same(x.what ?? '', entry))
    if (!s || !e) {
      payload.logger.warn(`Varam photos: ${!s ? `no set from "${folder}"` : `no weekly entry "${entry}"`}`)
      continue
    }
    const had = (s.weekly ?? []).map(idOf).filter((x: any) => x !== undefined) as number[]
    if (had.includes(e.id)) continue
    await payload.update({ collection: 'photo-sets', id: s.id, data: { weekly: [...had, e.id] }, ...w } as any)
  }
}
