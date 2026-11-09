import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // the opening line may now be left empty
  await db.execute(sql`ALTER TABLE "about_page" ALTER COLUMN "lede" DROP NOT NULL;`)
  await aboutOpeningData({ payload, req })
  await aboutHeadingsData({ payload, req })
}

/* And two sections renamed, 9 November 2026: "The project" becomes
   "Sthalam-puranam", then "The temple and the town" becomes "The project".
   Only the headings change (their link names, and their text, stay). Done
   only while the old headings are both there, so it never runs twice. */
export async function aboutHeadingsData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>) {
  const about: any = await payload.findGlobal({ slug: 'about-page', depth: 0, req, overrideAccess: true })
  const sections: any[] = about?.sections ?? []
  const at = (h: string) => sections.findIndex((s) => String(s.heading).trim().toLowerCase() === h)
  const town = at('the temple and the town')
  const project = at('the project')
  if (town < 0 || project < 0) return
  sections[project] = { ...sections[project], heading: 'Sthalam-puranam' }
  sections[town] = { ...sections[town], heading: 'The project' }
  await payload.updateGlobal({
    slug: 'about-page',
    data: { sections } as any,
    req,
    overrideAccess: true,
    depth: 0,
    context: { skipRevalidate: true },
  })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the section's old words are not kept: nothing to put back
}

/* The About page, 9 November 2026: its opening line, as it stands on the site
   it runs on, becomes the text of "The Temple and the Town" (in place of that
   section's text), and the opening line is emptied. Nothing else changes. If
   there is no opening line (already moved), nothing is done. */
export async function aboutOpeningData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>) {
  const about: any = await payload.findGlobal({ slug: 'about-page', depth: 0, req, overrideAccess: true })
  const lede = String(about?.lede ?? '').trim()
  if (!lede) return
  const sections: any[] = about.sections ?? []
  const i = sections.findIndex((s) => String(s.heading).trim().toLowerCase() === 'the temple and the town')
  if (i < 0) throw new Error('About page: no section "The Temple and the Town"')

  const paragraph = (text: string) => ({
    type: 'paragraph',
    version: 1,
    format: '',
    indent: 0,
    direction: 'ltr',
    textFormat: 0,
    textStyle: '',
    children: [{ type: 'text', version: 1, text, format: 0, style: '', mode: 'normal', detail: 0 }],
  })
  const body = {
    root: {
      type: 'root',
      version: 1,
      format: '',
      indent: 0,
      direction: 'ltr',
      children: lede.split(/\n\s*\n/).map((p) => paragraph(p.replace(/\s*\n\s*/g, ' ').trim())),
    },
  }
  sections[i] = { ...sections[i], body }
  await payload.updateGlobal({
    slug: 'about-page',
    data: { lede: null, sections } as any,
    req,
    overrideAccess: true,
    depth: 0,
    context: { skipRevalidate: true },
  })
}
