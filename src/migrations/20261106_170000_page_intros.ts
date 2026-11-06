import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { SECTION_INTROS } from '../payload/sectionIntros'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await pageIntrosData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the old words are not kept: nothing to put back
}

/* New opening words (6 November 2026): Field Notes, Articles and Films in the
   Section descriptions, and the Temples page's in its region. Only these four
   are written; everything else in those records stays as it is. */
const TEMPLES_INTRO = [
  "Pondicherry has 250 or more temples. Since March 2026 we have been following fifteen of them through a full ritual year — large and small, old foundations and recent ones, great temples and the street shrines, the theruvu koils, set among the town's shops. What you see here is provisional: our running field notes which are our live work, research on temple histories and utsavams still in progress, still being written and finessed. The writings we offer are by no means finished or complete.",
  "Each temple's page grows as the year goes on: the festivals and rituals we have been present for, the field notes written there, and in time an illustrated plan of the temple. Follow our work as you would a story still collecting itself, unfolding, and finding its own denouement.",
]

const paragraph = (text: string) => ({
  type: 'paragraph',
  version: 1,
  format: '',
  indent: 0,
  direction: 'ltr',
  textFormat: 0,
  children: [{ type: 'text', version: 1, text, format: 0, style: '', mode: 'normal', detail: 0 }],
})

export async function pageIntrosData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>) {
  const context = { skipRevalidate: true }
  const text = (name: string) => SECTION_INTROS.find((s) => s.name === name)!.text
  await payload.updateGlobal({
    slug: 'section-descriptions',
    data: { fieldNotes: text('fieldNotes'), articles: text('articles'), films: text('films') },
    req,
    overrideAccess: true,
    depth: 0,
    context,
  })
  const { docs } = await payload.find({ collection: 'regions', where: { slug: { equals: 'pondicherry' } }, limit: 1, depth: 0, req, overrideAccess: true })
  const region = docs[0] as any
  if (!region) return
  await payload.update({
    collection: 'regions',
    id: region.id,
    data: { intro: { root: { ...region.intro.root, children: TEMPLES_INTRO.map(paragraph) } } } as any,
    req,
    overrideAccess: true,
    depth: 0,
    context,
  })
}
