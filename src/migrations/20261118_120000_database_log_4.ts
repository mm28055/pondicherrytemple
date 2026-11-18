import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'
import log from './data/database-log-2026-11-18.json'
import { richText } from './20261031_120500_database_log_2'

/* The third Database Log's entries of 9 to 17 November 2026, Kanda Sashti
   (data/database-log-2026-11-18.json), which settle the names the
   photographs of those days were given before them (20261117_120000):
   - its thirteen field notes, in the site's spellings, with links to the
     Vallala Kottai and Mahishasura Samharam notes and to the day before's;
   - Nakshatra Naal, a ritual named for the first time, a page with its name
     only: Vishwaksena's thirunakshatram at the Perumal Koyil is tagged with
     it in place of the tentative Vishwaksena Jayanti, on the day, its photo
     set and its photographs, and the Vishwaksena Jayanti page deleted;
   - Aippasi Pooradam, a special nakshatram, so the day has its halo on
     every year's calendar;
   - the calendar: each note's occasion at each of its temples, the
     tentative dates renamed and given the note's festivals and rituals, the
     others made; the photo sets of those days each beside its note.
   Only what is not there already, so it can run again. */

type Log = typeof log
const noonIST = (day: string) => `${day}T06:30:00.000Z`

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await databaseLog4Data({ db, payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // what was added is kept: it may have been edited since
}

/** Rich text from the notes' paragraphs, a line break where the
    document had one inside a paragraph (the verses of a song). */
export const withBreaks = (node: any): any => {
  if (Array.isArray(node))
    return node.flatMap((n) =>
      n?.type === 'text' && n.text.includes('\n')
        ? n.text.split('\n').flatMap((text: string, i: number) => [...(i ? [{ type: 'linebreak', version: 1 }] : []), ...(text ? [{ ...n, text }] : [])])
        : [withBreaks(n)],
    )
  if (!node || typeof node !== 'object') return node
  return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, typeof v === 'object' ? withBreaks(v) : v]))
}

