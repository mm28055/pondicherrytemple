import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await aboutCentreTeamData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the old words are not kept: nothing to put back
}

/* 9 November 2026: the home page's dark band in new words; on the About
   page a new section, "The Centre" (link name "centre", shown just before
   the team), T. Ganesan's role and few words, a fifth person (Manish
   Maheshwari), and the contact's words. Everything else as it is on the
   site where it runs. The section and the person are added only if not
   there already, so it never adds them twice. */

const QUOTE =
  'What are the temples’ calendars, rituals, stories? What sustains them, what world do they still hold together? Sthalam records and celebrates the temple — the place where a town keeps its hopes, the histories of its communities, and its songs and arts.'

const CENTRE =
  'Sthalam is a project of the Centre for Shaiva Studies, a research institute in Pondicherry for the study of the Shaiva traditions, founded in May 2022. The Centre prepares critical editions of Shaiva texts (the first volume of the Kamikagama appeared in 2025) and trains scholars in textual, manuscript and epigraphic study. It also documents Shaivism as it is lived today: its temple traditions, rituals and devotional practices.'

const GANESAN = {
  role: 'Advisor',
  bio: 'Senior Shaiva scholar. Academic Director of the Centre for Shaiva Studies. Guides the team on the Shaiva Agamas, their philosophy and rituals.',
}

const MANISH = {
  name: 'Manish Maheshwari',
  role: 'Founder',
  bio: 'Founding Director of the Centre for Shaiva Studies and of the Tattva Heritage Foundation. Set Sthalam in motion and guides its work. Earlier initiated Heritage Temples, mapping the pre-modern temples of Pune region.',
}

const CONTACT =
  'If you know one of these temples well, or if you have memories, photographs or documents of them, we would be glad to hear from you. If you want to contribute articles or document temples from your town write to us.'

const body = (p: string) => ({
  root: {
    type: 'root', format: '', indent: 0, version: 1, direction: 'ltr',
    children: [{
      type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textStyle: '', textFormat: 0,
      children: [{ mode: 'normal', text: p, type: 'text', style: '', detail: 0, format: 0, version: 1 }],
    }],
  },
})

export async function aboutCentreTeamData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>) {
  const about: any = await payload.findGlobal({ slug: 'about-page', depth: 0, req, overrideAccess: true })

  const sections: any[] = about?.sections ?? []
  if (!sections.some((s) => s.anchor === 'centre' || String(s.heading).trim().toLowerCase() === 'the centre'))
    sections.push({ heading: 'The Centre', anchor: 'centre', body: body(CENTRE) })

  const team: any[] = (about?.team ?? []).map((p: any) =>
    /ganesan/i.test(p.name) ? { ...p, ...GANESAN } : p,
  )
  if (!team.some((p) => /maheshwari/i.test(p.name))) team.push(MANISH)

  await payload.updateGlobal({
    slug: 'about-page',
    data: { sections, team, contactText: CONTACT } as any,
    req,
    overrideAccess: true,
    depth: 0,
    context: { skipRevalidate: true },
  })
  await payload.updateGlobal({
    slug: 'home-page',
    data: { quote: QUOTE } as any,
    req,
    overrideAccess: true,
    depth: 0,
    context: { skipRevalidate: true },
  })
}
