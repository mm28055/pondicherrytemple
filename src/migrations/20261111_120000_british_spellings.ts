import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/* British spellings, 11 November 2026: the few American ones left in the
   field notes and on the About page put right (program(s) → programme(s),
   acknowledgment → acknowledgement, toward → towards, artifact → artefact,
   honored → honoured, meters → metres, movie-style → film-style). Only those
   words change, in the text as it stands on each site; a note or section
   without them is not touched. */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await britishSpellingsData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {}

const WORDS: [RegExp, string][] = [
  [/\bprograms\b/gi, 'programmes'],
  [/\bprogram\b/gi, 'programme'],
  [/\backnowledgments\b/gi, 'acknowledgements'],
  [/\backnowledgment\b/gi, 'acknowledgement'],
  [/\btoward\b/gi, 'towards'],
  [/\bartifacts\b/gi, 'artefacts'],
  [/\bartifact\b/gi, 'artefact'],
  [/\bhonored\b/gi, 'honoured'],
  [/\bmeters\b/gi, 'metres'],
  [/\bmovie-style\b/gi, 'film-style'],
]
// Keeps a capital where the word had one
const keepCase = (found: string, to: string) => (found[0] === found[0].toUpperCase() ? to[0].toUpperCase() + to.slice(1) : to)
const fixText = (s: string) => WORDS.reduce((t, [re, to]) => t.replace(re, (m) => keepCase(m, to)), s)
// Rich text: only the words in its text nodes change
const fixRich = (node: any): any => {
  if (Array.isArray(node)) return node.map(fixRich)
  if (!node || typeof node !== 'object') return node
  const out: any = {}
  for (const [k, v] of Object.entries(node)) out[k] = k === 'text' && typeof v === 'string' ? fixText(v) : fixRich(v)
  return out
}
const same = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b)

export async function britishSpellingsData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>) {
  const changed: string[] = []
  const notes = (
    await payload.find({ collection: 'field-notes', req, overrideAccess: true, depth: 0, limit: 0, pagination: false } as any)
  ).docs as any[]
  for (const n of notes) {
    const body = fixRich(n.body)
    if (same(body, n.body)) continue
    await payload.update({
      collection: 'field-notes',
      id: n.id,
      data: { body },
      req,
      overrideAccess: true,
      depth: 0,
      context: { skipRevalidate: true },
    } as any)
    changed.push(n.slug)
  }
  const about: any = await payload.findGlobal({ slug: 'about-page', depth: 0, req, overrideAccess: true })
  const sections = (about?.sections ?? []).map((s: any) => ({ ...s, body: fixRich(s.body) }))
  if (!same(sections, about?.sections ?? [])) {
    await payload.updateGlobal({
      slug: 'about-page',
      data: { sections } as any,
      req,
      overrideAccess: true,
      depth: 0,
      context: { skipRevalidate: true },
    } as any)
    changed.push('about-page')
  }
  return changed
}
