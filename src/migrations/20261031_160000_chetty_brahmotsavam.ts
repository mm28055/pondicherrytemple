import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await chettyBrahmotsavamData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // kept: nothing to undo
}

/* Chetty Koyil's Perumal Brahmotsavam (20 June to 2 July 2026): its days,
   as the second Database Log tagged them, carried only their rites (a
   Dhvajarohanam, a Churnotsavam, an abhishekam), and so stood in the Ritual
   Year one by one under their own names; tagged Brahmotsavam, their
   calendar dates and field notes, they are counted in its one entry. And
   its Palliyarai Utsavam of 19 June spelled so (it read "Palliyarari"), and
   left out of the Ritual Year, still in the calendar. */
export async function chettyBrahmotsavamData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const bySlug = async (collection: 'observances' | 'temples', slug: string) =>
    (await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, draft: true, ...quiet } as any)).docs[0] as any
  const chetty = await bySlug('temples', 'chetty-koil')
  const brahmotsavam = await bySlug('observances', 'brahmotsavam')
  if (!chetty || !brahmotsavam) return
  const idOf = (v: any) => (typeof v === 'object' && v ? v.id : v)
  const between = { and: [{ date: { greater_than_equal: '2026-06-20T00:00:00.000Z' } }, { date: { less_than_equal: '2026-07-02T23:59:59.000Z' } }] }

  for (const o of (await payload.find({ collection: 'occasions', where: { and: [between, { temple: { equals: chetty.id } }, { label: { like: 'Perumal Brahmotsavam' } }] }, limit: 50, ...quiet })).docs as any[]) {
    const tags = (o.observances ?? []).map(idOf)
    if (!tags.includes(brahmotsavam.id)) await payload.update({ collection: 'occasions', id: o.id, data: { observances: [brahmotsavam.id, ...tags] }, ...quiet })
  }
  for (const n of (await payload.find({ collection: 'field-notes', where: { and: [between, { temples: { in: [chetty.id] } }, { occasion: { like: 'Perumal Brahmotsavam' } }] }, limit: 50, draft: true, ...quiet } as any)).docs as any[]) {
    const tags = (n.observances ?? []).map(idOf)
    if (!tags.includes(brahmotsavam.id)) await payload.update({ collection: 'field-notes', id: n.id, data: { observances: [brahmotsavam.id, ...tags] }, draft: false, ...quiet } as any)
  }

  // the Palliyarai Utsavam of 19 June
  const day = { and: [{ date: { greater_than_equal: '2026-06-19T00:00:00.000Z' } }, { date: { less_than_equal: '2026-06-19T23:59:59.000Z' } }] }
  for (const o of (await payload.find({ collection: 'occasions', where: { and: [day, { temple: { equals: chetty.id } }, { label: { like: 'Palliyar' } }] }, limit: 5, ...quiet })).docs as any[])
    if (o.label !== 'Palliyarai Utsavam' || !o.notInYear) await payload.update({ collection: 'occasions', id: o.id, data: { label: 'Palliyarai Utsavam', notInYear: true }, ...quiet })
  for (const n of (await payload.find({ collection: 'field-notes', where: { and: [day, { temples: { in: [chetty.id] } }, { occasion: { equals: 'Palliyarari Utsavam' } }] }, limit: 5, draft: true, ...quiet } as any)).docs as any[])
    await payload.update({ collection: 'field-notes', id: n.id, data: { occasion: 'Palliyarai Utsavam' }, draft: false, ...quiet } as any)
}
