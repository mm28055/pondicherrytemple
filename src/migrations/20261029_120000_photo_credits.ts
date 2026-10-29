import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await photoCreditsData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the credits are kept: nothing to undo
}

/* The photographs not taken by the team, credited to who took them (the
   import gave every photo to Deepa or Arunaditya): Debbie Wastie's four sets
   (at Chetty Koyil, Vedapuriswara, Mutthumariamman and Manakkula Vinayakar),
   and the two of the Chandana Kaappu of 2006 from Sriram Sharma, in
   Angalamman's set of 17 July. Her name taken out of the one set's title
   that carried it after the occasion. Matched by folder and file name, the
   same here and on this computer. Exported for this computer's copy of the
   database (scripts). */
export async function photoCreditsData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const sets = (await payload.find({ collection: 'photo-sets', where: { folder: { contains: 'Debbie Wastie' } }, limit: 100, joins: false, ...quiet })).docs
  if (sets.length)
    await payload.update({ collection: 'media', where: { set: { in: sets.map((s) => s.id) } }, data: { credit: 'Photograph: Debbie Wastie' }, ...quiet })
  await payload.update({
    collection: 'media',
    where: { filename: { contains: 'angala-parameswari-2026-07-17-17-06-2006-chandana-kaappu-from-sriram-sharma' } },
    data: { credit: 'Courtesy Sriram Sharma' },
    ...quiet,
  })
  for (const s of sets)
    if (s.title.endsWith(' Debbie Wastie'))
      await payload.update({ collection: 'photo-sets', id: s.id, data: { title: s.title.replace(/ Debbie Wastie$/, '') }, ...quiet })
}
