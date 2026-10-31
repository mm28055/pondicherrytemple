import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await plainNoteTextData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the bold and italics are not kept: nothing to put back
}

/* Every field note's text in plain type (31 October 2026): its bold and
   italics taken out, its words, links, headings and lists as they were. In
   what is published, and in a newer draft too, which is put back still a
   draft (as in 20261029_230000_published_spellings). Runs again harmlessly. */
type Node = { type?: string; format?: number | string; children?: Node[] }
const BOLD = 1
const ITALIC = 2

/** The text with bold and italics taken out, or null when it had none. */
function plain(body: unknown): unknown | null {
  let changed = false
  const walk = (n: Node): Node => {
    const out: Node = { ...n }
    if (n.type === 'text' && typeof n.format === 'number' && n.format & (BOLD | ITALIC)) {
      out.format = n.format & ~(BOLD | ITALIC)
      changed = true
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

export async function plainNoteTextData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const { docs } = await payload.find({ collection: 'field-notes', limit: 0, pagination: false, draft: false, where: { _status: { equals: 'published' } }, ...quiet } as any)
  let made = 0
  for (const published of docs as any[]) {
    const latest = (await payload.findByID({ collection: 'field-notes', id: published.id, draft: true, ...quiet } as any)) as any
    const pending = latest._status === 'draft'
    const body = plain(published.body)
    if (body) {
      await payload.update({ collection: 'field-notes', id: published.id, data: { ...fields(published), body, _status: 'published' }, draft: false, ...quiet } as any)
      made++
    }
    // a newer draft: put back, its own text made plain too
    if (pending && (body || plain(latest.body)))
      await payload.update({
        collection: 'field-notes',
        id: published.id,
        data: { ...fields(latest), body: plain(latest.body) ?? latest.body, _status: 'draft' },
        draft: true,
        ...quiet,
      } as any)
  }
  payload.logger.info(`plain note text: ${made} field notes' bold and italics taken out`)
}
