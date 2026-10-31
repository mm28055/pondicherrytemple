import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await firstFridayData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // kept: nothing to undo
}

/* Kannika Parameswari's Gopuja and Mahalakshmi Puja comes on the first Friday
   of the Tamil month alone: once a month, not every week. Its section moved
   from "Fridays" (the Ritual Week) to an entry of its own, "First Friday",
   every month (the Ritual Month), as it was, its words, times and festivals.
   Runs once: its section is moved only while still under Fridays.
   With it, Lawspet Murugan's "Rahu Kala Durga Abhishekam" taken out of
   Tuesdays and Thursdays: on Tuesday it repeated the Rahu Kala Durga Puja,
   and on Thursday it was not done (31 October 2026); and its Friday Durga
   puja without Tuesday's words ("annadanam for some four hundred people"). */
const NAME = 'Gopuja and Mahalakshmi Puja'

export async function firstFridayData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const kannika = (await payload.find({ collection: 'temples', where: { slug: { equals: 'kanniga-parameswari' } }, limit: 1, draft: true, ...quiet } as any)).docs[0] as any
  if (!kannika) return
  const idOf = (v: any) => (typeof v === 'object' && v ? v.id : v)

  // Lawspet's Durga abhishekam, out of Tuesdays and Thursdays
  const lawspet = (await payload.find({ collection: 'temples', where: { slug: { equals: 'siva-subramania-lawspet' } }, limit: 1, draft: true, ...quiet } as any)).docs[0] as any
  if (lawspet)
    for (const day of ['tue', 'thu']) {
      const r = (await payload.find({ collection: 'weekly-rituals', where: { and: [{ often: { equals: 'weekly' } }, { weekday: { equals: day } }] }, limit: 1, ...quiet })).docs[0] as any
      const keep = (r?.atTemples ?? []).filter((a: any) => !(idOf(a.temple) === lawspet.id && a.name === 'Rahu Kala Durga Abhishekam'))
      if (r && keep.length !== r.atTemples.length) await payload.update({ collection: 'weekly-rituals', id: r.id, data: { atTemples: keep }, ...quiet })
    }
  // and its Friday Durga puja without the words of Tuesday's (the annadanam is Tuesday's)
  const fri = lawspet && ((await payload.find({ collection: 'weekly-rituals', where: { and: [{ often: { equals: 'weekly' } }, { weekday: { equals: 'fri' } }] }, limit: 1, ...quiet })).docs[0] as any)
  const TUESDAY_WORDS = 'Durga puja in Rahu kalam; annadanam for some four hundred people.'
  if (fri && fri.atTemples.some((a: any) => idOf(a.temple) === lawspet.id && a.about === TUESDAY_WORDS))
    await payload.update({
      collection: 'weekly-rituals',
      id: fri.id,
      data: { atTemples: fri.atTemples.map((a: any) => (idOf(a.temple) === lawspet.id && a.about === TUESDAY_WORDS ? { ...a, about: null } : a)) },
      ...quiet,
    })

  const fridays = (await payload.find({ collection: 'weekly-rituals', where: { and: [{ often: { equals: 'weekly' } }, { weekday: { equals: 'fri' } }] }, limit: 1, ...quiet })).docs[0] as any
  const row = fridays?.atTemples?.find((a: any) => idOf(a.temple) === kannika.id && a.name === NAME)
  if (!fridays || !row) return

  const { id: _row, ...section } = row
  const moved = {
    ...section,
    temple: kannika.id,
    observances: (row.observances ?? []).map(idOf),
    times: (row.times ?? []).map(({ id: _t, ...t }: any) => ({ ...t, on: 'the first Friday of the Tamil month', time: '6 am, then 6 pm' })),
  }
  const first = (await payload.find({ collection: 'weekly-rituals', where: { and: [{ often: { equals: 'monthly' } }, { what: { equals: 'First Friday' } }] }, limit: 1, ...quiet })).docs[0] as any
  if (first) {
    if (!(first.atTemples ?? []).some((a: any) => idOf(a.temple) === kannika.id && a.name === NAME))
      await payload.update({ collection: 'weekly-rituals', id: first.id, data: { atTemples: [...first.atTemples, moved] }, ...quiet })
  } else {
    await payload.create({
      collection: 'weekly-rituals',
      data: { what: 'First Friday', tamil: 'முதல் வெள்ளி', often: 'monthly', atTemples: [moved] },
      ...quiet,
    } as any)
  }
  await payload.update({
    collection: 'weekly-rituals',
    id: fridays.id,
    data: { atTemples: fridays.atTemples.filter((a: any) => a.id !== row.id) },
    ...quiet,
  })
}
