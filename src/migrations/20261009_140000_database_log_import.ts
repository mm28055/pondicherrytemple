import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { toLexical } from '../seed/lexical'
import log from './data/database-log-2026-06-14.json'

/* The Database Log, 3 March to 14 June 2026, put on the site once: the
   calendar dates and field notes made before it are cleared, the temples'
   names put right ("Koyil"), the temples in and around Pondicherry it
   mentions added, its festivals and rituals named as in the log (each new
   one a blank page, hidden until published), and then its field notes and
   calendar dates. It runs once, on the deploy after it is pushed (and on this
   computer the first time the site starts); never again, so nothing changed
   in the admin afterwards is touched. The data, reviewed line by line with
   the team, is in data/database-log-2026-06-14.json. */

type Log = typeof log
const noonIST = (isoDate: string) => `${isoDate}T06:30:00.000Z`

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const options = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const data = log as Log

  // 1. A clean slate: the calendar dates and field notes made before the log
  await payload.delete({ collection: 'occasions', where: { id: { exists: true } }, ...options })
  await payload.delete({ collection: 'field-notes', where: { id: { exists: true } }, ...options })

  // 2. The temples
  const regions = await payload.find({ collection: 'regions', limit: 10, ...options })
  const town = regions.docs.find((r) => r.slug === 'pondicherry')
  const around = regions.docs.find((r) => r.slug === 'in-and-around-pondicherry')
  if (!town || !around) throw new Error('The regions Pondicherry and In and around Pondicherry are needed')

  const temples = await payload.find({ collection: 'temples', limit: 500, draft: true, ...options })
  for (const t of temples.docs) {
    const fix = data.templeUpdates.find((u) => u.slug === t.slug)
    const name = fix?.name ?? t.name.replace(/\bKoil\b/g, 'Koyil')
    const knownAs = fix?.knownAs ?? t.knownAs?.replace(/\bKoil\b/g, 'Koyil')
    if (name !== t.name || knownAs !== t.knownAs) {
      await payload.update({ collection: 'temples', id: t.id, data: { name, knownAs, _status: 'published' }, ...options })
    }
  }
  for (const t of data.newTemples) {
    if (temples.docs.some((x) => x.slug === t.slug)) continue
    await payload.create({
      collection: 'temples',
      data: {
        name: t.name,
        deity: t.deity,
        deityGroup: t.deityGroup as 'shiva' | 'vishnu' | 'amman' | 'vinayaka' | 'murugan',
        slug: t.slug,
        region: around.id,
        _status: 'published',
      },
      ...options,
    })
  }
  const templeId = new Map(
    (await payload.find({ collection: 'temples', limit: 500, ...options })).docs.map((t) => [t.slug, t.id])
  )

  // 3. The festivals and rituals: those on the site renamed as in the log, the rest new
  const existing = await payload.find({ collection: 'observances', limit: 500, draft: true, ...options })
  for (const o of data.observances) {
    const doc = existing.docs.find((x) => x.slug === (o.was ?? o.slug) || x.slug === o.slug)
    if (doc) {
      await payload.update({
        collection: 'observances',
        id: doc.id,
        data: { name: o.name, kind: o.kind as 'festival' | 'ritual', slug: o.slug, ...(o.tamil ? { tamil: o.tamil } : {}) },
        ...options,
      })
    } else {
      await payload.create({
        collection: 'observances',
        data: { name: o.name, kind: o.kind as 'festival' | 'ritual', tamil: o.tamil, gloss: 'To be written', slug: o.slug, _status: 'published' },
        ...options,
      })
    }
  }
  const observanceId = new Map(
    (await payload.find({ collection: 'observances', limit: 500, ...options })).docs.map((o) => [o.slug, o.id])
  )

  const ids = (slugs: (string | null)[], map: Map<string | null | undefined, number>, what: string) =>
    slugs.map((s) => {
      const id = map.get(s)
      if (id === undefined) throw new Error(`No ${what} "${s}"`)
      return id
    })

  // 4. The field notes
  const noteId = new Map<string, number>()
  for (const n of data.notes) {
    const doc = await payload.create({
      collection: 'field-notes',
      data: {
        title: n.title,
        date: noonIST(n.date),
        occasion: n.occasion,
        temples: ids(n.temples, templeId, 'temple'),
        observances: ids(n.observances, observanceId, 'festival or ritual'),
        body: toLexical(n.body) as never,
        slug: n.slug,
        region: n.around ? around.id : town.id,
        _status: 'published',
      },
      ...options,
    })
    noteId.set(n.slug, doc.id)
  }

  // 5. The calendar
  for (const o of data.occasions) {
    await payload.create({
      collection: 'occasions',
      data: {
        date: noonIST(o.date),
        temple: o.temple ? ids([o.temple], templeId, 'temple')[0] : undefined,
        label: o.label,
        tbc: o.tbc,
        observances: ids(o.observances, observanceId, 'festival or ritual'),
        fieldNote: o.note ? noteId.get(o.note) : undefined,
        region: town.id,
      },
      ...options,
    })
  }

  payload.logger.info(
    `Database Log imported: ${data.notes.length} field notes, ${data.occasions.length} calendar dates, ${data.observances.length} festivals and rituals`
  )
}

// What was cleared cannot be put back; to undo, restore a backup of the database.
export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.warn('The Database Log import cannot be undone by a migration: restore a backup instead.')
}
