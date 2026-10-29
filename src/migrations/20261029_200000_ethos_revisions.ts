import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await ethosRevisionsData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the revisions are kept: nothing to undo
}

/* Pondicherry's Hindu Ethos revised (29 October 2026): its sets renamed;
   those of one temple each moved to "In and around Pondicherry", the temple
   made for them (Senkazhuneer Amman's four sets under one); and the Goubert
   Market's photographs regrouped, as their folders were, into three sets
   (the photographs moved from the old sets, the same files, none brought
   in again), the old sets removed with the four photographs of 27 June
   not regrouped. With them,
   Thiruvahindrapuram's set given its day and occasion, and Chowdambika's
   moved from Lawspet Murugan's page to hers. Sets matched by
   their folders, photographs by their files: the same here and on this
   computer. Only what is not done already. Exported for this computer's copy
   of the database (scripts). */

const TEMPLES = [
  { slug: 'sudugadu-angalamman', name: 'Sudugadu Angalamman Koyil', shortName: 'Sudugadu Angalamman', deityGroup: 'amman' },
  { slug: 'senkazhuneer-amman', name: 'Senkazhuneer Amman Aalayam', shortName: 'Senkazhuneer Amman', deityGroup: 'amman' },
  { slug: 'goubert-market-vinayaka', name: 'Goubert Market Vinayaka Koyil', shortName: 'Goubert Market Vinayaka', deityGroup: 'vinayaka' },
  { slug: 'govindasalai-mariamman', name: 'Govindasalai Mariamman Koyil', shortName: 'Govindasalai Mariamman', deityGroup: 'amman' },
  { slug: 'putthumariamman-kuruchikuppam', name: 'Putthumariamman Aalayam', shortName: 'Putthumariamman', street: 'Kuruchikuppam', deityGroup: 'amman' },
  { slug: 'gangai-muttumariamman', name: 'Gangai Muttumariamman Koyil', shortName: 'Gangai Muttumariamman', street: 'Kamatchi Amman Kovil St.', deityGroup: 'amman' },
  { slug: 'kasukadai-vinayaka', name: 'Kasukadai Vinayaka Koyil', shortName: 'Kasukadai Vinayaka', deityGroup: 'vinayaka' },
  { slug: 'periyapalayathamman', name: 'Periyapalayathamman Thirukoyil', shortName: 'Periyapalayathamman', deityGroup: 'amman' },
] as const

// a set, by its folder: its new title, and (for one moved) the temple it is now of
const SETS: { folder: string; title: string; temple?: (typeof TEMPLES)[number]['slug'] }[] = [
  { folder: 'other/2026-10-18_Saptami_AM_Bangabharati Durga Pandal', title: 'Bangabharati Durga Pandal, Navaratri Saptami' },
  { folder: 'other/2026-10-17_Panchasana outside Muthialpet Sudugadu', title: 'Panchasana Peetham, Muthialpet Sudugadu' },
  { folder: 'other/2026-10-15_Shankarnarayana Mudaliar Private Golu', title: 'Shankara Narayanan and Family, Golu Mandapam' },
  { folder: 'other/2026-09-20_Vinayaka Parade Visarjan', title: 'Parade and Pandhal Vinayaka Visarjanam' },
  { folder: 'other/2026-09-18_Sudugadu Angalamman visit', title: 'Visit', temple: 'sudugadu-angalamman' },
  { folder: 'other/2026-09-14_Vinayaka Chaturthi Private Visarjanams', title: 'Vinayaka Chaturthi Private Visarjanams, Vaithikuppam' },
  { folder: 'other/2026-08-14_Adi Pooram_Peripalayatthamman', title: 'Adi Pooram', temple: 'periyapalayathamman' },
  { folder: 'other/2026-06-23_Sundara Vinayaka_near Chetty', title: 'Visit', temple: 'kasukadai-vinayaka' },
  { folder: 'other/2026-07-17_Navashakti Karumari Amman _Friday Sedal', title: 'Navashakti Karumari Amman Brahmotsavam Friday Sedal' },
  { folder: 'other/2026-07-24_Senkazhuneer PM ther', title: 'Ther Vizha', temple: 'senkazhuneer-amman' },
  { folder: 'other/2026-07-24_Senkazhuneer Adi Friday2 Sedal', title: 'Sedal Vizha', temple: 'senkazhuneer-amman' },
  { folder: 'other/2026-07-20_Senkazhuneer Purappadu', title: 'Senkazhuneer Amman Veethi Purappadu', temple: 'senkazhuneer-amman' },
  { folder: 'other/2026-05-01_Senkazhuneer Amman_Chithirai Pournami', title: 'Chithirai Pournami', temple: 'senkazhuneer-amman' },
  { folder: 'other/2026-05-02_Govindasalai Mariamman Ther', title: 'Ther', temple: 'govindasalai-mariamman' },
  { folder: 'other/2026-05-01_Chithirai Pournami_Putthumariamman', title: 'Chithirai Pournami', temple: 'putthumariamman-kuruchikuppam' },
  { folder: 'other/2026-04-05 Gangai Mariamman near Kamakshi Amman', title: 'Visit', temple: 'gangai-muttumariamman' },
]

