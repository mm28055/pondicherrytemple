import config from '@payload-config'
import { getPayload } from 'payload'
import { editKind } from '@/lib/editing'

/* Admin2's Save (components/edit): one field of one entry, written through
   Payload as the person signed in, with the same rules as the admin — the
   admin's own checks run, and its saving refreshes the site as usual.

   A field of one row of a list ("ritualDay.2.time") is written by giving
   the whole list back with that one value changed, as the admin does.

   Published or draft, as the admin would have it: an entry whose latest
   version is published is saved published (the change shows on the site);
   one with unpublished changes waiting in the admin is saved as a draft
   beside them, so nothing waiting is published by surprise; a contributor
   only ever saves drafts. (Entries kept without drafts are simply saved.) */
export async function POST(request: Request) {
  // from this site's own pages only
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'Not from this site' }, 403)

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return json({ error: 'Signed out: sign in at /admin, then try again' }, 401)

  const body = (await request.json().catch(() => null)) as
    | { collection?: string; id?: number | string; field?: string; value?: unknown; rich?: unknown }
    | null
  const collection = body?.collection ?? ''
  const field = body?.field ?? ''
  const kind = editKind(collection, field)
  if (!kind || body?.id === undefined) return json({ error: 'That can’t be edited here' }, 400)

  let value: unknown
  if (kind === 'date') {
    // a day ("14 November 2026", "14 Nov 2026" or "2026-11-14"), kept as the site keeps days (noon in India); empty clears it
    const raw = typeof body.value === 'string' ? body.value.trim() : ''
    if (raw) {
      const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
      const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
      const words = raw.match(/^(\d{1,2})\s+([a-z]+)\.?,?\s+(\d{4})$/i)
      const [y, m, d] = iso
        ? [Number(iso[1]), Number(iso[2]), Number(iso[3])]
        : words
          ? [Number(words[3]), MONTHS.indexOf(words[2].slice(0, 3).toLowerCase()) + 1, Number(words[1])]
          : [0, 0, 0]
      const day = new Date(Date.UTC(y, m - 1, d, 6, 30))
      if (!y || m < 1 || day.getUTCDate() !== d) return json({ error: 'A day, please, as 14 November 2026' }, 400)
      value = day.toISOString()
    } else value = null
  } else if (kind === 'add-ids') {
    // entries (photos) to add to a list of them
    if (!Array.isArray(body.value) || !body.value.every((x) => Number.isInteger(x)) || body.value.length > 500)
      return json({ error: 'Not a list of photos' }, 400)
    value = body.value
  } else if (kind === 'rich') {
    const rich = body.rich as { root?: { children?: unknown } } | undefined
    if (!rich || !Array.isArray(rich.root?.children)) return json({ error: 'Not a text' }, 400)
    value = rich
  } else if (kind === 'number') {
    // a whole number of days; empty clears it
    const raw = typeof body.value === 'string' ? body.value.replace(/days?/i, '').trim() : ''
    if (raw && !/^\d{1,3}$/.test(raw)) return json({ error: 'A number of days, please' }, 400)
    value = raw ? Number(raw) : null
  } else {
    if (typeof body.value !== 'string' || body.value.length > (kind === 'long' ? 6000 : 400)) return json({ error: 'Not a line of text' }, 400)
    value = kind === 'long' ? body.value.replace(/\r\n?/g, '\n').trim() : body.value.replace(/\s+/g, ' ').trim()
  }

  const slug = collection as 'temples'
  const drafts = Boolean(payload.collections[slug]?.config.versions?.drafts)
  try {
    const latest = (await payload.findByID({
      collection: slug,
      id: body.id,
      draft: drafts,
      depth: 0,
      user,
      overrideAccess: false,
    })) as unknown as Record<string, unknown>

    // the field, or its whole list with the one value changed (a row's own
    // list too: "atTemples.0.times.1.time")
    const [top, ...rest] = field.split('.')
    let data: Record<string, unknown>
    if (kind === 'add-ids') {
      const had = ((latest[top] as unknown[]) ?? []).map((r) => (r && typeof r === 'object' ? (r as { id: number }).id : r))
      data = { [top]: [...had, ...(value as number[]).filter((x) => !had.includes(x))] }
    } else if (!rest.length) data = { [top]: value }
    else if (rest[0] === 'new') {
      // a new row at the end of the list ("festivalLengths.new.<festival>.<month or any>")
      // — or, if the festival has a row for it already (added a moment ago,
      // before the page caught up), that row: changed, or taken out if emptied
      const list = [...((latest[top] as Record<string, unknown>[]) ?? [])]
      const month = rest[2] !== 'any' ? rest[2] : undefined
      const festival = Number(rest[1])
      const had = list.findIndex(
        (r) => (typeof r.festival === 'object' ? (r.festival as { id: number }).id : r.festival) === festival && (r.month ?? undefined) === month,
      )
      if (had >= 0) {
        if (value === null) list.splice(had, 1)
        else list[had] = { ...list[had], days: value }
      } else if (value === null) return json({ status: 'published' })
      else list.push({ festival, days: value, ...(month ? { month } : {}) })
      data = { [top]: list }
    } else if (kind === 'number' && value === null && rest.length === 2) {
      // a length emptied: its row taken out (a row needs its number of days)
      const list = [...((latest[top] as unknown[]) ?? [])]
      if (!list[Number(rest[0])]) return json({ error: 'That row is no longer there: reload the page' }, 409)
      list.splice(Number(rest[0]), 1)
      data = { [top]: list }
    } else {
      const list = structuredClone(latest[top]) as unknown
      let node = list as Record<string, unknown> | unknown[] | undefined
      for (const step of rest.slice(0, -1)) {
        node = (node as Record<string, unknown> | undefined)?.[step] as typeof node
        if (!node || typeof node !== 'object') return json({ error: 'That row is no longer there: reload the page' }, 409)
      }
      ;(node as Record<string, unknown>)[rest[rest.length - 1]] = value
      data = { [top]: list }
    }

    const role = (user as { role?: string }).role
    const publish = !drafts || ((role === 'admin' || role === 'editor') && latest._status !== 'draft')
    await payload.update({
      collection: slug,
      id: body.id,
      data: { ...data, ...(drafts && publish ? { _status: 'published' } : {}) } as never,
      draft: drafts && !publish,
      user,
      overrideAccess: false,
    })
    return json({ status: publish ? 'published' : 'draft' })
  } catch (err) {
    payload.logger.error(err, 'Admin2 save')
    return json({ error: err instanceof Error ? err.message : 'Not saved' }, 400)
  }
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } })
