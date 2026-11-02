import type { Payload, PayloadRequest } from 'payload'

/* A photograph's temples and festivals are its own tags (in the admin, on the
   photo itself): the site reads nothing else (lib/data). They are filled in
   from where the photo belongs, as the site once worked them out each time:

   - its photo set: the set's temples and festivals, and the festivals and
     rituals of the set's day at its temples ("The year so far"), unless the
     set is one of the Town's Cultural and Spiritual Ethos, which takes only
     its own;
   - its field notes (those it is in, and those its set goes beside: the one
     chosen for the set, or else each of the same day at one of its temples,
     or named by that day's occasions there): their festivals, and their
     temples where neither the photo nor its set has any.

   Once, for every photograph (the migration of 2 November 2026); then, as a
   set, a field note or a day's occasion is saved, for the photos it reaches,
   and as a photo is added to a set. Only ever added: a tag taken off a set,
   a note or a day stays on its photos, to be taken off them by hand. */

type Id = number
type Ref = Id | { id: Id } | null | undefined
const idOf = (r: Ref): Id | undefined => (r == null ? undefined : typeof r === 'number' ? r : r.id)
const ids = (refs: Ref[] | null | undefined): Id[] => (refs ?? []).map(idOf).filter((x): x is Id => x !== undefined)
// the day a moment was in Pondicherry (each worked out once: it is asked of the same few moments many times)
const inIndia = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' })
const days = new Map<string, string>()
const dayOf = (moment: string) => {
  let day = days.get(moment)
  if (day === undefined) days.set(moment, (day = inIndia.format(new Date(moment))))
  return day
}

export type PhotoTags = { temples: Id[]; observances: Id[] }
type PhotoLike = { id?: Id; temples?: Ref[] | null; observances?: Ref[] | null; set?: Ref }

/** What the tags are worked out from: the published field notes, every
    day's occasions, the photo sets, and which temples are on the site. */
export async function tagSources(payload: Payload, req?: Partial<PayloadRequest>) {
  const all = { depth: 0, limit: 0, pagination: false, overrideAccess: true, req } as const
  const [notes, occasions, sets, temples] = await Promise.all([
    payload.find({
      ...all,
      collection: 'field-notes',
      where: { _status: { equals: 'published' } },
      select: { slug: true, date: true, temples: true, observances: true, photos: true },
    }),
    payload.find({ ...all, collection: 'occasions', select: { date: true, temple: true, observances: true, fieldNote: true } }),
    payload.find({
      ...all,
      collection: 'photo-sets',
      joins: false,
      select: { date: true, temples: true, observances: true, fieldNote: true, ethos: true },
    }),
    payload.find({ ...all, collection: 'temples', where: { _status: { equals: 'published' } }, select: { slug: true } }),
  ])
  const shown = new Set(temples.docs.filter((t) => t.slug).map((t) => t.id))
  const published = notes.docs.filter((n) => n.slug)
  const notesWith = new Map<Id, typeof published>()
  for (const n of published)
    for (const p of ids(n.photos as Ref[])) notesWith.set(p, [...(notesWith.get(p) ?? []), n])
  const occasionsOn = new Map<string, typeof occasions.docs>()
  for (const o of occasions.docs) {
    const day = dayOf(o.date)
    occasionsOn.set(day, [...(occasionsOn.get(day) ?? []), o])
  }
  const setOf = new Map(
    sets.docs.map((s) => {
      const day = s.date ? dayOf(s.date) : undefined
      const temples = ids(s.temples as Ref[])
      const chosen = idOf(s.fieldNote as Ref)
      const dayHere = day ? (occasionsOn.get(day) ?? []).filter((o) => temples.includes(idOf(o.temple as Ref) ?? -1)) : []
      const named = dayHere.map((o) => idOf(o.fieldNote as Ref))
      const setNotes = published.filter((n) =>
        chosen !== undefined
          ? n.id === chosen
          : (Boolean(day) && dayOf(n.date) === day && ids(n.temples as Ref[]).some((t) => temples.includes(t))) || named.includes(n.id),
      )
      const observances = new Set(ids(s.observances as Ref[]))
      if (!s.ethos) for (const o of dayHere) ids(o.observances as Ref[]).forEach((x) => observances.add(x))
      return [s.id, { temples, observances, notes: setNotes }] as const
    }),
  )
  return { shown, notesWith, setOf }
}

type Sources = Awaited<ReturnType<typeof tagSources>>