// the Goubert Market's photographs, as regrouped in their folders
const REGROUPED = 'other/Oct 29 reorganisation'
const GOUBERT: { folder: string; title: string; date: string; temple?: (typeof TEMPLES)[number]['slug']; files: string }[] = [
  {
    folder: `${REGROUPED}/2026-07-07 Searching for Damana at Goubert Market link to Field Note 2026-07-07`,
    title: 'Searching for Damana at Goubert Market',
    date: '2026-07-07',
    files: 'DSC_6383 DSC_6387 DSC_6391 DSC_6393 DSC_6398 DSC_6401 DSC_6404 DSC_6408 DSC_6410 DSC_6415 DSC_6422 DSC_6423 DSC_6426 DSC_6428 DSC_6431 DSC_6433 DSC_6436 DSC_6438 DSC_6443 DSC_6445',
  },
  {
    folder: `${REGROUPED}/2026-06-12_Goubert Market Sculptures from Senji Temple link to Field Note 2026-07-07`,
    title: 'Goubert Market Sculptures from Senji Temple',
    date: '2026-06-12',
    files:
      'DSC_4086 DSC_4087 DSC_4088 DSC_4090 DSC_4093 DSC_4095 DSC_4096 DSC_4098 DSC_4099 DSC_4100 DSC_4101 DSC_4102 DSC_4103 DSC_4105 DSC_4106 DSC_4107 DSC_4108 DSC_4109 DSC_4111 DSC_4112 DSC_4113 DSC_4114 DSC_4115 DSC_4116 DSC_4118 DSC_4124 DSC_4125 DSC_4127 DSC_4128 DSC_4129 DSC_4133 DSC_4135 DSC_4139 DSC_4140 DSC_4145 DSC_5582 DSC_5583 DSC_5584 DSC_5585 DSC_5586 DSC_5588 DSC_5589 DSC_5594',
  },
  {
    folder: `${REGROUPED}/2026-07-07 Goubert Market Vinayaka Koyil link to Field Note 2026-07-07`,
    title: 'Visit',
    date: '2026-07-07',
    temple: 'goubert-market-vinayaka',
    files: 'DSC_5595 DSC_5597 DSC_5598 DSC_6363 DSC_6365 DSC_6368 DSC_6369 DSC_6371 DSC_6373 DSC_6374 DSC_6375 DSC_6376 DSC_6377 DSC_6378 DSC_6380 DSC_6419 DSC_6420 DSC_6421',
  },
]
const OLD_GOUBERT = [
  'other/2026-06-12_Goubert Market Sculptures',
  'other/2026-06-27_AM_Damanam Goubert Market and Home',
  'other/2026-07-07_Goubert Market + Damanam',
  'other/2026-07-08_Goubert Market + Damanam and others',
]

const fileKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number))

