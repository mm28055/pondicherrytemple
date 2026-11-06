import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await homeQuoteData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the old words are not kept: nothing to put back
}

/* The home page's dark band (6 November 2026): its opening words and its link's
   words. Worked from the stored quotation, and only these two fields written;
   where the link goes stays as it is. */
export async function homeQuoteData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>) {
  const home = (await payload.findGlobal({ slug: 'home-page', depth: 0, req, overrideAccess: true })) as any
  await payload.updateGlobal({
    slug: 'home-page',
    data: {
      quote: String(home.quote ?? '').replace('What are their calendars', 'What are the temples’ calendars'),
      quoteLinkText: 'Read about Sthalam',
    } as any,
    req,
    overrideAccess: true,
    depth: 0,
    context: { skipRevalidate: true },
  })
}
