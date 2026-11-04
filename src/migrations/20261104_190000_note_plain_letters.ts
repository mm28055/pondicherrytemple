import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await notePlainLettersData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the marks are not kept: nothing to put back
}

/* Field notes without diacritics (4 November 2026): every Latin letter with a
   mark in a note's title or text becomes the plain letter (ā a, ṣ s, ḻ l, é e).
   Only the words shown are touched: not links, not web addresses, not the
   Tamil or Devanagari script, whose vowel signs are marks of their own. And in
   "An Abhishekam (or Two) a Day" the Purusha sultan becomes the Purusha suktam.
   In what is published, and in a newer draft too, which is put back still a
   draft (as in 20261031_121000_plain_note_text). Runs again harmlessly. */
type Node = { type?: string; text?: string; children?: Node[] }

const plainLetters = (s: string) => s.replace(/\p{Script=Latin}\p{M}*/gu, (m) => m.normalize('NFD').replace(/\p{M}+/gu, ''))
const clean = (s: string) => plainLetters(s).replace(/\bPurusha sultan\b/g, 'Purusha suktam')

/** The text with its words made plain, or null when there was nothing to do. */
function cleanBody(body: unknown): unknown | null {
  let changed = false
  const walk = (n: Node): Node => {
    const out: Node = { ...n }
    if (n.type === 'text' && typeof n.text === 'string') {
      out.text = clean(n.text)
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

export async function notePlainLettersData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const { docs } = await payload.find({ collection: 'field-notes', limit: 0, pagination: false, draft: false, where: { _status: { equals: 'published' } }, ...quiet } as any)
  let made = 0
  for (const published of docs as any[]) {
    const latest = (await payload.findByID({ collection: 'field-notes', id: published.id, draft: true, ...quiet } as any)) as any
    const pending = latest._status === 'draft'
    const body = cleanBody(published.body)
    const title = clean(published.title ?? '')
    if (body || title !== (published.title ?? '')) {
      await payload.update({ collection: 'field-notes', id: published.id, data: { ...fields(published), title, body: body ?? published.body, _status: 'published' }, draft: false, ...quiet } as any)
      made++
    }
    // a newer draft: put back, its own text made plain too
    const draftBody = pending ? cleanBody(latest.body) : null
    const draftTitle = clean(latest.title ?? '')
    if (pending && (body || title !== (published.title ?? '') || draftBody || draftTitle !== (latest.title ?? '')))
      await payload.update({
        collection: 'field-notes',
        id: published.id,
        data: { ...fields(latest), title: draftTitle, body: draftBody ?? latest.body, _status: 'draft' },
        draft: true,
        ...quiet,
      } as any)
  }
  // notes never published: only a draft to clean
  const { docs: drafts } = await payload.find({ collection: 'field-notes', limit: 0, pagination: false, draft: true, where: { _status: { equals: 'draft' } }, ...quiet } as any)
  for (const d of drafts as any[]) {
    const has = await payload.find({ collection: 'field-notes', limit: 1, draft: false, where: { and: [{ id: { equals: d.id } }, { _status: { equals: 'published' } }] }, ...quiet } as any)
    if (has.docs.length) continue
    const b = cleanBody(d.body)
    const t = clean(d.title ?? '')
    if (b || t !== (d.title ?? '')) await payload.update({ collection: 'field-notes', id: d.id, data: { ...fields(d), title: t, body: b ?? d.body, _status: 'draft' }, draft: true, ...quiet } as any)
  }
  payload.logger.info(`note plain letters: ${made} published field notes changed`)
}
