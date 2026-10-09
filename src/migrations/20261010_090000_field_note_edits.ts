import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import edits from './data/field-note-edits-2026-10-10.json'

/* The field notes edited on the team's computer (localhost) on 9 and 10
   October 2026, carried to the live site once: their titles, occasions,
   tags and text, and five new web addresses. Each live note is found by its
   web address as it was; one changed on the live site since (its last-saved
   time differs from the one recorded) is left alone, and named in the log.
   Notes saved there only as drafts become drafts here, their published
   version left as it is. Also Vedapuriswara Koyil's introduction. The data
   is in data/field-note-edits-2026-10-10.json. */

type Edit = {
  liveSlug: string
  liveUpdatedAt: string
  draft: boolean
  slug?: string
  title?: string
  date?: string
  occasion?: string
  authors?: string[]
  temples?: string[]
  observances?: string[]
  body?: unknown
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const options = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const data = edits as unknown as { edits: Edit[]; templeIntros: { slug: string; intro: unknown }[] }

  const temples = await payload.find({ collection: 'temples', limit: 1000, ...options })
  const templeId = new Map(temples.docs.map((t) => [t.slug, t.id]))
  const observances = await payload.find({ collection: 'observances', limit: 1000, ...options })
  const observanceId = new Map(observances.docs.map((o) => [o.slug, o.id]))
  const ids = (slugs: string[], map: Map<string | null | undefined, number>) =>
    slugs.flatMap((s) => (map.has(s) ? [map.get(s)!] : []))

  let done = 0
  const skipped: string[] = []
  for (const e of data.edits) {
    const found = await payload.find({
      collection: 'field-notes',
      where: { slug: { equals: e.liveSlug } },
      limit: 1,
      ...options,
    })
    const doc = found.docs[0]
    if (!doc) {
      skipped.push(`${e.liveSlug} (not found)`)
      continue
    }
    if (doc.updatedAt !== e.liveUpdatedAt) {
      skipped.push(`${e.liveSlug} (changed on the live site since)`)
      continue
    }
    const fields: Record<string, unknown> = {}
    if (e.title !== undefined) fields.title = e.title
    if (e.date !== undefined) fields.date = e.date
    if (e.occasion !== undefined) fields.occasion = e.occasion
    if (e.authors !== undefined) fields.authors = e.authors
    if (e.temples !== undefined) fields.temples = ids(e.temples, templeId)
    if (e.observances !== undefined) fields.observances = ids(e.observances, observanceId)
    if (e.body !== undefined) fields.body = e.body
    if (e.slug !== undefined) fields.slug = e.slug
    await payload.update({
      collection: 'field-notes',
      id: doc.id,
      data: e.draft ? fields : { ...fields, _status: 'published' },
      draft: e.draft,
      ...options,
    })
    done++
  }

  for (const t of data.templeIntros) {
    const id = templeId.get(t.slug)
    if (id === undefined) continue
    await payload.update({
      collection: 'temples',
      id,
      data: { intro: t.intro as never, _status: 'published' },
      ...options,
    })
  }

  payload.logger.info(`Field note edits carried over: ${done} of ${data.edits.length}`)
  if (skipped.length) payload.logger.warn(`Left alone: ${skipped.join('; ')}`)
}

// Nothing to undo by a migration: the notes can be edited in the admin.
export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.warn('The field note edits are not undone by a migration.')
}
