import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import ARRANGED from './data/thiruvahindrapuram-sets.json'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await thiruvahindrapuramSetsData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the sets are kept: their photos may have been moved into them since
}

/* The day at Thiruvahindrapuram (22 September 2026: Rathnangi Sevai, the
   Desikar Utsavam's conclusion), many photographs, in the parts of what
   happened that day: its one set named for the first part, and a set for
   each of the others, each like the first, of its day and temple, all
   numbered in the order given here ("Place in its day"); its
   photos put in them as they were sorted in the admin's photo grid on this
   computer (data/thiruvahindrapuram-sets.json: each set's photos by file
   name, and their places where they were put in order). Sets matched by
   folder (the new ones by the first's and the part's name), photos by file
   name, so this runs once. */
const FOLDER = 'other/Thiruvahindrapuram'
const FIRST = 'Purappadu and Up To Hayagrivar'
const PARTS = ['Mangalasasanam', 'Veethi Purappadu', 'Surroundings']

export async function thiruvahindrapuramSetsData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const find = async (folder: string) =>
    (await payload.find({ collection: 'photo-sets', where: { folder: { equals: folder } }, limit: 1, joins: false, ...quiet })).docs[0]
  const set = await find(FOLDER)
  if (!set) return
  if (set.title !== FIRST || set.dayOrder !== 1)
    await payload.update({ collection: 'photo-sets', id: set.id, data: { title: FIRST, short: null, dayOrder: 1 }, ...quiet })
  for (const [i, part] of PARTS.entries()) {
    const folder = `${FOLDER} (${part})`
    const had = await find(folder)
    if (had) {
      if (had.dayOrder !== i + 2) await payload.update({ collection: 'photo-sets', id: had.id, data: { dayOrder: i + 2 }, ...quiet })
      continue
    }
    await payload.create({
      collection: 'photo-sets',
      data: {
        title: part,
        dayOrder: i + 2,
        date: set.date,
        temples: set.temples,
        observances: set.observances,
        ethos: set.ethos,
        fieldNote: set.fieldNote,
        region: set.region,
        folder,
      },
      ...quiet,
    })
  }
  // each photo into its set, in its place there
  let moved = 0
  for (const [folder, photos] of Object.entries(ARRANGED as unknown as Record<string, [string, number | null][]>)) {
    const target = await find(folder)
    if (!target) continue
    for (const [filename, position] of photos) {
      const [m] = (await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1, select: { set: true, position: true }, ...quiet })).docs
      if (!m || (m.set === target.id && (m.position ?? null) === position)) continue
      await payload.update({ collection: 'media', id: m.id, data: { set: target.id, position }, ...quiet })
      moved++
    }
  }
  payload.logger.info(`Thiruvahindrapuram: "${FIRST}", and ${PARTS.join(', ')}; ${moved} photos put in their sets`)
}
