import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import log from './data/database-log-2026-10-31.json'

/* The second Database Log, 15 June to 31 October 2026, put on the site, as
   reviewed with the team (31 October 2026; the data, its decisions applied,
   in data/database-log-2026-10-31.json):
   - two festivals renamed as the log spells them (Aadi Masam, Agni Vasanta
     Thiruvizha), and the festivals and rituals it names for the first time,
     each a page with only its name until it is written;
   - the Naga Mutthu Amman Koyil, in and around Pondicherry, with the set for
     its photographs of 28 October; and the Goubert Market's Vinayaka by its
     own name, the Varasiddhi Veeravinayaka Thirukkoyil;
   - its field notes (every entry with text, the occasion its title where it
     has none, its words in title case), and its calendar dates: one at each
     of an entry's temples, the blank entries' too, each with the day's
     schedule where the log gives one;
   - the town's photo sets with their notes (Goubert Market's three, as their
     folders say, and the Ethos sets of days with a note).
   Only what is not there already, so it can run again. */

type Log = typeof log
type Block = string | { list: string[] }
const noonIST = (day: string) => `${day}T06:30:00.000Z`

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await databaseLog2Data({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // what was added is kept: it may have been edited since
}

export async function databaseLog2Data({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const data = log as Log
  const one = async (collection: 'temples' | 'observances' | 'field-notes' | 'regions', slug: string) =>
    (await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, draft: true, ...quiet } as any)).docs[0] as any

  const town = await one('regions', 'pondicherry')
  const around = await one('regions', 'in-and-around-pondicherry')
  if (!town || !around) return

  // 1. festivals and rituals: renamed, then the new ones
  for (const r of data.renameObservances) {
    const o = (await one('observances', r.slug)) ?? (await one('observances', r.newSlug))
    if (o && (o.name !== r.name || o.slug !== r.newSlug))
      await payload.update({ collection: 'observances', id: o.id, data: { name: r.name, slug: r.newSlug }, draft: false, ...quiet } as any)
  }
  for (const o of data.observances) {
    if (await one('observances', o.slug)) continue
    await payload.create({
      collection: 'observances',
      data: { name: o.name, kind: o.kind as 'festival' | 'ritual', slug: o.slug, gloss: 'To be written', _status: 'published' },
      draft: false,
      ...quiet,
    } as any)
  }
  const observanceId = new Map<string, number>()
  for (const o of (await payload.find({ collection: 'observances', limit: 0, pagination: false, draft: true, ...quiet } as any)).docs as any[])
    observanceId.set(o.slug, o.id)

  // 2. the temples: the new one, and one by its own name
  for (const t of data.newTemples) {
    if (await one('temples', t.slug)) continue
    await payload.create({
      collection: 'temples',
      data: { ...t, deityGroup: t.deityGroup as 'amman', region: around.id, listed: true, _status: 'published' },
      draft: false,
      ...quiet,
    } as any)
  }
  for (const r of data.renameTemples) {
    const t = (await one('temples', r.slug)) ?? (await one('temples', r.newSlug))
    if (t && (t.name !== r.name || t.slug !== r.newSlug))
      await payload.update({
        collection: 'temples',
        id: t.id,
        data: { name: r.name, knownAs: r.knownAs, shortName: r.shortName, slug: r.newSlug },
        draft: false,
        ...quiet,
      } as any)
  }
  const templeId = new Map<string, number>()
  const templeRegion = new Map<string, number>()
  for (const t of (await payload.find({ collection: 'temples', limit: 0, pagination: false, draft: true, ...quiet } as any)).docs as any[]) {
    templeId.set(t.slug, t.id)
    templeRegion.set(t.slug, typeof t.region === 'object' ? t.region?.id : t.region)
  }
  const ids = (slugs: string[], map: Map<string, number>, what: string) =>
    slugs.map((s) => {
      const id = map.get(s)
      if (id === undefined) throw new Error(`No ${what} "${s}"`)
      return id
    })

  // 3. the field notes
  const noteId = new Map<string, number>()
  for (const n of data.notes) {
    const had = await one('field-notes', n.slug)
    if (had) {
      noteId.set(n.slug, had.id)
      continue
    }
    const doc = await payload.create({
      collection: 'field-notes',
      data: {
        ...(n.title ? { title: n.title } : {}),
        date: noonIST(n.date),
        occasion: n.occasion,
        temples: ids(n.temples, templeId, 'temple'),
        observances: ids(n.observances, observanceId, 'festival or ritual'),
        body: richText(n.body as Block[]) as never,
        slug: n.slug,
        region: n.around ? around.id : town.id,
        _status: 'published',
      },
      draft: false,
      ...quiet,
    } as any)
    noteId.set(n.slug, doc.id)
  }

  // 4. the calendar: a date at each temple of an entry, with its schedule
  for (const o of data.occasions) {
    const temple = o.temple ? ids([o.temple], templeId, 'temple')[0] : undefined
    const there = await payload.find({
      collection: 'occasions',
      where: { and: [{ date: { equals: noonIST(o.date) } }, { label: { equals: o.label } }, temple ? { temple: { equals: temple } } : { temple: { exists: false } }] },
      limit: 1,
      ...quiet,
    })
    if (there.docs.length) continue
    await payload.create({
      collection: 'occasions',
      data: {
        date: noonIST(o.date),
        temple,
        label: o.label,
        tbc: o.tbc,
        observances: ids(o.observances, observanceId, 'festival or ritual'),
        fieldNote: o.note ? noteId.get(o.note) : undefined,
        schedule: o.schedule,
        region: o.around ? around.id : town.id,
      },
      ...quiet,
    })
  }

  // 5. photo sets: the new temple's, and the town's with their notes
  const setBy = async (folder: string) =>
    (await payload.find({ collection: 'photo-sets', where: { folder: { equals: folder } }, limit: 1, joins: false, ...quiet })).docs[0]
  for (const s of data.newSets) {
    if (await setBy(s.folder)) continue
    await payload.create({
      collection: 'photo-sets',
      data: { title: s.title, date: noonIST(s.date), folder: s.folder, temples: ids([s.temple], templeId, 'temple'), region: templeRegion.get(s.temple) ?? around.id },
      ...quiet,
    } as any)
  }
  for (const s of data.setNotes) {
    const set = await setBy(s.folder)
    const note = noteId.get(s.note)
    if (set && note && (typeof set.fieldNote === 'object' ? set.fieldNote?.id : set.fieldNote) !== note)
      await payload.update({ collection: 'photo-sets', id: set.id, data: { fieldNote: note }, ...quiet })
  }

  payload.logger.info(
    `Database Log 2: ${data.notes.length} field notes, ${data.occasions.length} calendar dates, ${data.observances.length} new festivals and rituals`
  )
}

