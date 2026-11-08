import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* Films: "At the top of the Films page" (collections/Films, "top"), a
   film shown beside that page's opening words. One new column, in the films
   and their saved versions; nothing already written is touched. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "films" ADD COLUMN IF NOT EXISTS "top" boolean DEFAULT false;
  ALTER TABLE "_films_v" ADD COLUMN IF NOT EXISTS "version_top" boolean DEFAULT false;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "films" DROP COLUMN IF EXISTS "top";
  ALTER TABLE "_films_v" DROP COLUMN IF EXISTS "version_top";`)
}
