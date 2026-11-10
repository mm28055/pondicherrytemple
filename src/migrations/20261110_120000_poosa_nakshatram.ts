import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await poosaNakshatramData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the word is kept: it may have been edited since
}

/* "Poosa Nakshatram" in the Dictionary (10 November 2026), its meaning in the
   team's words, approved; "Poosam" and "Poosam Nakshatram" the same word, so
   the two words are marked as one (the longer form wins over "Nakshatram"
   alone). Added only if not there. */
export async function poosaNakshatramData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>) {
  const there = await payload.find({ collection: 'dictionary', where: { word: { equals: 'Poosa Nakshatram' } }, limit: 1, req, overrideAccess: true, depth: 0 })
  if (there.docs.length) return
  await payload.create({
    collection: 'dictionary',
    data: {
      word: 'Poosa Nakshatram',
      alsoWritten: 'Poosam Nakshatram, Poosam',
      meaning: 'One of 27 lunar asterisms; its monthly occurrence is when a Kuberan Yantra Abhishekam is performed at the Kannika Parameswari Koyil.',
      exactCase: false,
      status: 'approved',
    } as any,
    req,
    overrideAccess: true,
    depth: 0,
    context: { skipRevalidate: true },
  })
}