/* The text, written as simple HTML (paragraphs with <strong>, <em> and
   <a href>, and lists), into the editor's format, word for word. */
type Node = Record<string, unknown>
const block = { direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 }
const decode = (s: string) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
const BOLD = 1
const ITALIC = 2

function inline(html: string): Node[] {
  const out: Node[] = []
  let format = 0
  let link: Node | null = null
  const push = (text: string) => {
    if (!text) return
    const node = { type: 'text', text: decode(text), format, detail: 0, mode: 'normal', style: '', version: 1 }
    if (link) (link.children as Node[]).push(node)
    else out.push(node)
  }
  const re = /<(\/?)(strong|em|a)(?:\s+href="([^"]*)")?>/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    push(html.slice(last, m.index))
    last = re.lastIndex
    const [, close, tag, href] = m
    if (tag === 'a') {
      if (!close) link = { type: 'link', fields: { linkType: 'custom', url: decode(href ?? ''), newTab: true }, children: [], ...block, version: 3 }
      else if (link) {
        out.push(link)
        link = null
      }
    } else {
      const bit = tag === 'strong' ? BOLD : ITALIC
      format = close ? format & ~bit : format | bit
    }
  }
  push(html.slice(last))
  if (link) out.push(link)
  return out
}

export function richText(blocks: Block[]) {
  return {
    root: {
      type: 'root',
      ...block,
      children: blocks.map((b) =>
        typeof b === 'string'
          ? { type: 'paragraph', textFormat: 0, textStyle: '', ...block, children: inline(b) }
          : {
              type: 'list',
              listType: 'bullet',
              tag: 'ul',
              start: 1,
              ...block,
              children: b.list.map((item, i) => ({ type: 'listitem', value: i + 1, checked: undefined, ...block, children: inline(item) })),
            }
      ),
    },
  }
}
