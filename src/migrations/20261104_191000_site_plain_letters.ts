import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await sitePlainLettersData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the marks are not kept: nothing to put back
}

/* The rest of the site without diacritics, after the field notes
   (20261104_190000_note_plain_letters): the films' text, the About page's
   sections and the team's bios, photo sets' titles and short descriptions,
   the festivals' glosses and photos' captions. Only Latin letters and the
   words shown: not links, not Tamil or Devanagari script, not a photo set's
   "From the folder", which records where its photos came from. Newer drafts
   are put back still drafts. Runs again harmlessly. */
type Node = { type?: string; text?: string; children?: Node[] }

const plainLetters = (s: string) => s.replace(/\p{Script=Latin}\p{M}*/gu, (m) => m.normalize('NFD').replace(/\p{M}+/gu, ''))

/** Rich text with its words made plain, or null when there was nothing to do. */
function cleanRich(body: unknown): unknown | null {
  let changed = false
  const walk = (n: Node): Node => {
    const out: Node = { ...n }
    if (n.type === 'text' && typeof n.text === 'string') {
      out.text = plainLetters(n.text)
      if (out.text !== n.text) changed = true
    }
    if (Array.isArray(n.children)) out.children = n.children.map(walk)
    return out
  }
  const root = (body as { root?: Node } | null)?.root
  if (!root) return null
  const next = { ...(body as object), root: walk(root) }
  return changed ? next : null
}

const META = new Set(['id', 'createdAt', 'updatedAt', '_status', 'createdBy'])
const fields = (doc: Record<string, unknown>) => Object.fromEntries(Object.entries(doc).filter(([k]) => !META.has(k)))

/** A document's changed fields, or null: `rich` are rich text, `plain` are strings. */
function cleaned(doc: any, rich: string[], plain: string[]): Record<string, unknown> | null {
  const out: Record<string, unknown> = {}
  for (const k of rich) {
    const v = cleanRich(doc[k])
    if (v) out[k] = v
  }
  for (const k of plain) {
    if (typeof doc[k] === 'string' && plainLetters(doc[k]) !== doc[k]) out[k] = plainLetters(doc[k])
  }
  return Object.keys(out).length ? out : null
}

export async function sitePlainLettersData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const made: Record<string, number> = {}

  // with drafts: what is published, then a newer draft put back; or a draft alone
  for (const [collection, rich, plain] of [
    ['films', ['body'], []],
    ['observances', [], ['gloss']],
  ] as [string, string[], string[]][]) {
    const { docs: all } = await payload.find({ collection, limit: 0, pagination: false, draft: true, ...quiet } as any)
    for (const latest of all as any[]) {
      const { docs: pub } = await payload.find({ collection, limit: 1, draft: false, where: { and: [{ id: { equals: latest.id } }, { _status: { equals: 'published' } }] }, ...quiet } as any)
      const published = pub[0] as any
      const change = published ? cleaned(published, rich, plain) : null
      if (published && change) {
        await payload.update({ collection, id: published.id, data: { ...fields(published), ...change, _status: 'published' }, draft: false, ...quiet } as any)
        made[collection] = (made[collection] ?? 0) + 1
      }
      if (latest._status === 'draft') {
        const draftChange = cleaned(latest, rich, plain)
        if (change || draftChange) await payload.update({ collection, id: latest.id, data: { ...fields(latest), ...draftChange, _status: 'draft' }, draft: true, ...quiet } as any)
        if (draftChange && !published) made[collection] = (made[collection] ?? 0) + 1
      }
    }
  }

  // no drafts
  const { docs: sets } = await payload.find({ collection: 'photo-sets', limit: 0, pagination: false, ...quiet } as any)
  for (const s of sets as any[]) {
    const change = cleaned(s, [], ['title', 'short'])
    if (change) {
      await payload.update({ collection: 'photo-sets', id: s.id, data: change, ...quiet } as any)
      made['photo-sets'] = (made['photo-sets'] ?? 0) + 1
    }
  }
  const { docs: media } = await payload.find({ collection: 'media', limit: 0, pagination: false, select: { caption: true }, ...quiet } as any)
  for (const m of media as any[]) {
    const change = cleaned(m, [], ['caption'])
    if (change) {
      await payload.update({ collection: 'media', id: m.id, data: change, ...quiet } as any)
      made.media = (made.media ?? 0) + 1
    }
  }

  // the About page
  const about = (await payload.findGlobal({ slug: 'about-page', ...quiet } as any)) as any
  const sections = (about.sections ?? []).map((x: any) => ({ ...x, ...cleaned(x, ['body'], []) }))
  const team = (about.team ?? []).map((x: any) => ({ ...x, ...cleaned(x, [], ['bio']) }))
  if (JSON.stringify([sections, team]) !== JSON.stringify([about.sections ?? [], about.team ?? []])) {
    await payload.updateGlobal({ slug: 'about-page', data: { sections, team }, ...quiet } as any)
    made['about-page'] = 1
  }

  payload.logger.info(`site plain letters: ${JSON.stringify(made)}`)
}
