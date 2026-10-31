import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* A recorded day left out of its temple's Ritual Year, still in the calendar
   (collections/Occasions, "Leave out of the temple's Ritual Year"). Made
   before the migration after it, which ticks it for the eve of Vedapuriswara's
   Aani Utthiram. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "occasions" ADD COLUMN IF NOT EXISTS "not_in_year" boolean;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "occasions" DROP COLUMN IF EXISTS "not_in_year";`)
}
