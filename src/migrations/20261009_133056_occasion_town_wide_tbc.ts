import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "occasions" ALTER COLUMN "temple_id" DROP NOT NULL;
  ALTER TABLE "occasions" ADD COLUMN "tbc" boolean;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "occasions" ALTER COLUMN "temple_id" SET NOT NULL;
  ALTER TABLE "occasions" DROP COLUMN "tbc";`)
}
