import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import type { CollectionSlug, Field, GlobalSlug } from 'payload'
import { spell } from '../lib/spellings'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await spellingsData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the spellings are kept: nothing to undo
}

/* The site's spellings (lib/spellings) in everything written on it: Amavasya,
   Krittikai, Vedapuriswara, Nandhikeswara, Kailaya Vadyam, Dhvajarohanam,
   Dhvajavarohanam, Gurukkal. Only in what is written, by each field's kind
   (text, and the words of rich text): never in a value chosen from a list
   ("amavasya", a tithi), a web address, a folder or a file name. A draft is
   corrected as a draft, leaving what is published as it was until it is
   published. Exported for this computer's copy of the database (scripts). */
const KEEP = new Set(['slug', 'folder', 'filename', 'url', 'thumbnailURL', 'prefix', 'mimeType'])

// the value corrected, by its field; undefined where nothing changes
const fixField = (field: Field, value: unknown): unknown => {
  if (value == null || !('name' in field) || KEEP.has(field.name) || ('virtual' in field && field.virtual)) return undefined
  if ((field.type === 'text' || field.type === 'textarea') && typeof value === 'string') {
    const fixed = spell(value)
    return fixed === value ? undefined : fixed
  }
  if (field.type === 'richText' && typeof value === 'object') {
    let changed = false
    const walk = (node: any): any => {
      if (Array.isArray(node)) return node.map(walk)
      if (!node || typeof node !== 'object') return node
      const out: any = {}
      for (const [k, v] of Object.entries(node)) {
        if (k === 'text' && typeof v === 'string') {
          const fixed = spell(v)
          if (fixed !== v) changed = true
          out[k] = fixed
        } else out[k] = walk(v)
      }
      return out
    }
    const fixed = walk(value)
    return changed ? fixed : undefined
  }
  if ((field.type === 'group' || (field.type as string) === 'tab' || field.type === 'array') && 'fields' in field) {
    const one = (item: any) => {
      if (!item || typeof item !== 'object') return undefined
      const changes = fixFields(field.fields, item)
      return changes ? { ...item, ...changes } : undefined
    }
    if (field.type !== 'array') return one(value)
    if (!Array.isArray(value)) return undefined
    const items = value.map((item) => one(item))
    return items.some(Boolean) ? value.map((item, i) => items[i] ?? item) : undefined
  }
  return undefined
}
/** The fields of `doc` whose words are not in the site's spellings, corrected; undefined where all are. */
export const fixFields = (fields: Field[], doc: any): Record<string, unknown> | undefined => {
  const changes: Record<string, unknown> = {}
  for (const field of fields) {
    // rows, collapsibles and unnamed tabs (inside arrays, not flattened): their fields, at this level
    if (!('name' in field) || !field.name) {
      const inner = 'fields' in field ? field.fields : 'tabs' in field ? field.tabs.flatMap((t) => ('name' in t && t.name ? [{ ...t, type: 'group' } as Field] : t.fields)) : []
      Object.assign(changes, fixFields(inner, doc))
      continue
    }
    const fixed = fixField(field, doc[field.name])
    if (fixed !== undefined) changes[field.name] = fixed
  }
  return Object.keys(changes).length ? changes : undefined
}

export async function spellingsData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const slugs: CollectionSlug[] = [
    'field-notes', 'occasions', 'observances', 'photo-sets', 'temples', 'weekly-rituals', 'articles', 'films',
    'books', 'drawings', 'temple-pieces', 'regions', 'special-tithis', 'special-nakshatras', 'media',
  ]
  for (const slug of slugs) {
    const config = payload.collections[slug]?.config
    if (!config) continue
    const drafts = Boolean(config.versions && typeof config.versions === 'object' && config.versions.drafts)
    for (let page = 1; ; page++) {
      const { docs, hasNextPage } = await payload.find({
        collection: slug,
        limit: 1000,
        page,
        sort: 'id',
        ...(drafts ? { draft: true } : {}),
        ...(slug === 'photo-sets' ? { joins: false } : {}),
        ...quiet,
      } as any)
      for (const doc of docs as any[]) {
        const data = fixFields(config.flattenedFields as Field[], doc)
        if (!data) continue
        const asDraft = drafts && doc._status === 'draft'
        await payload.update({ collection: slug, id: doc.id, data, ...(drafts ? { draft: asDraft } : {}), ...quiet } as any)
        payload.logger.info(`spellings: ${slug} ${doc.slug ?? doc.id} (${Object.keys(data).join(', ')})`)
      }
      if (!hasNextPage) break
    }
  }
  const globals: GlobalSlug[] = ['home-page', 'about-page', 'section-descriptions', 'varam']
  for (const slug of globals) {
    const config = payload.globals.config.find((g) => g.slug === slug)
    if (!config) continue
    const doc = await payload.findGlobal({ slug, ...quiet } as any)
    const data = fixFields(config.flattenedFields as Field[], doc)
    if (data) await payload.updateGlobal({ slug, data, ...quiet } as any)
  }
}
