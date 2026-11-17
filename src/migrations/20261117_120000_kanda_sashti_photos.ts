import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import data from './data/kanda-sashti-photos-2026-11-17.json'

/* The photographs of 9 to 16 November 2026, before their field notes
   (data/kanda-sashti-photos-2026-11-17.json), with tentative names to be put
   right when the notes come:
   - three festivals and rituals named for the first time (Kanda Sashti, also
     Skanda Sashti; Rahu Ketu Peyarchi; Vishwaksena Jayanti), each a page with
     its name only until it is written;
   - a calendar date for each temple and day (Kanda Sashti Day 1 to Day 7 at
     six temples, Rahu Ketu Peyarchi, the Manavala Mamunigal Utsavam's
     concluding Yethir Sevai, Vishwaksena Jayanti), whose festivals tag that
     day's photographs there;
   - the twenty-seven photo sets of those days (their photographs uploaded
     after, found by folder: scripts/import-photos.ts);
   - the 4 November Manavala Mamunigal set pointed at its renamed folder.
   Only what is not there already, so it can run again. */

const noonIST = (day: string) => `${day}T06:30:00.000Z`

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await kandaSashtiPhotosData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // what was added is kept: it may have been edited since, and photographs are in the sets
}

export async function kandaSashtiPhotosData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const all = async (collection: 'temples' | 'observances') =>
    (await payload.find({ collection, limit: 0, pagination: false, draft: true, ...quiet } as any)).docs as any[]
  const setByFolder = async (folder: string) => {
    for (const f of new Set([folder.normalize('NFC'), folder.normalize('NFD'), folder])) {
      const s = (await payload.find({ collection: 'photo-sets', where: { folder: { equals: f } }, limit: 1, joins: false, ...quiet } as any)).docs[0] as any
      if (s) return s
    }
    return undefined
  }

  // 1. the new festivals and rituals
  const had = new Set((await all('observances')).map((o) => o.slug))
  for (const o of data.observances as any[]) {
    if (had.has(o.slug)) continue
    await payload.create({
      collection: 'observances',
      data: { ...o, gloss: 'To be written', recurs: 'yearly', _status: 'published' },
      draft: false,
      ...quiet,
    } as any)
  }
  const observanceId = new Map((await all('observances')).map((o) => [o.slug, o.id]))
  const templeId = new Map<string, number>()
  const templeRegion = new Map<string, number>()
  for (const t of await all('temples')) {
    templeId.set(t.slug, t.id)
    templeRegion.set(t.slug, typeof t.region === 'object' ? t.region?.id : t.region)
  }
  const ids = (slugs: string[], map: Map<string, number>, what: string) =>
    slugs.map((s) => {
      const id = map.get(s)
      if (id === undefined) throw new Error(`No ${what} "${s}"`)
      return id
    })

  // 2. the renamed folder
  for (const r of data.renamedFolders) {
    if (await setByFolder(r.to)) continue
    const set = await setByFolder(r.from)
    if (set) await payload.update({ collection: 'photo-sets', id: set.id, data: { folder: r.to.normalize('NFC') }, ...quiet } as any)
  }

  // 3. the calendar
  let occasions = 0
  for (const o of data.occasions) {
    const temple = ids([o.temple], templeId, 'temple')[0]
    const there = await payload.find({
      collection: 'occasions',
      where: { and: [{ date: { equals: noonIST(o.date) } }, { label: { equals: o.label } }, { temple: { equals: temple } }] },
      limit: 1,
      ...quiet,
    })
    if (there.docs.length) continue
    await payload.create({
      collection: 'occasions',
      data: {
        date: noonIST(o.date),
        temple,
        label: o.label,
        observances: ids(o.observances, observanceId as Map<string, number>, 'festival or ritual'),
        region: templeRegion.get(o.temple),
      },
      ...quiet,
    } as any)
    occasions++
  }

  // 4. the photo sets, found by folder as the photographs' upload finds them
  let sets = 0
  for (const s of data.sets) {
    if (await setByFolder(s.folder)) continue
    await payload.create({
      collection: 'photo-sets',
      data: {
        title: s.title,
        date: noonIST(s.date),
        folder: s.folder.normalize('NFC'),
        temples: ids(s.temples, templeId, 'temple'),
        region: templeRegion.get(s.temples[0]),
      },
      ...quiet,
    } as any)
    sets++
  }

  payload.logger.info(`Kanda Sashti photos: ${occasions} calendar dates, ${sets} photo sets added`)
}
