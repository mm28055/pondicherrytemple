import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await ritualYearKindsData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // kept: nothing to undo
}

/* The festivals and rituals the second Database Log added (20261031_120500),
   placed in a temple's Ritual Year as those before them are: a rite within
   other events not listed there (an alankaram, an annadanam, a guru puja);
   what comes every month or every week in the pale panel; the rest once a
   year. They were all "once a year" (the default), so an Alankaram stood in
   the months as though a festival. With them, Vedapuriswara's Aani Utthiram
   (22 June, the Aani Thirumanjanam) tagged as Ghousiga's and Nandhikeswara's
   of that day are, so it is listed by that name and its Tamil, not by its
   abhishekam's. And the Rahu kalam Durga abhishekam's Tamil, which read
   "Durga puja", as its English has it. */
const KINDS: Record<string, { recurs: 'yearly' | 'monthly' | 'weekly' | 'rite'; recursWhen?: string }> = {
  alankaram: { recurs: 'rite' },
  annadanam: { recurs: 'rite' },
  'guru-puja': { recurs: 'rite' },
  mangalasasanam: { recurs: 'rite' },
  'garuda-sevai': { recurs: 'rite' },
  theemidi: { recurs: 'rite' },
  'trishati-puja': { recurs: 'rite' },
  'sedal-vizha': { recurs: 'rite' },
  'uriyadi-utsavam': { recurs: 'rite' },
  'mattaiadi-utsavam': { recurs: 'rite' },
  'alagu-sevai': { recurs: 'rite' },
  balalayam: { recurs: 'rite' },
  'palliyarai-utsavam': { recurs: 'rite' },
  thirupalliyezhucchi: { recurs: 'rite' },
  'periyandavar-utsavam': { recurs: 'rite' },
  'satyanarayana-puja': { recurs: 'monthly', recursWhen: 'Every month, on Pournami' },
  'sankatahara-chaturthi': { recurs: 'monthly', recursWhen: 'Every month, on Theipirai Chaturthi' },
  thiruvonam: { recurs: 'monthly', recursWhen: 'Every month, on Thiruvonam' },
  'kubera-yantra-archanai': { recurs: 'weekly', recursWhen: 'Every Thursday' },
}

// their names in Tamil, as the site spells the others (உற்சவம், ஜெயந்தி, பூஜை); only where none is given yet
const TAMIL: Record<string, string> = {
  'aani-thirumanjanam': 'ஆனித் திருமஞ்சனம்',
  annadanam: 'அன்னதானம்',
  balalayam: 'பாலாலயம்',
  bhaktotsavam: 'பக்தோற்சவம்',
  'gajendra-moksham': 'கஜேந்திர மோட்சம்',
  'garuda-jayanti': 'கருட ஜெயந்தி',
  'garuda-sevai': 'கருட சேவை',
  'guru-puja': 'குரு பூஜை',
  'krishna-jayanti': 'கிருஷ்ண ஜெயந்தி',
  'kubera-yantra-archanai': 'குபேர யந்திர அர்ச்சனை',
  mangalasasanam: 'மங்களாசாசனம்',
  'mangani-thiruvizha': 'மாங்கனித் திருவிழா',
  'mattaiadi-utsavam': 'மட்டையடி உற்சவம்',
  'moola-utsavam': 'மூல உற்சவம்',
  'palliyarai-utsavam': 'பள்ளியறை உற்சவம்',
  pavitrotsavam: 'பவித்ரோற்சவம்',
  'periyandavar-utsavam': 'பெரியாண்டவர் உற்சவம்',
  'purattasi-masam': 'புரட்டாசி மாதம்',
  'sankatahara-chaturthi': 'சங்கடஹர சதுர்த்தி',
  'sapta-kannika-puja': 'சப்த கன்னிகா பூஜை',
  'satyanarayana-puja': 'சத்யநாராயண பூஜை',
  'sedal-vizha': 'செடல் விழா',
  theemidi: 'தீமிதி',
  thiruvonam: 'திருவோணம்',
  'trishati-puja': 'திரிசதி பூஜை',
  'uriyadi-utsavam': 'உறியடி உற்சவம்',
  'vasanta-utsavam': 'வசந்த உற்சவம்',
  'vinayaka-chaturthi': 'விநாயக சதுர்த்தி',
  'vishwakarma-jayanti': 'விஸ்வகர்மா ஜெயந்தி',
}

