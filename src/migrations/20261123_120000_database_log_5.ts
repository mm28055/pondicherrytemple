import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import log from './data/database-log-2026-11-23.json'
import { richText } from './20261031_120500_database_log_2'
import { withBreaks } from './20261118_120000_database_log_4'

/* The Database Log's entries of 18 to 22 November 2026 (the update of 23
   November; data/database-log-2026-11-23.json): the end of Kanda Sashti at
   Lawspet, Ghousiga and Vedapuriswara, Kannika Parameswari's Aandu Vizha,
   and Vedapuriswara's first Karthikai Somavaram, tagged Karthikai Masam.
   - its eight field notes, in the site's spellings;
   - the calendar: each note's occasion at each of its temples;
   - the photo sets of those days, made here (their photographs are
     uploaded after), each beside its note.
   Only what is not there already, so it can run again. */

type Log = typeof log
const noonIST = (day: string) => `${day}T06:30:00.000Z`

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await databaseLog5Data({ db, payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // what was added is kept: it may have been edited since
}

// the photo sets of those days: folder, title, the note each goes beside
const SETS: { folder: string; title: string; date: string; note: string; temple: string }[] = [
  {
    folder: 'Siva Subramaniaswamy_Lawspet_Pondicherry/2026-11-18_Skanda Sashti Day 9_Unjal Utsavam',
    title: 'Kanda Sashti Day 9, Unjal Utsavam',
    date: '2026-11-18',
    note: '2026-11-18-kanda-sashti-vizha-day-9',
    temple: 'siva-subramania-lawspet',
  },
  {
    folder: 'Ghousiga Balasubramania Swamy_Pondicherry/2026-11-18_Skanda Sashti Day 9_pm Ravaneswara Vahana',
    title: 'Kanda Sashti Day 9, PM Ravaneswara Vahana',
    date: '2026-11-18',
    note: '2026-11-18-wait-not-such-lonely-trails-after-all',
    temple: 'ghousika-balasubramaniar',
  },
  {
    folder: 'Ghousiga Balasubramania Swamy_Pondicherry/2026-11-19_Skanda Sashti Day 10_Dhvajavarohanam and Kadal Theerthavari',
    title: 'Kanda Sashti Day 10, Dhvajavarohanam and Kadal Theerthavari',
    date: '2026-11-19',
    note: '2026-11-19-sashti-by-the-sea',
    temple: 'ghousika-balasubramaniar',
  },
  {
    folder: 'Vācavi Kannika Paramecuvarī_Pondicherry/2026-11-20 Aandu Vizha Day 1 Preparatory',
    title: 'Aandu Vizha Day 1, Preparatory',
    date: '2026-11-20',
    note: '2026-11-20-preparation-for-tomorrows-celebrations',
    temple: 'kanniga-parameswari',
  },
  {
    folder: 'Ghousiga Balasubramania Swamy_Pondicherry/2026-11-20_Skanda Sashti Day 11_Theppotsavam',
    title: 'Kanda Sashti Day 11, Theppotsavam',
    date: '2026-11-20',
    note: '2026-11-20-afloat-on-sivas-waters',
    temple: 'ghousika-balasubramaniar',
  },
  {
    folder: 'Vedapuriswara_Pondicherry/2026-11-20 Kanda Sashti Day 11',
    title: 'Kanda Sashti Day 11',
    date: '2026-11-20',
    note: '2026-11-20-closing-of-the-vedapuriswaras-kanda-sashti-vizha',
    temple: 'vedapuriswara',
  },
  {
    folder: 'Vācavi Kannika Paramecuvarī_Pondicherry/2026-11-21_Andu Vizha Day 2',
    title: 'Aandu Vizha Day 2',
    date: '2026-11-21',
    note: '2026-11-21-homams-taller-and-broader',
    temple: 'kanniga-parameswari',
  },
  {
    folder: 'Vedapuriswara_Pondicherry/2026-11-22_PM_Sunday Homam Karthikai Somavaram 1',
    title: 'PM Sunday Homam, Karthikai Somavaram 1',
    date: '2026-11-22',
    note: '2026-11-22-preparations-for-karthikai-somavaram-shankhabhishekam',
    temple: 'vedapuriswara',
  },
]

export async function databaseLog5Data({ payload, req }: Pick<MigrateUpArgs, 'db' | 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const data = log as Log
  const idOf = (r: any): number | undefined => (r == null ? undefined : typeof r === 'object' ? r.id : r)
  const one = async (collection: string, slug: string) =>
    (await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, draft: true, ...quiet } as any)).docs[0] as any
  const setByFolder = async (folder: string) => {
    for (const f of new Set([folder.normalize('NFC'), folder.normalize('NFD'), folder])) {
      const s = (await payload.find({ collection: 'photo-sets', where: { folder: { equals: f } }, limit: 1, joins: false, ...quiet } as any)).docs[0] as any
      if (s) return s
    }
    return undefined
  }
  const town = await one('regions', 'pondicherry')
  const around = await one('regions', 'in-and-around-pondicherry')
  if (!town || !around) return

  const observanceId = new Map<string, number>()
  for (const o of (await payload.find({ collection: 'observances', limit: 0, pagination: false, draft: true, ...quiet } as any)).docs as any[])
    observanceId.set(o.slug, o.id)
  const templeId = new Map<string, number>()
  const templeRegion = new Map<string, number>()
  for (const t of (await payload.find({ collection: 'temples', limit: 0, pagination: false, draft: true, ...quiet } as any)).docs as any[]) {
    templeId.set(t.slug, t.id)
    templeRegion.set(t.slug, idOf(t.region)!)
  }
  const ids = (slugs: string[], map: Map<string, number>, what: string) =>
    slugs.map((s) => {
      const id = map.get(s)
      if (id === undefined) throw new Error(`No ${what} "${s}"`)
      return id
    })
  const regionOf = (temples: string[]) =>
    temples.length && temples.every((t) => templeRegion.get(t) === around.id) ? around.id : town.id

  // 1. the field notes
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
        body: withBreaks(richText(n.body as any)) as never,
        slug: n.slug,
        region: regionOf(n.temples),
        _status: 'published',
      },
      draft: false,
      ...quiet,
    } as any)
    noteId.set(n.slug, doc.id)
  }

  // 2. the calendar: the note's occasion at each of its temples
  for (const n of data.notes) {
    const fieldNote = noteId.get(n.slug)!
    const tags = ids(n.observances, observanceId, 'festival or ritual')
    for (const temple of ids(n.temples, templeId, 'temple')) {
      const that = (
        await payload.find({
          collection: 'occasions',
          where: { and: [{ date: { equals: noonIST(n.date) } }, { temple: { equals: temple } }] },
          limit: 0,
          pagination: false,
          ...quiet,
        } as any)
      ).docs as any[]
      const day = that.find((o) => o.label === n.occasion)
      if (!day) {
        await payload.create({
          collection: 'occasions',
          data: { date: noonIST(n.date), temple, label: n.occasion, observances: tags, fieldNote },
          ...quiet,
        } as any)
        continue
      }
      const had = ((day.observances ?? []) as any[]).map(idOf) as number[]
      const observances = [...new Set([...had, ...tags])]
      if (idOf(day.fieldNote) !== fieldNote || observances.length !== had.length)
        await payload.update({ collection: 'occasions', id: day.id, data: { observances, fieldNote }, ...quiet } as any)
    }
  }

  // 3. the photo sets, beside their notes
  for (const s of SETS) {
    const fieldNote = noteId.get(s.note)
    const set = await setByFolder(s.folder)
    if (!set)
      await payload.create({
        collection: 'photo-sets',
        data: {
          title: s.title,
          date: noonIST(s.date),
          folder: s.folder.normalize('NFC'),
          temples: [templeId.get(s.temple)!],
          region: templeRegion.get(s.temple) ?? town.id,
          ...(fieldNote ? { fieldNote } : {}),
        },
        ...quiet,
      } as any)
    else if (fieldNote && idOf(set.fieldNote) !== fieldNote)
      await payload.update({ collection: 'photo-sets', id: set.id, data: { fieldNote }, ...quiet } as any)
  }

  payload.logger.info(`Database Log, 18 to 22 November: ${data.notes.length} field notes, ${SETS.length} photo sets`)
}
