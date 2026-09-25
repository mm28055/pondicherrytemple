import type { Payload } from 'payload'

type Ref = { slug?: string | null } | number | string | null | undefined
const slugOf = (ref: Ref) => (ref && typeof ref === 'object' ? ref.slug : undefined)

/** Where a piece of content lives on the site — for the admin's Preview button. */
export async function pathFor(payload: Payload, collection: string, id: string): Promise<string | null> {
  const find = (c: string) =>
    payload
      .findByID({ collection: c as 'temples', id, draft: true, depth: 1, overrideAccess: true, joins: false })
      .catch(() => null) as Promise<Record<string, unknown> | null>

  const doc = await find(collection)
  if (!doc) return null
  const region = slugOf(doc.region as Ref) ?? 'pondicherry'
  const first = (key: string) => slugOf((doc[key] as Ref[] | undefined)?.[0])

  switch (collection) {
    case 'temples':
      return `/${region}/${doc.slug}`
    case 'observances':
      return `/festivals-and-rituals/${doc.slug}`
    case 'field-notes':
      return `/field-notes/${doc.slug}`
    case 'articles':
      return `/articles/${doc.slug}`
    case 'films':
      return `/films/${doc.slug}`
    case 'books':
      return `/${region}/book`
    case 'drawings':
    case 'temple-pieces': {
      const temple = first('temples')
      if (temple) return `/${region}/${temple}`
      const observance = first('observances')
      return observance ? `/festivals-and-rituals/${observance}` : '/'
    }
    default:
      return null
  }
}
