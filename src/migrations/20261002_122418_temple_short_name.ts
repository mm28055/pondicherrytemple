import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "temples" ADD COLUMN "short_name" varchar;
  ALTER TABLE "_temples_v" ADD COLUMN "version_short_name" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "temples" DROP COLUMN "short_name";
  ALTER TABLE "_temples_v" DROP COLUMN "version_short_name";`)
}
