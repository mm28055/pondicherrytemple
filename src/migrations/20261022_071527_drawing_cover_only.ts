import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "drawings" ADD COLUMN "cover_only" boolean DEFAULT false;
  ALTER TABLE "_drawings_v" ADD COLUMN "version_cover_only" boolean DEFAULT false;`)
  // Nandhikeswara Koyil's stack: its diagram on top, standing for the
  // detailed layout, which the pop-up opens onto
  await db.execute(sql`
   UPDATE "drawings" SET "cover_only" = true WHERE "title" ILIKE 'Nandhi Diagrammatic%';
  UPDATE "_drawings_v" SET "version_cover_only" = true
   WHERE "parent_id" IN (SELECT "id" FROM "drawings" WHERE "title" ILIKE 'Nandhi Diagrammatic%');`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "drawings" DROP COLUMN "cover_only";
  ALTER TABLE "_drawings_v" DROP COLUMN "version_cover_only";`)
}
