import type { CollectionAfterChangeHook, CollectionBeforeChangeHook } from 'payload'
import { photosReached, tagDayOf, tagPhotos, tagSources, tagsOf } from '../lib/photoTags'
import { refresh } from './revalidate'

/* Keeping the photographs' own tags filled in (lib/photoTags): as a photo
   set, a published field note or a day's occasion is saved, the photos it
   reaches are given the temples and festivals they now lack (none taken
   away); a photo added to a set is given the set's as it is saved. */

const refId = (r: unknown): number | undefined =>
  typeof r === 'number' ? r : r && typeof r === 'object' && 'id' in r ? (r as { id: number }).id : undefined
const refIds = (rs: unknown): number[] => (Array.isArray(rs) ? rs.map(refId).filter((x): x is number => x !== undefined) : [])

const tagged = async (req: Parameters<CollectionAfterChangeHook>[0]['req'], from: Parameters<typeof photosReached>[2]) => {
  if (req.context.tagging) return
  const photos = await photosReached(req.payload, req, from)
  if ((await tagPhotos(req.payload, req, photos)) > 0) refresh(req.context, 'media')
}

/** A photo set saved: its photos. */
export const tagSetPhotos: CollectionAfterChangeHook = async ({ doc, req }) => {
  await tagged(req, { sets: [doc.id] })
  return doc
}

/** A field note published: its photos, and the sets of its day. */
export const tagNotePhotos: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (doc._status !== 'published') return doc
  await tagged(req, { photos: refIds(doc.photos), days: doc.date ? [tagDayOf(doc.date)] : [] })
  return doc
}

/** A day's occasion saved: the sets of its day. */
export const tagOccasionPhotos: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (doc.date) await tagged(req, { days: [tagDayOf(doc.date)] })
  return doc
}

/** A photo put in a set (brought in, or moved to another): the set's tags, with its own. */
export const tagPhotoOfSet: CollectionBeforeChangeHook = async ({ data, originalDoc, operation, req }) => {
  const set = refId(data.set)
  const isImage = String(data.mimeType ?? originalDoc?.mimeType ?? 'image/').startsWith('image/')
  if (req.context.tagging || !isImage || set === undefined) return data
  if (operation === 'update' && refId(originalDoc?.set) === set) return data
  const own = {
    id: originalDoc?.id as number | undefined,
    set,
    temples: data.temples ?? originalDoc?.temples,
    observances: data.observances ?? originalDoc?.observances,
  }
  const tags = tagsOf(own, await tagSources(req.payload, req))
  return { ...data, temples: tags.temples, observances: tags.observances }
}
