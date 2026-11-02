import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* The home page's "Show the headline in italics" taken out of the admin
   (globals/HomePage): the reading face, Baloo 2, has no italic, and nothing
   on the site is slanted. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "home_page" DROP COLUMN IF EXISTS "headline_italic";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "home_page" ADD COLUMN IF NOT EXISTS "headline_italic" boolean DEFAULT true;`)
}
