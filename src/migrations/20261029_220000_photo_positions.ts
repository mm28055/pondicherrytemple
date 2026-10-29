import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* A photo's place in its set, as arranged in the set's photo grid in the
   admin (empty: by the time it was taken). */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "position" numeric;`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "media_position_idx" ON "media" USING btree ("position");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX IF EXISTS "media_position_idx";`)
  await db.execute(sql`ALTER TABLE "media" DROP COLUMN IF EXISTS "position";`)
}
