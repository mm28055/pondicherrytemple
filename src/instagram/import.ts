import type { Payload } from 'payload'
import { toLexical } from '../seed/lexical'

/* Brings the Centre's Instagram videos into the admin as DRAFT films — one
   film per post, its video copied into our own files, so it plays on the
   site and stays even if Instagram changes. Posts without a video are passed
   over.

   Nothing is published: each film waits, marked "awaiting review", for
   someone to check its title, temples, festivals and consent. Temples and
   festivals named in the caption are ticked as a first guess.

   Runs every morning (src/app/(payload)/next/instagram/route.ts) and on
   demand with `npm run instagram`. It uses the access key saved in the
   admin (Settings → Instagram) and renews it, so the key never runs out. */

const API = 'https://graph.instagram.com'

type Child = { id: string; media_type: 'IMAGE' | 'VIDEO'; media_url?: string; thumbnail_url?: string }
type Post = Omit<Child, 'media_type'> & {
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  caption?: string
  permalink: string
  timestamp: string
  children?: { data: Child[] }
}

const options = { overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const

async function get<T>(path: string, token: string, params: Record<string, string> = {}): Promise<T> {
  const url = path.startsWith('http') ? new URL(path) : new URL(path, API)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  if (!url.searchParams.has('access_token')) url.searchParams.set('access_token', token)
  const res = await fetch(url)
  const body = (await res.json()) as T & { error?: { message?: string } }
  if (!res.ok || body.error) throw new Error(`Instagram said: ${body.error?.message ?? res.statusText}`)
  return body
}

/** Letters only, doubled letters made single: "Manakkula" and "#manakula" both become "manakula". */
const squash = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z]/g, '')
    .replace(/(.)\1+/g, '$1')

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** The caption's first line, without hashtags or mentions, as a title. */
function titleOf(caption: string, date: string): string {
  const line =
    caption
      .split('\n')
      .map((l) => l.replace(/[#@][\p{L}\p{N}_.]+/gu, '').replace(/\s+/g, ' ').trim())
      .find((l) => /\p{L}{3}/u.test(l)) ?? ''
  if (!line) return `Instagram, ${new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })}`
  return line.length > 90 ? line.slice(0, 90).replace(/\s+\S*$/, '') + '…' : line
}

/** Which temples and festivals the caption names — a first guess for the reviewer. */
async function guessTags(payload: Payload) {
  const skip = new Set(['sri', 'shri', 'arulmigu'])
  const temples = (await payload.find({ collection: 'temples', pagination: false, ...options })).docs.map((t) => ({
    id: t.id,
    keys: [
      t.name.split(/\s+/).find((w) => !skip.has(w.toLowerCase()) && w.length >= 6),
      t.knownAs,
    ]
      .filter((k): k is string => Boolean(k))
      .map(squash),
  }))
  const observances = (await payload.find({ collection: 'observances', pagination: false, ...options })).docs.map(
    (o) => ({ id: o.id, keys: [o.name, o.alsoKnownAs].filter((k): k is string => Boolean(k)).map(squash), tamil: o.tamil })
  )
  return (caption: string) => {
    const text = squash(caption)
    return {
      temples: temples.filter((t) => t.keys.some((k) => k.length >= 5 && text.includes(k))).map((t) => t.id),
      observances: observances
        .filter((o) => o.keys.some((k) => k.length >= 5 && text.includes(k)) || (o.tamil && caption.includes(o.tamil)))
        .map((o) => o.id),
    }
  }
}

async function download(payload: Payload, url: string, name: string, data: Record<string, unknown>) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Could not download ${name} (${res.status})`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const mimetype = res.headers.get('content-type')?.split(';')[0] || (name.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg')
  const doc = await payload.create({
    collection: 'media',
    data: { consent: 'not-needed', ...data },
    file: { data: buffer, mimetype, name, size: buffer.length },
    ...options,
  })
  return doc.id
}

export type ImportResult = { added: number; left: number; message: string }

/** Brings in posts not seen before — at most `max` per run, oldest first. */
export async function importInstagram(payload: Payload, { max = Infinity } = {}): Promise<ImportResult> {
  const settings = await payload.findGlobal({ slug: 'instagram', ...options })
  let token = settings.token?.trim()
  const finish = async (message: string, extra: Record<string, unknown> = {}, added = 0, left = 0) => {
    await payload.updateGlobal({ slug: 'instagram', data: { lastRun: new Date().toISOString(), lastResult: message, ...extra }, ...options })
    payload.logger.info(`Instagram: ${message}`)
    return { added, left, message }
  }
  if (!token) return finish('No access key yet — paste one in Settings → Instagram.')

  try {
    // The key lasts 60 days; renewing it (at most once a day) keeps it going.
    const renewed = settings.tokenRenewed ? Date.parse(settings.tokenRenewed) : 0
    if (Date.now() - renewed > 24 * 3600 * 1000) {
      try {
        const r = await get<{ access_token: string }>('/refresh_access_token', token, { grant_type: 'ig_refresh_token' })
        token = r.access_token
        await payload.updateGlobal({ slug: 'instagram', data: { token, tokenRenewed: new Date().toISOString() }, ...options })
      } catch (e) {
        payload.logger.warn(`Instagram: could not renew the key (${(e as Error).message})`)
      }
    }

    const me = await get<{ username: string; name?: string }>('/me', token, { fields: 'username,name' })
    const author = me.name || `@${me.username}`

    // Every post, newest first, page by page.
    const posts: Post[] = []
    let next: string | undefined = '/me/media'
    const fields =
      'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{id,media_type,media_url,thumbnail_url}'
    while (next) {
      const page: { data: Post[]; paging?: { next?: string } } = await get(next, token, next.startsWith('http') ? {} : { fields, limit: '50' })
      posts.push(...page.data)
      next = page.paging?.next
    }

    const imported = new Set(Array.isArray(settings.imported) ? (settings.imported as string[]) : [])
    const fresh = posts.filter((p) => !imported.has(p.id)).reverse()
    const tagsFor = await guessTags(payload)
    const batch = fresh.slice(0, max)
    let added = 0

    for (const post of batch) {
      const caption = post.caption ?? ''
      const date = post.timestamp
      const credit = `Instagram: @${me.username}`
      const parts: Child[] =
        post.media_type === 'CAROUSEL_ALBUM' ? (post.children?.data ?? []) : [{ ...post, media_type: post.media_type }]
      // Films only: the first video in the post. Photo posts are passed over.
      // (media_url is missing when Instagram won't share it, e.g. copyrighted music.)
      const index = parts.findIndex((p) => p.media_type === 'VIDEO' && p.media_url)
      if (index >= 0) {
        const part = parts[index]
        const name = `instagram-${post.id}${parts.length > 1 ? `-${index + 1}` : ''}`
        const poster = part.thumbnail_url
          ? await download(payload, part.thumbnail_url, `${name}-still.jpg`, { alt: 'Still from the film', credit })
          : undefined
        const video = await download(payload, part.media_url!, `${name}.mp4`, { caption: titleOf(caption, date), credit, poster })

        const guess = tagsFor(caption)
        const paragraphs = caption.split(/\n\s*\n|\n/).map((p) => p.trim()).filter(Boolean).map(escape)
        await payload.create({
          collection: 'films',
          draft: true,
          data: {
            _status: 'draft',
            title: titleOf(caption, date),
            date,
            madeBy: author,
            video,
            temples: guess.temples,
            observances: guess.observances,
            body: paragraphs.length ? (toLexical(paragraphs) as never) : undefined,
            instagram: { postId: post.id, link: post.permalink },
            review: {
              status: 'awaiting',
              note: 'From Instagram — check the title, temples, festivals and consent before publishing.',
            },
          },
          ...options,
        })
        added++
      }
      imported.add(post.id)
      // Saved after each post, so an interrupted run never brings one in twice.
      await payload.updateGlobal({ slug: 'instagram', data: { imported: [...imported] }, ...options })
    }

    const left = fresh.length - batch.length
    const message =
      `@${me.username}: ${posts.length} posts on Instagram; ${added} new films brought in as drafts` +
      (left ? `, ${left} more next time.` : '.')
    return finish(message, { account: `@${me.username}` }, added, left)
  } catch (e) {
    return finish(`Stopped: ${(e as Error).message}`)
  }
}
