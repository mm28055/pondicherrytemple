import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await nandhikeswaraAddressesData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the addresses are kept: the old ones lead to the new (next.config)
}

/* Nandhikeswara, spelled so in its web addresses too: the temple's
   (/pondicherry/nandhikeswara) and its field notes'
   (/field-notes/2026-05-13-nandhikeswara-koyil-visit). The old addresses
   lead to the new ones (next.config), so links to them keep working.
   Exported for this computer's copy of the database (scripts). */
export async function nandhikeswaraAddressesData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  for (const collection of ['temples', 'field-notes'] as const) {
    const { docs } = await payload.find({ collection, where: { slug: { contains: 'nandikeswara' } }, limit: 1000, draft: true, ...quiet })
    for (const doc of docs) {
      const slug = doc.slug!.replace(/(^|-)nandikeswara(?=-|$)/, '$1nandhikeswara')
      if (slug === doc.slug) continue
      await payload.update({ collection, id: doc.id, data: { slug }, draft: doc._status === 'draft', ...quiet })
      payload.logger.info(`addresses: ${collection} ${doc.slug} → ${slug}`)
    }
  }
}
