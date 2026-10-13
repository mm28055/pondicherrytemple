import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "drawings" ADD COLUMN "layout_order" numeric;
  ALTER TABLE "_drawings_v" ADD COLUMN "version_layout_order" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "drawings" DROP COLUMN "layout_order";
  ALTER TABLE "_drawings_v" DROP COLUMN "version_layout_order";`)
}
