import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await homeQuoteData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the old words are not kept: nothing to put back
}

/* The home page's dark band, its words as given on 8 November 2026. Only the
   band's words; its link stays as it is. */

const QUOTE =
  'What are the temples’ calendars, rituals, stories? What sustains them, what world do they still hold together? Sthalam records and celebrates it all–the temple priest’s esoteric chants and mudras, the bhaktas’ songs of worship, the jubilant ritual re-enactments of profound debates and great mythic victories on common roadsides, the ways the temples carry them, and from where they stream to suffuse the atmosphere of this seaside town.'

export async function homeQuoteData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>) {
  await payload.updateGlobal({
    slug: 'home-page',
    data: { quote: QUOTE } as any,
    req,
    overrideAccess: true,
    depth: 0,
    context: { skipRevalidate: true },
  })
}
