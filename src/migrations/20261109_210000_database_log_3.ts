import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import log from './data/database-log-2026-11-09.json'
import { richText } from './20261031_120500_database_log_2'

/* The third Database Log, its entries of 1 to 8 November 2026 (the entries
   under its 7 November heading that took place on Deepavali, 8 November, are
   dated that day; the Palani Andavar visit 4 November), as reviewed with the
   team on 9 November (data/database-log-2026-11-09.json):
   - three festivals and rituals it names for the first time (Manavala
     Mamunigal Utsavam, Kedara Gowri Nonbu, Dhana Akarshana Puja), each a
     page with only its name until it is written;
   - three temples, in and around Pondicherry: Thandu Mutthumariamman, and in
     Muthialpet the Palani Andavar Koyil and the Mutthalamman Koyil;
   - its eight field notes, in the site's spellings, with links to the notes
     they mention; a calendar date at each of a note's temples, and the
     utsavam's days 2 to 4, which have no note;
   - the sixteen photo sets of those days, each with its note where it has
     one (their photographs uploaded after, found by folder:
     scripts/import-photos.ts).
   Only what is not there already, so it can run again. */

type Log = typeof log
const noonIST = (day: string) => `${day}T06:30:00.000Z`

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await databaseLog3Data({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // what was added is kept: it may have been edited since
}

export async function databaseLog3Data({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const data = log as Log
  const one = async (collection: 'temples' | 'observances' | 'field-notes' | 'regions', slug: string) =>
    (await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, draft: true, ...quiet } as any)).docs[0] as any

  const town = await one('regions', 'pondicherry')
  const around = await one('regions', 'in-and-around-pondicherry')
  if (!town || !around) return

  // 1. the new festivals and rituals
  for (const o of data.observances) {
    if (await one('observances', o.slug)) continue
    await payload.create({
      collection: 'observances',
      data: { name: o.name, kind: o.kind as 'festival' | 'ritual', slug: o.slug, gloss: 'To be written', _status: 'published' },
      draft: false,
      ...quiet,
    } as any)
  }
  const observanceId = new Map<string, number>()
  for (const o of (await payload.find({ collection: 'observances', limit: 0, pagination: false, draft: true, ...quiet } as any)).docs as any[])
    observanceId.set(o.slug, o.id)

  // 2. the new temples
  for (const t of data.newTemples) {
    if (await one('temples', t.slug)) continue
    await payload.create({
      collection: 'temples',
      data: { ...t, deityGroup: t.deityGroup as 'amman', region: around.id, listed: true, _status: 'published' },
      draft: false,
      ...quiet,
    } as any)
  }
  const templeId = new Map<string, number>()
  const templeRegion = new Map<string, number>()
  for (const t of (await payload.find({ collection: 'temples', limit: 0, pagination: false, draft: true, ...quiet } as any)).docs as any[]) {
    templeId.set(t.slug, t.id)
    templeRegion.set(t.slug, typeof t.region === 'object' ? t.region?.id : t.region)
  }
  const ids = (slugs: string[], map: Map<string, number>, what: string) =>
    slugs.map((s) => {
      const id = map.get(s)
      if (id === undefined) throw new Error(`No ${what} "${s}"`)
      return id
    })
  const regionOf = (temples: string[]) =>
    temples.length && temples.every((t) => templeRegion.get(t) === around.id) ? around.id : town.id

  // 3. the field notes
  const noteId = new Map<string, number>()
  for (const n of data.notes) {
    const had = await one('field-notes', n.slug)
    if (had) {
      noteId.set(n.slug, had.id)
      continue
    }
    const doc = await payload.create({
      collection: 'field-notes',
      data: {
        title: n.title,
        date: noonIST(n.date),
        occasion: n.occasion,
        temples: ids(n.temples, templeId, 'temple'),
        observances: ids(n.observances, observanceId, 'festival or ritual'),
        body: richText(n.body as any) as never,
        slug: n.slug,
        region: regionOf(n.temples),
        _status: 'published',
      },
      draft: false,
      ...quiet,
    } as any)
    noteId.set(n.slug, doc.id)
  }

  // 4. the calendar
  for (const o of data.occasions as any[]) {
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
        observances: ids(o.observances, observanceId, 'festival or ritual'),
        fieldNote: o.note ? noteId.get(o.note) : undefined,
        region: templeRegion.get(o.temple) ?? town.id,
      },
      ...quiet,
    } as any)
  }

  // 5. the photo sets, found by folder as the photographs' upload finds them
  for (const s of data.sets as any[]) {
    const set = (await payload.find({ collection: 'photo-sets', where: { folder: { equals: s.folder } }, limit: 1, joins: false, ...quiet } as any)).docs[0] as any
    const fieldNote = s.note ? noteId.get(s.note) : undefined
    if (!set)
      await payload.create({
        collection: 'photo-sets',
        data: {
          title: s.title,
          date: noonIST(s.date),
          folder: s.folder,
          temples: ids(s.temples, templeId, 'temple'),
          ethos: !!s.ethos,
          region: regionOf(s.temples),
          ...(fieldNote ? { fieldNote } : {}),
        },
        ...quiet,
      } as any)
    else if (fieldNote && (typeof set.fieldNote === 'object' ? set.fieldNote?.id : set.fieldNote) !== fieldNote)
      await payload.update({ collection: 'photo-sets', id: set.id, data: { fieldNote }, ...quiet } as any)
  }

  payload.logger.info(`Database Log 3: ${data.notes.length} field notes, ${data.occasions.length} calendar dates, ${data.sets.length} photo sets`)
}
