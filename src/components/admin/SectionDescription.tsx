import config from '@payload-config'
import { ViewDescription } from '@payloadcms/ui'
import { getPayload } from 'payload'
import { fieldName, SECTIONS } from '@/payload/descriptions'

/** A section's line of help in the admin, as saved under Admin → Section
    descriptions (or its original text, if that box is empty). */
export async function SectionDescription({ slug }: { slug: string }) {
  const original = SECTIONS.find((s) => s.slug === slug)?.text ?? ''
  let text = original
  try {
    const payload = await getPayload({ config })
    const saved = (await payload.findGlobal({ slug: 'section-descriptions', depth: 0 })) as unknown as Record<string, unknown>
    const value = saved[fieldName(slug)]
    if (typeof value === 'string' && value.trim()) text = value.trim()
  } catch {
    // Not saved yet, or the database is unreachable: the original text will do.
  }
  return text ? <ViewDescription description={text} /> : null
}
