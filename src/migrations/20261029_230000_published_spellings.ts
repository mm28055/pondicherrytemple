import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import type { CollectionSlug, Field } from 'payload'
import { fixFields } from './20261029_180000_spellings'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await publishedSpellingsData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the spellings are kept: nothing to undo
}

/* The site's spellings, and Nandhikeswara in web addresses, in what is
   published of a page that has a newer draft too. The spellings and the
   addresses were put right in that draft alone (20261029_180000_spellings,
   _180100_nandhikeswara_addresses), leaving what is published as it was: two
   field notes (Nandikeswara Koyil, Vaikasi Vishakam; Conversation with
   Sivakathir) still showed the old spelling, and their new addresses, to
   which the old ones lead, opened no page. Here the published version takes
   those corrections and nothing else of the draft; the draft is then put
   back as it was, still a draft, newer than what is published. */
const META = new Set(['id', 'createdAt', 'updatedAt', '_status', 'createdBy'])
const fields = (doc: Record<string, unknown>) => Object.fromEntries(Object.entries(doc).filter(([k]) => !META.has(k)))
const fixSlug = (slug: unknown) =>
  typeof slug === 'string' ? slug.replace(/(^|-)nandikeswara(?=-|$)/, '$1nandhikeswara') : slug

export async function publishedSpellingsData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  for (const slug of Object.keys(payload.collections) as CollectionSlug[]) {
    const config = payload.collections[slug].config
    if (!(config.versions && typeof config.versions === 'object' && config.versions.drafts)) continue
    // what is published (a draft's saving leaves it as it was)
    const { docs } = await payload.find({ collection: slug, limit: 0, pagination: false, draft: false, where: { _status: { equals: 'published' } }, ...quiet } as any)
    for (const published of docs as any[]) {
      const changes = fixFields(config.flattenedFields as Field[], published) ?? {}
      if (fixSlug(published.slug) !== published.slug) changes.slug = fixSlug(published.slug)
      if (!Object.keys(changes).length) continue
      const latest = (await payload.findByID({ collection: slug, id: published.id, draft: true, ...quiet } as any)) as any
      const pending = latest._status === 'draft'
      // published with its own content, those words and its address put right
      await payload.update({ collection: slug, id: published.id, data: { ...fields(published), ...changes, _status: 'published' }, draft: false, ...quiet } as any)
      // the draft (already put right) put back over it, still a draft
      if (pending) await payload.update({ collection: slug, id: published.id, data: { ...fields(latest), _status: 'draft' }, draft: true, ...quiet } as any)
      payload.logger.info(`published spellings: ${slug} ${published.slug ?? published.id} (${Object.keys(changes).join(', ')})${pending ? ', its draft kept' : ''}`)
    }
  }
}