export async function ritualYearKindsData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const bySlug = async (collection: 'observances' | 'temples', slug: string) =>
    (await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, draft: true, ...quiet } as any)).docs[0] as any
  for (const slug of new Set([...Object.keys(KINDS), ...Object.keys(TAMIL)])) {
    const o = await bySlug('observances', slug)
    if (!o) continue
    const data: Record<string, unknown> = {}
    const kind = KINDS[slug]
    if (kind && (o.recurs !== kind.recurs || (kind.recursWhen && o.recursWhen !== kind.recursWhen))) Object.assign(data, kind)
    if (TAMIL[slug] && !o.tamil) data.tamil = TAMIL[slug]
    if (Object.keys(data).length) await payload.update({ collection: 'observances', id: o.id, data, draft: false, ...quiet } as any)
  }

  // the Rahu kalam Durga abhishekam, in Tamil as it is in English (it read "Durga puja")
  for (const r of (await payload.find({ collection: 'weekly-rituals', limit: 0, pagination: false, ...quiet })).docs as any[]) {
    const at = (r.atTemples ?? []) as any[]
    if (!at.some((a) => a.name === 'Rahu Kala Durga Abhishekam' && a.tamil === 'துர்க்கை பூஜை')) continue
    await payload.update({
      collection: 'weekly-rituals',
      id: r.id,
      data: { atTemples: at.map((a) => (a.name === 'Rahu Kala Durga Abhishekam' && a.tamil === 'துர்க்கை பூஜை' ? { ...a, tamil: 'ராகு கால துர்க்கை அபிஷேகம்' } : a)) },
      ...quiet,
    })
  }

  // Vedapuriswara's Aani Utthiram: its calendar date and its field note, with the Aani Thirumanjanam
  const aani = await bySlug('observances', 'aani-thirumanjanam')
  const temple = await bySlug('temples', 'vedapuriswara')
  if (!aani || !temple) return
  const idOf = (v: any) => (typeof v === 'object' && v ? v.id : v)
  const date = '2026-06-22T06:30:00.000Z'
  for (const o of (await payload.find({ collection: 'occasions', where: { and: [{ date: { equals: date } }, { temple: { equals: temple.id } }, { label: { equals: 'Aani Utthiram' } }] }, limit: 5, ...quiet })).docs as any[]) {
    const tags = (o.observances ?? []).map(idOf)
    if (!tags.includes(aani.id)) await payload.update({ collection: 'occasions', id: o.id, data: { observances: [aani.id, ...tags] }, ...quiet })
  }
  // and its eve (21 June) left out of the Ritual Year, still in the calendar
  for (const o of (await payload.find({ collection: 'occasions', where: { and: [{ date: { equals: '2026-06-21T06:30:00.000Z' } }, { temple: { equals: temple.id } }, { label: { equals: 'Eve of Aani Utthiram' } }] }, limit: 5, ...quiet })).docs as any[])
    if (!o.notInYear) await payload.update({ collection: 'occasions', id: o.id, data: { notInYear: true }, ...quiet })
  const note = (await payload.find({ collection: 'field-notes', where: { slug: { equals: '2026-06-22-a-thirumanjanam-to-mark-a-cosmic-moment' } }, limit: 1, draft: true, ...quiet } as any)).docs[0] as any
  if (note && !(note.observances ?? []).map(idOf).includes(aani.id))
    await payload.update({ collection: 'field-notes', id: note.id, data: { observances: [aani.id, ...(note.observances ?? []).map(idOf)] }, draft: false, ...quiet } as any)
}
