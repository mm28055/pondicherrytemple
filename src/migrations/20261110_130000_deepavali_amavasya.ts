import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await deepavaliAmavasyaData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the day is kept: it may have been edited since
}

/* Deepavali Amavasya among the year's great new moons (10 November 2026): the
   Amavasya of Aippasi, circled on every year's calendar like Mahalaya and
   Aadi Amavasya. Added only if not there. */
export async function deepavaliAmavasyaData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>) {
  const there = await payload.find({ collection: 'special-tithis', where: { name: { equals: 'Deepavali Amavasya' } }, limit: 1, req, overrideAccess: true, depth: 0 })
  if (there.docs.length) return
  await payload.create({
    collection: 'special-tithis',
    data: { name: 'Deepavali Amavasya', tamil: 'தீபாவளி அமாவாசை', month: 'aippasi', tithi: 'amavasya' } as any,
    req,
    overrideAccess: true,
    depth: 0,
    context: { skipRevalidate: true },
  })
}
