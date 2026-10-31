import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await alaguSevaiData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // kept: nothing to undo
}

/* The Alagu Sevai listed in a temple's Ritual Year again, once a year (it was
   taken for a rite within other events, 20261031_140000, and Lawspet
   Murugan's 28 August then counted as Aadi Masam alone); and below its name
   there, in italics, what it is part of: "as part of the Veerabhadraswamy
   Chowdambika Koyil's Aadi Peruvizha". */
const NOTE = 'as part of the Veerabhadraswamy Chowdambika Koyil’s Aadi Peruvizha'

export async function alaguSevaiData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const bySlug = async (collection: 'observances' | 'temples', slug: string) =>
    (await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, draft: true, ...quiet } as any)).docs[0] as any
  const alagu = await bySlug('observances', 'alagu-sevai')
  if (alagu && alagu.recurs !== 'yearly') await payload.update({ collection: 'observances', id: alagu.id, data: { recurs: 'yearly' }, draft: false, ...quiet } as any)
  const lawspet = await bySlug('temples', 'siva-subramania-lawspet')
  if (!lawspet) return
  for (const o of (await payload.find({ collection: 'occasions', where: { and: [{ date: { equals: '2026-08-28T06:30:00.000Z' } }, { temple: { equals: lawspet.id } }] }, limit: 5, ...quiet })).docs as any[])
    if (o.yearNote !== NOTE) await payload.update({ collection: 'occasions', id: o.id, data: { yearNote: NOTE }, ...quiet })
}
