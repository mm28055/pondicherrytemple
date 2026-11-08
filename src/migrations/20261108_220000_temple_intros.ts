import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import INTROS from './data/temple-intros-2026-11-08.json'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await templeIntrosData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the old introductions stay in each temple's version history
}

/* The fifteen temples' introductions, from "Temple Intros Short" (8 November
   2026), in the site's spellings (the language review of 7 November), and the
   coordinates given with them. Each temple's introduction is written over;
   the earlier one stays in its version history. Coordinates are written only
   where the document gives a temple its own: the same pair under Manakkula
   Vinayaka, Vedapuriswara, Varadaraja Perumal and Draupadi Amman is left out,
   and those temples keep what they have. Nothing else on a temple changes. */

const text = (t: string) => ({ mode: 'normal', text: t, type: 'text', style: '', detail: 0, format: 0, version: 1 })
const paragraph = (p: string) => ({
  type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textStyle: '', textFormat: 0, children: [text(p)],
})
const body = (ps: string[]) => ({
  root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: ps.map(paragraph) },
})

export async function templeIntrosData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>) {
  for (const [slug, t] of Object.entries(INTROS as Record<string, { coordinates: number[] | null; intro: string[] }>)) {
    const [doc] = (await payload.find({ collection: 'temples', where: { slug: { equals: slug } }, depth: 0, limit: 1, req, overrideAccess: true })).docs as any[]
    if (!doc) {
      payload.logger.warn(`temple intros: no temple ${slug}`)
      continue
    }
    await payload.update({
      collection: 'temples',
      id: doc.id,
      data: {
        intro: body(t.intro),
        ...(t.coordinates ? { coordinates: { lat: t.coordinates[0], lng: t.coordinates[1] } } : {}),
      } as any,
      req,
      overrideAccess: true,
      depth: 0,
      context: { skipRevalidate: true },
    })
    payload.logger.info(`temple intros: ${slug} written`)
  }
}
