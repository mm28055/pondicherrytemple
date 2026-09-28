import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media_rels" ADD COLUMN "observances_id" integer;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_observances_fk" FOREIGN KEY ("observances_id") REFERENCES "public"."observances"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_rels_observances_id_idx" ON "media_rels" USING btree ("observances_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media_rels" DROP CONSTRAINT "media_rels_observances_fk";
  
  DROP INDEX "media_rels_observances_id_idx";
  ALTER TABLE "media_rels" DROP COLUMN "observances_id";`)
}
