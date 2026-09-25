import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

/* When anything is saved or deleted, the whole site is refreshed: pages are
   built ahead of time for speed, and this tells Next.js to rebuild them on
   the next visit. The site is small, so refreshing everything is simplest.
   Scripts (like the import) pass `skipRevalidate`, and outside Next.js
   there is nothing to refresh, so errors are ignored. */

function refresh(context: Record<string, unknown>) {
  if (context.skipRevalidate) return
  try {
    revalidatePath('/', 'layout')
  } catch {
    // not running inside Next.js
  }
}

export const refreshAfterChange: CollectionAfterChangeHook = ({ doc, req }) => {
  refresh(req.context)
  return doc
}

export const refreshAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  refresh(req.context)
  return doc
}

/** For single pages (Home page, About page). */
export const refreshAfterGlobalChange: GlobalAfterChangeHook = ({ doc, req }) => {
  refresh(req.context)
  return doc
}

export const refreshHooks = {
  afterChange: [refreshAfterChange],
  afterDelete: [refreshAfterDelete],
}
