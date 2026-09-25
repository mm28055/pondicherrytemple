import path from 'path'
import { getPayload, type Payload, type SanitizedConfig } from 'payload'
import { fileURLToPath } from 'url'

import { articles } from './data/articles'
import { books } from './data/book'
import { fieldNotes } from './data/fieldNotes'
import { illustrations } from './data/illustrations'
import { observances } from './data/observances'
import { occasions } from './data/occasions'
import { regions } from './data/regions'
import { templeEntries } from './data/templeEntries'
import { temples } from './data/temples'
import type { EditorialStatus } from './data/types'
import { toLexical } from './lexical'
import { seedPages } from './pages'

/* `npm run seed` — copies the site's original content (the files in
   ./data, written by hand before the admin existed) into an empty database,
   word for word. Everything is published, so the site looks as before; the
   authors' approval is carried over into each item's Review status.

   It refuses to run on a database that already has temples, so real work is
   never overwritten. */

const dirname = path.dirname(fileURLToPath(import.meta.url))

const options = { overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const

/** Dates are kept as noon in India, so they read as the same day everywhere. */
const noonIST = (isoDate: string) => `${isoDate}T06:30:00.000Z`

const review = (status?: EditorialStatus, note?: string) => ({
  status: status === 'approved' ? ('approved' as const) : ('awaiting' as const),
  note: note ?? null,
})

function idsOf(slugs: string[], map: Map<string, number>, what: string): number[] {
  return slugs.map((slug) => {
    const id = map.get(slug)
    if (id === undefined) throw new Error(`Unknown ${what}: ${slug}`)
    return id
  })
}

async function seed(payload: Payload) {
  const { totalDocs } = await payload.count({ collection: 'temples', overrideAccess: true })
  if (totalDocs > 0) {
    payload.logger.info('The database already has content, so nothing was imported.')
    return
  }

  const regionIds = new Map<string, number>()
  for (const r of regions) {
    const doc = await payload.create({
      collection: 'regions',
      data: {
        name: r.name,
        slug: r.id,
        calendar: r.calendar,
        totalTemples: r.totalTemples,
        intro: toLexical(r.intro),
      },
      ...options,
    })
    regionIds.set(r.id, doc.id)
  }
  const region = (id: string) => regionIds.get(id)!

  const templeIds = new Map<string, number>()
  for (const t of temples) {
    const doc = await payload.create({
      collection: 'temples',
      data: {
        name: t.name,
        knownAs: t.knownAs,
        deity: t.deity,
        deityGroup: t.group,
        street: t.street,
        intro: t.intro ? toLexical(t.intro) : undefined,
        coordinates: t.coordinates ? { lat: t.coordinates[0], lng: t.coordinates[1] } : undefined,
        slug: t.id,
        region: region(t.region),
        _status: 'published',
      },
      ...options,
    })
    templeIds.set(t.id, doc.id)
  }

  const observanceIds = new Map<string, number>()
  for (const o of observances) {
    const doc = await payload.create({
      collection: 'observances',
      data: {
        name: o.name,
        tamil: o.tamil,
        kind: o.kind,
        alsoKnownAs: o.alsoKnownAs,
        gloss: o.gloss,
        about: o.about?.map((x) => ({ question: x.q, answer: toLexical([x.a]) })),
        slug: o.id,
        review: review(o.editorial?.status, o.editorial?.note),
        _status: 'published',
      },
      ...options,
    })
    observanceIds.set(o.id, doc.id)
  }

  const noteIds = new Map<string, number>()
  for (const n of fieldNotes) {
    const doc = await payload.create({
      collection: 'field-notes',
      data: {
        title: n.title,
        kind: n.kind,
        date: noonIST(n.date),
        occasion: n.occasion,
        authors: n.authors,
        temples: idsOf(n.temples, templeIds, 'temple'),
        observances: idsOf(n.observances, observanceIds, 'festival or ritual'),
        body: toLexical(n.body),
        removed: n.editorial.removed.map((item) => ({ item })),
        slug: n.id,
        region: region(n.region),
        review: review(n.editorial.status),
        _status: 'published',
      },
      ...options,
    })
    noteIds.set(n.id, doc.id)
  }

  for (const o of occasions) {
    await payload.create({
      collection: 'occasions',
      data: {
        date: noonIST(o.date),
        temple: idsOf([o.temple], templeIds, 'temple')[0],
        label: o.label,
        observances: idsOf(o.observances, observanceIds, 'festival or ritual'),
        fieldNote: o.note ? idsOf([o.note], noteIds, 'field note')[0] : undefined,
        region: region(o.region),
      },
      ...options,
    })
  }

  for (const a of articles) {
    await payload.create({
      collection: 'articles',
      data: {
        title: a.title,
        author: a.author,
        date: noonIST(a.date),
        teaser: a.teaser,
        body: toLexical(a.body),
        temples: idsOf(a.temples, templeIds, 'temple'),
        observances: idsOf(a.observances, observanceIds, 'festival or ritual'),
        slug: a.id,
        review: review(a.editorial.status),
        _status: 'published',
      },
      ...options,
    })
  }

  // The drawings so far are one placeholder plan, shown on each temple page.
  let placeholder: number | undefined
  for (const d of illustrations) {
    placeholder ??= (
      await payload.create({
        collection: 'media',
        data: { alt: d.alt, caption: 'Placeholder for the illustrated plan', consent: 'not-needed' },
        filePath: path.resolve(dirname, 'files/placeholder-plan.svg'),
        ...options,
      })
    ).id
    await payload.create({
      collection: 'drawings',
      data: {
        title: d.title,
        kind: d.kind,
        image: placeholder,
        caption: d.caption,
        credit: d.credit,
        temples: idsOf(d.temples, templeIds, 'temple'),
        observances: idsOf(d.observances, observanceIds, 'festival or ritual'),
        region: region(d.region),
        review: review(d.editorial.status),
        _status: 'published',
      },
      ...options,
    })
  }

  for (const e of templeEntries) {
    await payload.create({
      collection: 'temple-pieces',
      data: {
        title: e.title,
        topic: e.topic,
        temples: idsOf(e.temples, templeIds, 'temple'),
        body: toLexical(e.body),
        named: e.named,
        sources: idsOf(e.sources, noteIds, 'field note'),
        region: region(e.region),
        review: review(e.editorial.status),
        _status: 'published',
      },
      ...options,
    })
  }

  for (const b of books) {
    await payload.create({
      collection: 'books',
      data: {
        title: 'The Temples of Pondicherry',
        status: b.status,
        byline: b.byline,
        illustrations: b.illustrations,
        parts: b.parts.map((p) => ({
          title: p.title,
          summary: p.summary,
          link: p.link ? { label: p.link.label, href: p.link.href } : undefined,
        })),
        region: region(b.region),
        review: review(b.editorial.status),
        _status: 'published',
      },
      ...options,
    })
  }

  const counts: string[] = []
  for (const collection of [
    'regions',
    'temples',
    'observances',
    'field-notes',
    'occasions',
    'articles',
    'drawings',
    'temple-pieces',
    'books',
    'media',
  ] as const) {
    const { totalDocs: n } = await payload.count({ collection, overrideAccess: true })
    counts.push(`${collection} ${n}`)
  }
  payload.logger.info(`Imported: ${counts.join(', ')}`)
  await seedPages(payload)
}

/** Called by `payload seed` (see `bin` in payload.config.ts). */
export async function script(config: SanitizedConfig) {
  const payload = await getPayload({ config })
  try {
    await seed(payload)
  } finally {
    await payload.destroy()
  }
  process.exit(0)
}
