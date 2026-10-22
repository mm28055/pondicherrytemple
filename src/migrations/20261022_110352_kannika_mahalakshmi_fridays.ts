import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await kannikaMahalakshmiFridaysData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the section is kept: nothing to undo
}

const idOf = (v: unknown) => (typeof v === 'object' && v ? (v as { id: number }).id : (v as number))

/* Kannika Parameswari's Gopuja and Mahalakshmi Puja, on the first Friday of
   each Tamil month, a section of Fridays (as it was made on this laptop),
   with the festivals and rituals it was linked to; the monthly entry it was
   ("Mahalakshmi Puja", for Kannika Parameswari alone) removed. Only once:
   not where Fridays has it already. Exported for this computer's copy of
   the database (scripts). */
export async function kannikaMahalakshmiFridaysData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, context: { skipRevalidate: true } } as const
  const temple = (await payload.find({ collection: 'temples', where: { slug: { equals: 'kanniga-parameswari' } }, depth: 0, draft: true, ...quiet })).docs[0]
  const fridays = (await payload.find({ collection: 'weekly-rituals', where: { what: { equals: 'Fridays' } }, depth: 0, ...quiet })).docs[0]
  if (!temple || !fridays) return
  const name = 'Gopuja and Mahalakshmi Puja'
  if ((fridays.atTemples ?? []).some((a) => idOf(a.temple) === temple.id && a.name === name)) return
  const monthly = (await payload.find({ collection: 'weekly-rituals', where: { what: { equals: 'Mahalakshmi Puja' } }, depth: 0, ...quiet })).docs.find(
    (d) => d.often !== 'weekly' && (d.atTemples ?? []).length === 1 && idOf(d.atTemples?.[0]?.temple) === temple.id,
  )
  const links = [...(monthly?.atTemples?.[0]?.observances ?? []), ...(monthly?.observances ?? [])].map(idOf)
  await payload.update({
    collection: 'weekly-rituals',
    id: fridays.id,
    data: {
      atTemples: [
        ...(fridays.atTemples ?? []),
        {
          temple: temple.id,
          name,
          tamil: 'கோபூஜை, மகாலட்சுமி பூஜை',
          about: 'Gopuja at the door at dawn, in the evening the Mahalakshmi Puja with Lalitasahasranama recitation.',
          panchaParvam: false,
          tbc: false,
          observances: [...new Set(links)],
          times: [{ on: 'On first Friday of the Tamil month', time: '6am, then 6pm' }],
        },
      ],
    },
    ...quiet,
  })
  if (monthly) await payload.delete({ collection: 'weekly-rituals', id: monthly.id, ...quiet })
}
