import type { Payload, PayloadRequest } from 'payload'
import { tagDayOf } from './photoTags'

/* The order a festival's, a temple's or a field note's photographs are put in
   by hand, in the photo grid of its form (components/admin/TaggedPhotoGrid):
   kept apart from it, in photo-orders, one row for each ("observances:12",
   "temples:3", "field-notes:690"), so that saving an order touches neither
   its text nor its drafts. The photos put in order come first on its page,
   in that order; any others after them, as the site orders them. */

export const ORDER_KINDS = ['observances', 'temples', 'field-notes'] as const
export type OrderKind = (typeof ORDER_KINDS)[number]

type Id = number
type Ref = Id | { id: Id } | null | undefined
const idOf = (r: Ref): Id | undefined => (r == null ? undefined : typeof r === 'number' ? r : r.id)
const ids = (refs: Ref[] | null | undefined): Id[] => (refs ?? []).map(idOf).filter((x): x is Id => x !== undefined)

export const orderKey = (kind: OrderKind, id: Id) => `${kind}:${id}`

/** The photo sets a field note's photos come from (lib/data, the photographs
    beside a note): the set it is chosen for, or else those of its day at
    one of its temples, or whose day's occasion there names it. */
export async function setsOfNote(payload: Payload, req: PayloadRequest, note: { id: Id; date?: string | null; temples?: Ref[] | null }) {
  const all = { depth: 0, limit: 0, pagination: false, overrideAccess: true, req } as const
  const sets = await payload.find({ ...all, collection: 'photo-sets', joins: false, select: { date: true, temples: true, fieldNote: true } })
  const day = note.date ? tagDayOf(note.date) : undefined
  const mine = ids(note.temples)
  const naming = day
    ? (await payload.find({ ...all, collection: 'occasions', where: { fieldNote: { equals: note.id } }, select: { date: true, temple: true } })).docs
    : []
  return sets.docs
    .filter((s) => {
      const chosen = idOf(s.fieldNote as Ref)
      if (chosen !== undefined) return chosen === note.id
      if (!s.date) return false
      const sDay = tagDayOf(s.date)
      const at = ids(s.temples as Ref[])
      return (sDay === day && at.some((t) => mine.includes(t))) || naming.some((o) => tagDayOf(o.date) === sDay && at.includes(idOf(o.temple as Ref) ?? -1))
    })
    .map((s) => s.id)
}

export type GridPhoto = {
  id: Id
  filename?: string | null
  featured?: boolean | null
  url?: string | null
  sizes?: { thumbnail?: { url?: string | null } | null } | null
  set?: Id | null
  /** when it was taken: the camera's time, else the day given it, else its set's */
  taken?: string | null
}

/** The photographs of a festival, temple or field note, for its photo grid:
    those put in order first, in that order; then the rest as the site shows
    them (a festival's or temple's newest day first; a note's set by set). */
export async function photosOf(payload: Payload, req: PayloadRequest, kind: OrderKind, id: Id) {
  const all = { depth: 0, limit: 0, pagination: false, overrideAccess: true, req } as const
  let where
  if (kind === 'field-notes') {
    const note = await payload.findByID({ collection: 'field-notes', id, depth: 0, draft: true, overrideAccess: true, req })
    const sets = await setsOfNote(payload, req, note)
    where = { or: [{ set: { in: sets } }, { id: { in: ids(note.photos as Ref[]) } }] }
  } else where = { [kind]: { equals: id } }
  const found = await payload.find({
    ...all,
    collection: 'media',
    where: { and: [{ mimeType: { contains: 'image' } }, where] },
    select: { filename: true, featured: true, url: true, sizes: true, set: true, position: true, takenAt: true, takenOn: true, createdAt: true },
  })
  const setDays = new Map(
    (await payload.find({ ...all, collection: 'photo-sets', joins: false, select: { date: true } })).docs.map((s) => [s.id, s.date ?? undefined]),
  )
  const dayOf = (m: (typeof found.docs)[number]) => {
    const when = m.takenOn ?? setDays.get(idOf(m.set as Ref) ?? -1) ?? m.takenAt
    return when ? tagDayOf(when) : ''
  }
  const inSet = (a: (typeof found.docs)[number], b: (typeof found.docs)[number]) =>
    (idOf(a.set as Ref) ?? 0) - (idOf(b.set as Ref) ?? 0) ||
    (a.position ?? Infinity) - (b.position ?? Infinity) ||
    (a.takenAt ?? '').localeCompare(b.takenAt ?? '') ||
    a.id - b.id
  const docs = found.docs.sort((a, b) => (kind === 'field-notes' ? 0 : dayOf(b).localeCompare(dayOf(a))) || inSet(a, b))
  const saved = await savedOrder(payload, req, kind, id)
  const at = new Map(saved.map((x, i) => [x, i]))
  const placed = docs.filter((m) => at.has(m.id)).sort((a, b) => at.get(a.id)! - at.get(b.id)!)
  const photos: GridPhoto[] = [...placed, ...docs.filter((m) => !at.has(m.id))].map((m) => ({
    id: m.id,
    filename: m.filename,
    featured: m.featured,
    url: m.url,
    sizes: { thumbnail: { url: m.sizes?.thumbnail?.url } },
    set: idOf(m.set as Ref) ?? null,
    taken: m.takenAt ?? m.takenOn ?? setDays.get(idOf(m.set as Ref) ?? -1) ?? null,
  }))
  return { photos, ordered: saved.length > 0 }
}

/** The order saved for a festival, temple or note (empty: none). */
export async function savedOrder(payload: Payload, req: PayloadRequest | undefined, kind: OrderKind, id: Id): Promise<Id[]> {
  const { docs } = await payload.find({
    collection: 'photo-orders',
    where: { of: { equals: orderKey(kind, id) } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
  })
  return Array.isArray(docs[0]?.ids) ? (docs[0].ids as Id[]) : []
}

/** An order saved (or, given none, taken away). */
export async function saveOrder(payload: Payload, req: PayloadRequest, kind: OrderKind, id: Id, order: Id[]) {
  const of = orderKey(kind, id)
  const { docs } = await payload.find({ collection: 'photo-orders', where: { of: { equals: of } }, depth: 0, limit: 1, overrideAccess: true, req })
  const quiet = { req, depth: 0, overrideAccess: true, context: { skipRevalidate: true } } as const
  if (!order.length) {
    if (docs[0]) await payload.delete({ collection: 'photo-orders', id: docs[0].id, ...quiet })
  } else if (docs[0]) await payload.update({ collection: 'photo-orders', id: docs[0].id, data: { ids: order }, ...quiet })
  else await payload.create({ collection: 'photo-orders', data: { of, ids: order }, ...quiet })
}