// the photo sets of those days, by folder, and the note each goes beside
const SETS: [string, string][] = [
  ['Siva Subramaniaswamy_Lawspet_Pondicherry/2026-11-09_Vighneshvara Puja', '2026-11-09-the-start-of-the-festival-of-murugan'],
  ['Ghousiga Balasubramania Swamy_Pondicherry/2026-11-09_Vighneshvara Puja_Mrtsangrahanam', '2026-11-09-the-start-of-the-festival-of-murugan'],
  ['Ghousiga Balasubramania Swamy_Pondicherry/2026-11-10_Dhvajarohanam_Surya Prabhai_Chandra Prabhai', '2026-11-10-a-camera-happy-temple'],
  ['Vedapuriswara_Pondicherry/2026-11-10_Skanda Sashti Day 1', '2026-11-10-tracking-sashti-on-pratipada-muthal-naal-across-three-temples'],
  ['Siva Subramaniaswamy_Lawspet_Pondicherry/2026-11-10_Skanda Sashti Day 1_Navaveerargal Abhishekam_Dhvajarohanam', '2026-11-10-the-flag-goes-up-on-sashti-muthal-naal'],
  ['Nandhikeswara_Pondicherry/2026-11-11_Skanda Sashti Day 2_Pazhamudircholai Alankaram', '2026-11-11-sashti-dwitiya-or-sashti-irandaam-naal'],
  ['Kāḻattīsvarar Chetty Koyil_Pondicherry/2026-11-11_Skanda Sashti Day 2_Abhishekam', '2026-11-11-sashti-dwitiya-or-sashti-irandaam-naal'],
  ['Ghousiga Balasubramania Swamy_Pondicherry/2026-11-11_Skanda Sashti Day 2_Rishabha_Kamadhenu', '2026-11-11-sashti-dwitiya-or-sashti-irandaam-naal'],
  ['Siva Subramaniaswamy_Lawspet_Pondicherry/2026-11-12_Skanda Sashti Day 3', '2026-11-12-sashti-mundraam-naal-or-sashti-3rd-day'],
  ['Nandhikeswara_Pondicherry/2026-11-12_Skanda Sashti Day 3_Raja Alankaram', '2026-11-12-sashti-mundraam-naal-or-sashti-3rd-day'],
  ['Kāḻattīsvarar Chetty Koyil_Pondicherry/2026-11-12_Skanda Sashti Day 3_PM Purappadu', '2026-11-12-sashti-mundraam-naal-or-sashti-3rd-day'],
  ['Ghousiga Balasubramania Swamy_Pondicherry/2026-11-12_Skanda Sashti Day 3', '2026-11-12-sashti-mundraam-naal-or-sashti-3rd-day'],
  ['Siva Subramaniaswamy_Lawspet_Pondicherry/2026-11-13_Skanda Sashti Day 4_Gajamukhasooran Samharam', '2026-11-13-may-the-battles-begin'],
  // (renamed below: either name, whichever is there)
  ['Nandhikeswara_Pondicherry/2026-11-13_Skanda Sashti Day 4_Mohini Alankaram', '2026-11-13-may-the-battles-begin'],
  ['Nandhikeswara_Pondicherry/2026-11-13_Skanda Sashti Day 4_Veena Alankaram', '2026-11-13-may-the-battles-begin'],
  ['Ghousiga Balasubramania Swamy_Pondicherry/2026-11-13_Skanda Sashti Day 4_Gajamukhasooran Samharam', '2026-11-13-may-the-battles-begin'],
  ['Varadarāja Perumal_Pondicherry/2026-11-14_Vishwaksena Jayanti', '2026-11-14-pooradam-nakshatram'],
  ['Siva Subramaniaswamy_Lawspet_Pondicherry/2026-11-14_Skanda Sashti Day 5_Simhamukhasooran Samharam and Vel Vanguthal', '2026-11-14-the-battle-continues-and-murugan-gets-the-vel'],
  ['Ghousiga Balasubramania Swamy_Pondicherry/2026-11-14_Skanda Sashti Day 5_Simhamukhasooran Samharam', '2026-11-14-the-battle-continues-and-murugan-gets-the-vel'],
  ['Siva Subramaniaswamy_Lawspet_Pondicherry/2026-11-15_Skanda Sashti Day 6_Vajrabahu Spine Climbing and Soorasamharam', '2026-11-15-the-greatest-battle-of-them-all-soora-samharam'],
  ['Ghousiga Balasubramania Swamy_Pondicherry/2026-11-15_Skanda Sashti Day 6_Soorasamharam', '2026-11-15-the-greatest-battle-of-them-all-soora-samharam'],
  ['Ghousiga Balasubramania Swamy_Pondicherry/2026-11-16_Skanda Sashti Day 7_Thirukalyanam', '2026-11-16-three-family-weddings-in-a-single-morning'],
  ['Nandhikeswara_Pondicherry/2026-11-16_Skanda Sashti Day 7_Thirukalyanam', '2026-11-16-three-family-weddings-in-a-single-morning'],
  ['Bhavani Sundara Vinayaka/2026-11-16_Skanda Sashti Day 7_Thirukalyanam', '2026-11-16-three-family-weddings-in-a-single-morning'],
  ['Siva Subramaniaswamy_Lawspet_Pondicherry/2026-11-16_Skanda Sashti Day 7_Thirukalyanam', '2026-11-16-the-sheer-fun-of-the-old-india'],
]
const RENAMED = [
  {
    from: 'Nandhikeswara_Pondicherry/2026-11-13_Skanda Sashti Day 4_Mohini Alankaram',
    to: 'Nandhikeswara_Pondicherry/2026-11-13_Skanda Sashti Day 4_Veena Alankaram',
    title: 'Kanda Sashti Day 4, Veena Alankaram',
  },
]
const NEW_SETS: { folder: string; title: string; date: string; note: string; temple?: string }[] = [
  {
    folder: 'Ghousiga Balasubramania Swamy_Pondicherry/2026-11-17_Skanda Sashti Day 8_pm Purappadu',
    title: 'Kanda Sashti Day 8, PM Purappadu',
    date: '2026-11-17',
    note: '2026-11-17-back-to-lonely-nights-and-long-trails',
    temple: 'ghousika-balasubramaniar',
  },
  {
    folder: 'Siva Subramaniaswamy_Lawspet_Pondicherry/2026-11-17_Skanda Sashti Day 8_Manjal Neer',
    title: 'Kanda Sashti Day 8, Manjal Neer',
    date: '2026-11-17',
    note: '2026-11-17-manjal-neer-utsavam',
    temple: 'siva-subramania-lawspet',
  },
  {
    folder: 'Nandhikeswara_Pondicherry/2026-11-10 Kanda Sashti Day 1_ThirukadaiyurMurugan',
    title: 'Kanda Sashti Day 1, Thiruparankundram Murugan Alankaram',
    date: '2026-11-10',
    note: '2026-11-10-tracking-sashti-on-pratipada-muthal-naal-across-three-temples',
  },
  { folder: 'Nandhikeswara_Pondicherry/2026-11-14 Kanda Sashti Day 5', title: 'Kanda Sashti Day 5', date: '2026-11-14', note: '2026-11-14-the-battle-continues-and-murugan-gets-the-vel' },
  {
    folder: 'Nandhikeswara_Pondicherry/2026-11-15 Kanda Sashti Day 6_Singaravelan',
    title: 'Kanda Sashti Day 6, Singaravelan Alankaram',
    date: '2026-11-15',
    note: '2026-11-15-the-greatest-battle-of-them-all-soora-samharam',
  },
]
const VISHWAKSENA_SET ='Varadarāja Perumal_Pondicherry/2026-11-14_Vishwaksena Jayanti'
const VISHWAKSENA_TITLE = 'Vishwaksena Varuda Thirunakshatra Sattrumurai Utsavam'

