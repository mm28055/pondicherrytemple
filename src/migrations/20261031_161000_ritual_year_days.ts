import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await ritualYearDaysData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // kept: nothing to undo
}

/* Days that stood in a temple's Ritual Year under their own names, tagged
   with their rites alone (31 October 2026): those part of a festival given
   its tag, their calendar dates and field notes, so they are counted in its
   entry; those not of the yearly round (a Balalayam, a day the Special
   Tithis already mark: Aavani Chaturdashi) left out of the Ritual Year,
   still in the calendar. */
type Day = { temple: string; date: string; label: string; tag?: string; leaveOut?: boolean }
const DAYS: Day[] = [
  { temple: 'varadaraja-perumal', date: '2026-08-23', label: 'Pavitrotsavam Day 1', tag: 'pavitrotsavam' },
  { temple: 'varadaraja-perumal', date: '2026-09-15', label: 'Shukla Panchami Perumal-Thayar Thirukalyanam', tag: 'desikar-utsavam' },
  { temple: 'varadaraja-perumal', date: '2026-09-27', label: 'Desikar Utsavam Vidaiyatri Day 5', tag: 'desikar-utsavam' },
  { temple: 'mutthumariamman', date: '2026-07-23', label: 'Aadi Thursday', tag: 'aadi-masam' },
  { temple: 'manakkula-vinayakar', date: '2026-07-04', label: 'Balalayam', leaveOut: true },
  { temple: 'manakkula-vinayakar', date: '2026-07-05', label: 'Balalayam', leaveOut: true },
  { temple: 'nandhikeswara', date: '2026-08-26', label: 'Aavani Chaturdashi', leaveOut: true },
  { temple: 'manimutthumariamman', date: '', label: 'Abhishekam and Annadanam', leaveOut: true },
]

export async function ritualYearDaysData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const bySlug = async (collection: 'observances' | 'temples', slug: string) =>
    (await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, draft: true, ...quiet } as any)).docs[0] as any
  const idOf = (v: any) => (typeof v === 'object' && v ? v.id : v)
  for (const d of DAYS) {
    const temple = await bySlug('temples', d.temple)
    if (!temple) continue
    const on = d.date ? [{ date: { greater_than_equal: `${d.date}T00:00:00.000Z` } }, { date: { less_than_equal: `${d.date}T23:59:59.000Z` } }] : []
    const tag = d.tag ? await bySlug('observances', d.tag) : null
    for (const o of (await payload.find({ collection: 'occasions', where: { and: [...on, { temple: { equals: temple.id } }, { label: { like: d.label } }] }, limit: 10, ...quiet })).docs as any[]) {
      const tags = (o.observances ?? []).map(idOf)
      const data: Record<string, unknown> = {}
      if (tag && !tags.includes(tag.id)) data.observances = [tag.id, ...tags]
      if (d.leaveOut && !o.notInYear) data.notInYear = true
      if (Object.keys(data).length) await payload.update({ collection: 'occasions', id: o.id, data, ...quiet })
    }
    if (!tag || !d.date) continue
    for (const n of (await payload.find({ collection: 'field-notes', where: { and: [...on, { temples: { in: [temple.id] } }, { occasion: { like: d.label } }] }, limit: 10, draft: true, ...quiet } as any)).docs as any[]) {
      const tags = (n.observances ?? []).map(idOf)
      if (!tags.includes(tag.id)) await payload.update({ collection: 'field-notes', id: n.id, data: { observances: [tag.id, ...tags] }, draft: false, ...quiet } as any)
    }
  }
}
