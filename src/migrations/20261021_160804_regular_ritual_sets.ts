import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { templeFacesColumns } from './20261021_164954_temple_faces'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "weekly_rituals" ADD COLUMN IF NOT EXISTS "part_of" varchar;
  ALTER TABLE "weekly_rituals" ADD COLUMN IF NOT EXISTS "part_of_tamil" varchar;`)
  // the temples' Faces (20261021_164954_temple_faces), here first: what
  // follows reads the temples, and the code's temples have it already
  await templeFacesColumns(db)
  await ritualSetsData({ payload, req })
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "weekly_rituals" DROP COLUMN "part_of";
  ALTER TABLE "weekly_rituals" DROP COLUMN "part_of_tamil";`)
}

/* At Chetty Koyil and Vedapuriswara, the five of every month that make the
   Pancha Paruva Utsavam, set as part of it: only where nothing is set yet.
   Chetty Koyil's Masa Shivaratri, the one of the five it did not have yet,
   entered (as Vedapuriswara's), unless it is there already.
   Exported for this computer's copy of the database, which takes its columns
   by itself (scripts). */
const PANCHA_PARUVA = ['Amavasya', 'Pournami', 'Maasa Pirappu', 'Masa Shivaratri', 'Theipirai Ashtami']
export async function ritualSetsData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, context: { skipRevalidate: true } } as const
  const temples = await payload.find({
    collection: 'temples',
    where: { slug: { in: ['chetty-koil', 'vedapuriswara'] } },
    depth: 0,
    pagination: false,
    ...quiet,
  })
  const ids = new Set(temples.docs.map((t) => t.id))
  const all = async () => (await payload.find({ collection: 'weekly-rituals', limit: 1000, depth: 0, pagination: false, ...quiet })).docs
  const atTemple = (d: { temples?: unknown[] | null }, id: number) =>
    (d.temples ?? []).some((t) => (typeof t === 'object' && t ? (t as { id: number }).id : t) === id)

  const chetty = temples.docs.find((t) => t.slug === 'chetty-koil')?.id
  if (chetty && !(await all()).some((d) => d.what === 'Masa Shivaratri' && atTemple(d, chetty))) {
    const link = (await payload.find({ collection: 'observances', where: { slug: { equals: 'masa-shivaratri' } }, depth: 0, ...quiet })).docs[0]
    await payload.create({
      collection: 'weekly-rituals',
      data: {
        what: 'Masa Shivaratri',
        tamil: 'மாத சிவராத்திரி',
        often: 'monthly',
        on: 'Chaturdashi',
        about: 'The monthly Shivaratri, among the panchaparvam days.',
        temples: [chetty],
        observances: link ? [link.id] : [],
      },
      ...quiet,
    })
  }

  const docs = await all()
  for (const d of docs) {
    if (!PANCHA_PARUVA.includes(d.what) || d.partOf) continue
    if (![...ids].some((id) => atTemple(d, id))) continue
    await payload.update({
      collection: 'weekly-rituals',
      id: d.id,
      data: { partOf: 'Pancha Paruva Utsavam', partOfTamil: 'பஞ்ச பருவ உற்சவம்' },
      ...quiet,
    })
  }
}
