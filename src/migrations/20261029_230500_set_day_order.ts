import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* A photo set's place in its day, where a day is divided into several sets
   (collections/PhotoSets, "Place in its day"). Added before the migration
   after it, which makes Thiruvahindrapuram's sets and numbers them. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "photo_sets" ADD COLUMN IF NOT EXISTS "day_order" numeric;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "photo_sets" DROP COLUMN IF EXISTS "day_order";`)
}