export async function ethosRevisionsData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const around = (await payload.find({ collection: 'regions', where: { slug: { equals: 'in-and-around-pondicherry' } }, limit: 1, ...quiet })).docs[0]
  const town = (await payload.find({ collection: 'regions', where: { slug: { equals: 'pondicherry' } }, limit: 1, ...quiet })).docs[0]
  if (!around || !town) return

  // the temples, made where not there already
  const templeId: Record<string, number> = {}
  for (const t of TEMPLES) {
    const have = (await payload.find({ collection: 'temples', where: { slug: { equals: t.slug } }, limit: 1, draft: true, ...quiet })).docs[0]
    templeId[t.slug] =
      have?.id ??
      (
        await payload.create({
          collection: 'temples',
          data: { slug: t.slug, name: t.name, knownAs: t.name, shortName: t.shortName, street: 'street' in t ? t.street : undefined, deityGroup: t.deityGroup, region: around.id, listed: true, _status: 'published' },
          draft: false,
          ...quiet,
        } as any)
      ).id
  }

  const setBy = async (folder: string) =>
    (await payload.find({ collection: 'photo-sets', where: { folder: { contains: folder } }, limit: 1, joins: false, ...quiet })).docs[0]

  // renamed, and those of one temple moved to it
  for (const s of SETS) {
    const set = await setBy(s.folder)
    if (!set) continue
    const data: Record<string, unknown> = {}
    if (set.title !== s.title) data.title = s.title
    if (s.temple) {
      const id = templeId[s.temple]
      if (set.ethos) data.ethos = false
      if (!(set.temples ?? []).map(idOf).includes(id)) data.temples = [id]
    }
    if (Object.keys(data).length) await payload.update({ collection: 'photo-sets', id: set.id, data, ...quiet })
  }

  // the Goubert Market's photographs, regrouped: the new sets, and each photograph moved into its own
  const old = (await payload.find({ collection: 'photo-sets', where: { folder: { in: OLD_GOUBERT } }, limit: 10, joins: false, ...quiet })).docs
  const oldIds = old.map((s) => s.id)
  const photos = oldIds.length
    ? (await payload.find({ collection: 'media', where: { set: { in: oldIds } }, limit: 1000, pagination: false, ...quiet })).docs
    : []
  for (const g of GOUBERT) {
    // its day, at midday in India (as the other sets' days are kept)
    const date = `${g.date}T06:30:00.000Z`
    const set =
      (await setBy(g.folder)) ??
      (await payload.create({
        collection: 'photo-sets',
        data: { title: g.title, date, folder: g.folder, ethos: !g.temple, temples: g.temple ? [templeId[g.temple]] : [], region: town.id },
        ...quiet,
      } as any))
    if (set.date && new Date(set.date).toISOString() !== date) await payload.update({ collection: 'photo-sets', id: set.id, data: { date }, ...quiet })
    for (const file of g.files.split(' ')) {
      const key = `-${fileKey(file)}.jpg`
      const photo = photos.find((p) => p.filename?.toLowerCase().endsWith(key))
      if (photo && idOf(photo.set) !== set.id) await payload.update({ collection: 'media', id: photo.id, data: { set: set.id }, ...quiet })
    }
  }
  // Thiruvahindrapuram's set, its day not known (its photographs in a dated
  // folder within its own): the day, and the occasion as it was
  const thiru = await setBy('other/Thiruvahindrapuram')
  const day = '2026-09-22T06:30:00.000Z'
  const occasion = 'Rathnangi Sevai, Desikar Utsavam Conclusion'
  if (thiru && (thiru.title !== occasion || !thiru.date || new Date(thiru.date).toISOString() !== day))
    await payload.update({ collection: 'photo-sets', id: thiru.id, data: { title: occasion, date: day }, ...quiet })
  // Chowdambika's Katthi Poduthal: its photographs were in a folder of Lawspet
  // Murugan's, and so on its page; the folder now its own (in "other"), the set moved to her temple
  const katthi = await setBy('Siva Subramaniaswamy_Lawspet_Pondicherry/2026-08-28_Chowdambika Katthi Poduthal')
  const chowdambika = (await payload.find({ collection: 'temples', where: { slug: { equals: 'veerabhadraswamy-choudambika-amman-koil' } }, limit: 1, draft: true, ...quiet })).docs[0]
  if (katthi && chowdambika)
    await payload.update({
      collection: 'photo-sets',
      id: katthi.id,
      data: { folder: 'other/2026-08-28_Chowdambika Katthi Poduthal', title: 'Katthi Poduthal', temples: [chowdambika.id], ethos: false },
      ...quiet,
    })

  // and the still of Thiruvahindrapuram's film (the Soundscape of the Ratnangi Sevai), its day
  const still = (await payload.find({ collection: 'media', where: { filename: { contains: 'Post14A_Thiruvahindrapuram_Soundscape' }, mimeType: { contains: 'image' } }, limit: 5, ...quiet })).docs
  for (const m of still) if (!m.takenOn) await payload.update({ collection: 'media', id: m.id, data: { takenOn: day }, ...quiet })

  // the old sets removed, and with them the few photographs not regrouped
  // (four of 27 June's: DSC 5599, 5608, 5620 and 5625)
  // (by their files, so a photograph not matched above is never lost; a set
  // removed only once nothing is left in it)
  const NOT_REGROUPED = ['DSC_5599', 'DSC_5608', 'DSC_5620', 'DSC_5625'].map((f) => `-${fileKey(f)}.jpg`)
  for (const s of old) {
    for (const p of photos)
      if (idOf(p.set) === s.id && NOT_REGROUPED.some((k) => p.filename?.toLowerCase().endsWith(k)))
        await payload.delete({ collection: 'media', id: p.id, ...quiet })
    const left = await payload.count({ collection: 'media', where: { set: { equals: s.id } }, overrideAccess: true, req })
    if (!left.totalDocs) await payload.delete({ collection: 'photo-sets', id: s.id, ...quiet })
  }
}
