import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* A recorded day's line below its name in the temple's Ritual Year
   (collections/Occasions, "In the Ritual Year, a line below its name").
   Made before the migration after it, which gives Lawspet Murugan's Alagu
   Sevai its line. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "occasions" ADD COLUMN IF NOT EXISTS "year_note" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "occasions" DROP COLUMN IF EXISTS "year_note";`)
}
