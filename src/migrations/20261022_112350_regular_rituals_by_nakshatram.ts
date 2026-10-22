import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await regularRitualsByNakshatramData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the nakshatram entries are kept: nothing to undo
}

const idOf = (v: unknown) => (typeof v === 'object' && v ? (v as { id: number }).id : (v as number))
const clean = (v: string | null | undefined) => (v ?? '').trim() || undefined

/* The monthly rituals on a nakshatram, an entry for the nakshatram, with a
   section for each temple and what it does that day (as made on this
   laptop): Thiruvonam (Chetty Koil's Perumal Thirumanjanam, Varadaraja
   Perumal's Desikar Thirumanjanam), Punarpoosam (the Ramar Janma Nakshatram
   at Varadaraja Perumal and at Kannika Parameswari), Poosam (Kannika
   Parameswari's Kubera Yantra Abhishekam), Pooram (its Ambal Abhishekam).
   Each section keeps its ritual's name, Tamil, words, times, to be
   confirmed, and the festivals and rituals it was linked to; the entries
   they came from are removed. Only what is there: run again, it changes
   nothing. Exported for this computer's copy of the database (scripts). */
const NAKSHATRAMS: { what: string; tamil: string; from: string[] }[] = [
  { what: 'Thiruvonam', tamil: 'திருவோணம்', from: ['Perumal Thirumanjanam', 'Desikar Thirumanjanam'] },
  { what: 'Punarpoosam', tamil: 'புனர்பூசம்', from: ['Ramar Janma Nakshatram'] },
  { what: 'Poosam', tamil: 'பூசம்', from: ['Kubera Yantra Abhishekam'] },
  { what: 'Pooram', tamil: 'பூரம்', from: ['Ambal Abhishekam'] },
]
export async function regularRitualsByNakshatramData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, context: { skipRevalidate: true } } as const
  const all = (await payload.find({ collection: 'weekly-rituals', limit: 1000, depth: 0, pagination: false, ...quiet })).docs
  for (const n of NAKSHATRAMS) {
    const sources = all.filter((d) => d.often !== 'weekly' && n.from.includes(d.what.trim()))
    if (!sources.length) continue
    const sections = sources.flatMap((r) =>
      (r.atTemples ?? []).map((at) => {
        const { id: _id, ...rest } = at
        return {
          ...rest,
          temple: idOf(at.temple),
          name: clean(at.name) ?? r.what.trim(),
          tamil: clean(at.tamil) ?? clean(r.tamil),
          about: clean(at.about) ?? clean(r.about),
          observances: (at.observances?.length ? at.observances : (r.observances ?? [])).map(idOf),
          times: (at.times ?? []).map(({ id: _t, ...t }) => t),
        }
      }),
    )
    const had = all.find((d) => d.what.trim() === n.what && d.often !== 'weekly')
    if (had) {
      const atTemples = [...(had.atTemples ?? []).map((a) => ({ ...a, temple: idOf(a.temple) })), ...sections]
      await payload.update({ collection: 'weekly-rituals', id: had.id, data: { atTemples }, ...quiet })
    } else {
      await payload.create({ collection: 'weekly-rituals', data: { what: n.what, tamil: n.tamil, often: sources[0].often ?? 'monthly', atTemples: sections }, ...quiet })
    }
    for (const r of sources) await payload.delete({ collection: 'weekly-rituals', id: r.id, ...quiet })
  }
}