/** A photo's tags: its own, with those of where it belongs. */
export function tagsOf(photo: PhotoLike, { shown, notesWith, setOf }: Sources): PhotoTags {
  const inSet = setOf.get(idOf(photo.set) ?? -1)
  const notes = [...(photo.id !== undefined ? (notesWith.get(photo.id) ?? []) : []), ...(inSet?.notes ?? [])]
  const temples = new Set([...ids(photo.temples), ...(inSet?.temples ?? [])])
  const observances = new Set([...ids(photo.observances), ...(inSet?.observances ?? [])])
  // a photo of its own temple (or its set's) is that temple's alone: a note of
  // two temples does not tag it with the other too
  const ownTemples = [...temples].some((t) => shown.has(t))
  for (const n of notes) {
    if (!ownTemples) ids(n.temples as Ref[]).forEach((t) => temples.add(t))
    ids(n.observances as Ref[]).forEach((o) => observances.add(o))
  }
  return { temples: [...temples], observances: [...observances] }
}

/** The tags each of these photos lacks (all of them, if none are named). */
export async function missingTags(payload: Payload, req?: Partial<PayloadRequest>, only?: Id[]) {
  if (only && !only.length) return []
  const sources = await tagSources(payload, req)
  const photos = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 0,
    pagination: false,
    overrideAccess: true,
    req,
    where: { and: [{ mimeType: { contains: 'image' } }, ...(only ? [{ id: { in: only } }] : [])] },
    select: { temples: true, observances: true, set: true },
  })
  return photos.docs.flatMap((m) => {
    const has = { temples: ids(m.temples as Ref[]), observances: ids(m.observances as Ref[]) }
    const want = tagsOf(m, sources)
    const add = {
      temples: want.temples.filter((t) => !has.temples.includes(t)),
      observances: want.observances.filter((o) => !has.observances.includes(o)),
    }
    return add.temples.length || add.observances.length ? [{ id: m.id, has, add }] : []
  })
}

/** Adds to these photos the tags they lack, each saved without refreshing the
    site (the caller refreshes it once). How many were changed. */
export async function tagPhotos(payload: Payload, req: PayloadRequest, only: Id[]) {
  const todo = await missingTags(payload, req, only)
  for (const { id, has, add } of todo)
    await payload.update({
      collection: 'media',
      id,
      depth: 0,
      req,
      overrideAccess: true,
      data: { temples: [...has.temples, ...add.temples], observances: [...has.observances, ...add.observances] },
      context: { skipRevalidate: true, tagging: true },
    })
  return todo.length
}

/** The photos a saved set, field note or day's occasion reaches. */
export async function photosReached(
  payload: Payload,
  req: PayloadRequest,
  from: { sets?: Id[]; days?: string[]; photos?: Id[] },
): Promise<Id[]> {
  const out = new Set(from.photos ?? [])
  let sets = [...(from.sets ?? [])]
  if (from.days?.length) {
    // the sets of those days (any temple: which of them a note or occasion reaches is for tagsOf to say)
    const all = await payload.find({
      collection: 'photo-sets',
      depth: 0,
      limit: 0,
      pagination: false,
      overrideAccess: true,
      req,
      joins: false,
      where: { date: { exists: true } },
      select: { date: true },
    })
    sets = [...sets, ...all.docs.filter((s) => s.date && from.days!.includes(dayOf(s.date))).map((s) => s.id)]
  }
  if (sets.length) {
    const inSets = await payload.find({
      collection: 'media',
      depth: 0,
      limit: 0,
      pagination: false,
      overrideAccess: true,
      req,
      where: { set: { in: sets } },
      select: { set: true },
    })
    inSets.docs.forEach((m) => out.add(m.id))
  }
  return [...out]
}

export { dayOf as tagDayOf }

/** The missing tags written straight into the photos' table of links, a
    thousand at a time (for every photo at once: saving each would take
    hours). `run` runs one statement. */
export async function writeTags(todo: Awaited<ReturnType<typeof missingTags>>, run: (statement: string) => Promise<unknown>) {
  const rows: string[] = []
  for (const { id, has, add } of todo) {
    add.temples.forEach((t, i) => rows.push(`(${has.temples.length + i + 1}, ${id}, 'temples', ${t}, NULL)`))
    add.observances.forEach((o, i) => rows.push(`(${has.observances.length + i + 1}, ${id}, 'observances', NULL, ${o})`))
  }
  for (let i = 0; i < rows.length; i += 1000)
    await run(
      `INSERT INTO "media_rels" ("order", "parent_id", "path", "temples_id", "observances_id") VALUES ${rows.slice(i, i + 1000).join(', ')};`,
    )
  return rows.length
}
