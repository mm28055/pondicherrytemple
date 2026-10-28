import { revalidatePath, revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook, PayloadRequest } from 'payload'
import { PHOTOS_TAG, SITE_CONTENT_TAG } from '../lib/siteCache'

/* When anything is saved or deleted, the whole site is refreshed: pages are
   built ahead of time, and what they read from the database is kept between
   visits (lib/data), so this clears both, and the next visit to each page
   rebuilds it from the database, once. The site is small, so refreshing
   everything is simplest.
   Not for a draft saved (by hand, or autosaved every two seconds while a
   field note or film is written): the public site shows only what is
   published, so nothing it shows has changed, and refreshing the site at
   every autosave had it read the whole database again and again.
   Scripts (like the import) pass `skipRevalidate`, and outside Next.js
   there is nothing to refresh, so errors are ignored. */

function refresh(context: Record<string, unknown>, collection?: string) {
  if (context.skipRevalidate) return
  try {
    revalidateTag(SITE_CONTENT_TAG, { expire: 0 })
    // the photographs, read apart from the rest (lib/siteCache)
    if (collection === 'media' || collection === 'photo-sets') revalidateTag(PHOTOS_TAG, { expire: 0 })
    revalidatePath('/', 'layout')
  } catch {
    // not running inside Next.js
  }
}

/** A draft saved (or autosaved), leaving what is published as it was. */
function draftOnly(req: PayloadRequest, doc: { _status?: string | null }) {
  const q = (req.query ?? {}) as Record<string, unknown>
  const asDraft = q.draft === 'true' || q.draft === true || q.autosave === 'true' || q.autosave === true
  return asDraft && doc?._status === 'draft'
}

export const refreshAfterChange: CollectionAfterChangeHook = ({ collection, doc, req }) => {
  if (!draftOnly(req, doc)) refresh(req.context, collection.slug)
  return doc
}

export const refreshAfterDelete: CollectionAfterDeleteHook = ({ collection, doc, req }) => {
  refresh(req.context, collection.slug)
  return doc
}

/** For single pages (Home page, About page). */
export const refreshAfterGlobalChange: GlobalAfterChangeHook = ({ doc, req }) => {
  if (!draftOnly(req, doc)) refresh(req.context)
  return doc
}

export const refreshHooks = {
  afterChange: [refreshAfterChange],
  afterDelete: [refreshAfterDelete],
}
