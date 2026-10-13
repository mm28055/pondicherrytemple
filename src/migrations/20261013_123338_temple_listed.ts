import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "temples" ADD COLUMN "listed" boolean DEFAULT true;
  ALTER TABLE "_temples_v" ADD COLUMN "version_listed" boolean DEFAULT true;`)

  // left off the Temples page: Heritage Town Angala Parameswari, Siddhi Vinayaka and
  // Srinivasa Perumal (in and around Pondicherry). Only this one setting changes.
  await db.execute(sql`
   UPDATE "temples" SET "listed" = false WHERE "slug" IN ('heritage-town-angala-parameswari', 'siddhi-vinayaka', 'srinivasa-perumal');
  UPDATE "_temples_v" SET "version_listed" = false WHERE "parent_id" IN (SELECT "id" FROM "temples" WHERE "slug" IN ('heritage-town-angala-parameswari', 'siddhi-vinayaka', 'srinivasa-perumal'));`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "temples" DROP COLUMN "listed";
  ALTER TABLE "_temples_v" DROP COLUMN "version_listed";`)
}
