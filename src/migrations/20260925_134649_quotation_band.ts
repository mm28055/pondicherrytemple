import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_page" ADD COLUMN "quote_label" varchar;
  ALTER TABLE "home_page" ADD COLUMN "quote_link_text" varchar;
  ALTER TABLE "home_page" ADD COLUMN "quote_link" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_page" DROP COLUMN "quote_label";
  ALTER TABLE "home_page" DROP COLUMN "quote_link_text";
  ALTER TABLE "home_page" DROP COLUMN "quote_link";`)
}
