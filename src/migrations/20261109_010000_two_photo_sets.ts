import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await twoPhotoSetsData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the sets are left: their photographs are in them
}

/* The photo sets of two field notes that had none (9 November 2026): Chetty
   Koyil's Annabhishekam of 25 October and the Naga Mutthu Amman Koyil's
   Navaratri Vizha of 26 October. Each made where it is not yet (found by its
   folder, as the photographs' upload finds it), in its temple's region; one
   already there is only given that region. Their photographs are uploaded
   after (scripts/import-photos.ts, scripts/push-photos-live.ts). */

const SETS = [
  {
    folder: 'Kāḻattīsvarar Chetty Koyil_Pondicherry/2026-10-25_Annabhishekam',
    title: 'Annabhishekam',
    day: '2026-10-25',
    temple: 'chetty-koil',
  },
  {
    folder: 'other/2026-10-26_Nagamutthu Amman Theruvu Koyil_Navaratri Vizha',
    title: 'Navaratri Vizha, Day 16',
    day: '2026-10-26',
    temple: 'naga-mutthu-amman',
  },
]

export async function twoPhotoSetsData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>) {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  for (const s of SETS) {
    const folder = s.folder.normalize('NFC')
    const temple = (await payload.find({ collection: 'temples', where: { slug: { equals: s.temple } }, limit: 1, draft: true, ...quiet } as any)).docs[0] as any
    if (!temple) {
      payload.logger.warn(`two photo sets: no temple ${s.temple}`)
      continue
    }
    const region = typeof temple.region === 'object' ? temple.region?.id : temple.region
    const set = (await payload.find({ collection: 'photo-sets', where: { folder: { equals: folder } }, limit: 1, joins: false, ...quiet } as any)).docs[0] as any
    if (!set) {
      await payload.create({
        collection: 'photo-sets',
        data: { title: s.title, date: `${s.day}T06:30:00.000Z`, folder, temples: [temple.id], region },
        ...quiet,
      } as any)
      payload.logger.info(`two photo sets: ${s.title} (${s.day}) made`)
    } else if ((typeof set.region === 'object' ? set.region?.id : set.region) !== region) {
      await payload.update({ collection: 'photo-sets', id: set.id, data: { region }, ...quiet } as any)
      payload.logger.info(`two photo sets: ${s.title} (${s.day}) given its temple's region`)
    }
  }
}
