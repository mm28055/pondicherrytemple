import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/* The Panduranga Bhajanai at Varadaraja Perumal is on Saturdays (8 November
   2026): its few words, which still said "Sunday evenings", now say
   "Saturday evenings", in the entry's and in each temple section's. Only
   that phrase changes; words with no "Sunday evening" in them are left. */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await bhajanSaturdayData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {}

const fix = (s: string | null | undefined) => (s ? s.replace(/\bSunday evening/g, 'Saturday evening') : s)

export async function bhajanSaturdayData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>) {
  const docs = (
    await payload.find({
      collection: 'weekly-rituals',
      req,
      overrideAccess: true,
      depth: 0,
      limit: 0,
      pagination: false,
      where: { what: { equals: 'Panduranga Bhajanai' } },
    } as any)
  ).docs as any[]
  for (const d of docs) {
    const about = fix(d.about)
    const atTemples = (d.atTemples ?? []).map((a: any) => ({ ...a, about: fix(a.about) }))
    const changed = about !== d.about || atTemples.some((a: any, i: number) => a.about !== d.atTemples[i].about)
    if (changed)
      await payload.update({
        collection: 'weekly-rituals',
        id: d.id,
        data: { about, atTemples },
        req,
        overrideAccess: true,
        depth: 0,
        context: { skipRevalidate: true },
      } as any)
  }
}