export async function databaseLog4Data({ db, payload, req }: Pick<MigrateUpArgs, 'db' | 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const data = log as Log
  const idOf = (r: any): number | undefined => (r == null ? undefined : typeof r === 'object' ? r.id : r)
  const one = async (collection: string, slug: string) =>
    (await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, draft: true, ...quiet } as any)).docs[0] as any
  const setByFolder = async (folder: string) => {
    for (const f of new Set([folder.normalize('NFC'), folder.normalize('NFD'), folder])) {
      const s = (await payload.find({ collection: 'photo-sets', where: { folder: { equals: f } }, limit: 1, joins: false, ...quiet } as any)).docs[0] as any
      if (s) return s
    }
    return undefined
  }
  const town = await one('regions', 'pondicherry')
  const around = await one('regions', 'in-and-around-pondicherry')
  if (!town || !around) return

  // 1. the new ritual
  for (const o of data.observances) {
    if (await one('observances', o.slug)) continue
    await payload.create({
      collection: 'observances',
      data: { name: o.name, kind: o.kind, slug: o.slug, gloss: 'To be written', _status: 'published' },
      draft: false,
      ...quiet,
    } as any)
  }
  const observanceId = new Map<string, number>()
  for (const o of (await payload.find({ collection: 'observances', limit: 0, pagination: false, draft: true, ...quiet } as any)).docs as any[])
    observanceId.set(o.slug, o.id)
  const templeId = new Map<string, number>()
  const templeRegion = new Map<string, number>()
  for (const t of (await payload.find({ collection: 'temples', limit: 0, pagination: false, draft: true, ...quiet } as any)).docs as any[]) {
    templeId.set(t.slug, t.id)
    templeRegion.set(t.slug, idOf(t.region)!)
  }
  const ids = (slugs: string[], map: Map<string, number>, what: string) =>
    slugs.map((s) => {
      const id = map.get(s)
      if (id === undefined) throw new Error(`No ${what} "${s}"`)
      return id
    })
  const regionOf = (temples: string[]) =>
    temples.length && temples.every((t) => templeRegion.get(t) === around.id) ? around.id : town.id

  // 2. the special nakshatram
  for (const s of data.specialNakshatras) {
    const there = await payload.find({ collection: 'special-nakshatras', where: { name: { equals: s.name } }, limit: 1, ...quiet } as any)
    if (!there.docs.length) await payload.create({ collection: 'special-nakshatras', data: s, ...quiet } as any)
  }

  // 3. the field notes
  const noteId = new Map<string, number>()
  for (const n of data.notes) {
    const had = await one('field-notes', n.slug)
    if (had) {
      noteId.set(n.slug, had.id)
      continue
    }
    const doc = await payload.create({
      collection: 'field-notes',
      data: {
        title: n.title,
        date: noonIST(n.date),
        occasion: n.occasion,
        temples: ids(n.temples, templeId, 'temple'),
        observances: ids(n.observances, observanceId, 'festival or ritual'),
        body: withBreaks(richText(n.body as any)) as never,
        slug: n.slug,
        region: regionOf(n.temples),
        _status: 'published',
      },
      draft: false,
      ...quiet,
    } as any)
    noteId.set(n.slug, doc.id)
  }

  // 4. the calendar: the note's occasion at each of its temples; a date
  //    named tentatively (17 November) becomes it
  const vishwaksena = observanceId.get('vishwaksena-jayanti')
  for (const n of data.notes) {
    const fieldNote = noteId.get(n.slug)!
    const tags = ids(n.observances, observanceId, 'festival or ritual')
    for (const temple of ids(n.temples, templeId, 'temple')) {
      const that = (
        await payload.find({
          collection: 'occasions',
          where: { and: [{ date: { equals: noonIST(n.date) } }, { temple: { equals: temple } }] },
          limit: 0,
          pagination: false,
          ...quiet,
        } as any)
      ).docs as any[]
      const day =
        that.find((o) => o.label === n.occasion) ??
        that.find((o) => /^Kanda Sashti|^Vishwaksena Jayanti$/.test(o.label) && !idOf(o.fieldNote))
      if (!day) {
        await payload.create({
          collection: 'occasions',
          data: { date: noonIST(n.date), temple, label: n.occasion, observances: tags, fieldNote },
          ...quiet,
        } as any)
        continue
      }
      const had = ((day.observances ?? []) as any[]).map(idOf).filter((x) => x !== undefined && x !== vishwaksena) as number[]
      const observances = [...new Set([...had, ...tags])]
      if (day.label !== n.occasion || idOf(day.fieldNote) !== fieldNote || observances.join() !== (day.observances ?? []).map(idOf).join())
        await payload.update({ collection: 'occasions', id: day.id, data: { label: n.occasion, observances, fieldNote }, ...quiet } as any)
    }
  }
  // the one tentative date without a note: Kanda Sashti's day 4 at Sundara Vinayaka
  const sv = (
    await payload.find({
      collection: 'occasions',
      where: { and: [{ date: { equals: noonIST('2026-11-13') } }, { label: { equals: 'Kanda Sashti Day 4, Rahu Ketu Peyarchi' } }] },
      limit: 1,
      ...quiet,
    } as any)
  ).docs[0] as any
  if (sv) await payload.update({ collection: 'occasions', id: sv.id, data: { label: 'Kanda Sashti Vizha Day 4: Chaturthi, Rahu Ketu Peyarchi' }, ...quiet } as any)

  // 5. the photo sets beside their notes
  for (const [folder, slug] of SETS) {
    const set = await setByFolder(folder)
    const fieldNote = noteId.get(slug)
    if (!set || !fieldNote) continue
    const title = folder === VISHWAKSENA_SET ? VISHWAKSENA_TITLE : set.title
    if (idOf(set.fieldNote) !== fieldNote || title !== set.title)
      await payload.update({ collection: 'photo-sets', id: set.id, data: { fieldNote, title }, ...quiet } as any)
  }

  // 6. Vishwaksena's photographs: Nakshatra Naal, not the tentative Vishwaksena Jayanti
  const set = await setByFolder(VISHWAKSENA_SET)
  const naal = observanceId.get('nakshatra-naal')
  if (set && vishwaksena && naal) {
    await db.execute(
      sql`DELETE FROM "media_rels" WHERE "path" = 'observances' AND "observances_id" = ${vishwaksena}
          AND "parent_id" IN (SELECT "id" FROM "media" WHERE "set_id" = ${set.id})`,
    )
    await db.execute(
      sql`INSERT INTO "media_rels" ("order", "parent_id", "path", "observances_id")
          SELECT 1000, m."id", 'observances', ${naal} FROM "media" m
          WHERE m."set_id" = ${set.id} AND NOT EXISTS (
            SELECT 1 FROM "media_rels" r WHERE r."parent_id" = m."id" AND r."path" = 'observances' AND r."observances_id" = ${naal})`,
    )
  }

  // 7. the tentative Vishwaksena Jayanti page, now used by nothing, deleted (the user's choice)
  if (vishwaksena) {
    const used = await Promise.all(
      (['occasions', 'field-notes', 'photo-sets', 'media'] as const).map(
        async (collection) => (await payload.count({ collection, where: { observances: { in: [vishwaksena] } }, ...quiet } as any)).totalDocs,
      ),
    )
    if (used.every((n) => n === 0)) await payload.delete({ collection: 'observances', id: vishwaksena, ...quiet } as any)
  }

  // 8. Nandhikeswara's day 4 was the veena alankaram, not Mohini: its folder renamed
  for (const r of RENAMED) {
    if (await setByFolder(r.to)) continue
    const s = await setByFolder(r.from)
    if (s) await payload.update({ collection: 'photo-sets', id: s.id, data: { folder: r.to.normalize('NFC'), title: r.title }, ...quiet } as any)
  }

  // 9. Nandhikeswara's sets of days 1, 5 and 6 and the 17 November sets (photographs uploaded after), and Nandhikeswara's day 6
  const nandhi = templeId.get('nandhikeswara')!
  for (const s of NEW_SETS) {
    const fieldNote = noteId.get(s.note)
    if (!(await setByFolder(s.folder)))
      await payload.create({
        collection: 'photo-sets',
        data: { title: s.title, date: noonIST(s.date), folder: s.folder.normalize('NFC'), temples: [templeId.get(s.temple ?? 'nandhikeswara')!], region: templeRegion.get(s.temple ?? 'nandhikeswara'), ...(fieldNote ? { fieldNote } : {}) },
        ...quiet,
      } as any)
  }
  const day6 = data.notes.find((n) => n.date === '2026-11-15')!
  const there6 = await payload.find({
    collection: 'occasions',
    where: { and: [{ date: { equals: noonIST('2026-11-15') } }, { temple: { equals: nandhi } }] },
    limit: 1,
    ...quiet,
  } as any)
  if (!there6.docs.length)
    await payload.create({
      collection: 'occasions',
      data: {
        date: noonIST('2026-11-15'),
        temple: nandhi,
        label: day6.occasion,
        observances: ids(['brahmotsavam', 'kanda-sashti', 'alankaram'], observanceId, 'festival or ritual'),
        fieldNote: noteId.get(day6.slug),
      },
      ...quiet,
    } as any)

  // 10. Karthikai Masam, a page like Aadi's and Purattasi's (its Mondays), on the month's first entry
  if (!(await one('observances', 'karthikai-masam'))) {
    await payload.create({
      collection: 'observances',
      data: {
        name: 'Karthikai Masam Observances',
        tamil: 'கார்த்திகை மாத அனுஷ்டானங்கள்',
        kind: 'ritual',
        slug: 'karthikai-masam',
        gloss: 'To be written',
        recurs: 'yearly',
        about: [
          {
            question: 'What are the important days of Karthikai Masam?',
            answer: richText(['Mondays: Karthikai Somavaram']) as never,
          },
        ],
        _status: 'published',
      },
      draft: false,
      ...quiet,
    } as any)
  }
  const karthikai = (await one('observances', 'karthikai-masam')).id
  for (const first of data.notes.filter((n) => n.date === '2026-11-17')) {
    const firstNote = noteId.get(first.slug)
    if (!firstNote) continue
    const n = (await payload.findByID({ collection: 'field-notes', id: firstNote, draft: true, ...quiet } as any)) as any
    const tags = ((n.observances ?? []) as any[]).map(idOf)
    if (!tags.includes(karthikai))
      await payload.update({ collection: 'field-notes', id: firstNote, data: { observances: [...tags, karthikai] }, ...quiet } as any)
    for (const o of (await payload.find({ collection: 'occasions', where: { fieldNote: { equals: firstNote } }, limit: 0, pagination: false, ...quiet } as any)).docs as any[]) {
      const had = ((o.observances ?? []) as any[]).map(idOf)
      if (!had.includes(karthikai)) await payload.update({ collection: 'occasions', id: o.id, data: { observances: [...had, karthikai] }, ...quiet } as any)
    }
  }

  payload.logger.info(`Database Log 3, 9 to 17 November: ${data.notes.length} field notes`)
}
