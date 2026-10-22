import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* The old fields, now that each temple's section holds what they did
   (20261022_073543_regular_rituals_at_temples). */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DELETE FROM "weekly_rituals_rels" WHERE "path" = 'temples';
  ALTER TABLE "weekly_rituals_days" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "weekly_rituals_days" CASCADE;
  ALTER TABLE "weekly_rituals_rels" DROP CONSTRAINT "weekly_rituals_rels_temples_fk";
  
  DROP INDEX "weekly_rituals_rels_temples_id_idx";
  ALTER TABLE "weekly_rituals" DROP COLUMN "on";
  ALTER TABLE "weekly_rituals" DROP COLUMN "time";
  ALTER TABLE "weekly_rituals" DROP COLUMN "part_of";
  ALTER TABLE "weekly_rituals" DROP COLUMN "part_of_tamil";
  ALTER TABLE "weekly_rituals" DROP COLUMN "tbc";
  ALTER TABLE "weekly_rituals_rels" DROP COLUMN "temples_id";
  DROP TYPE "public"."enum_weekly_rituals_days";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_weekly_rituals_days" AS ENUM('sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat');
  CREATE TABLE "weekly_rituals_days" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_weekly_rituals_days",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "weekly_rituals" ADD COLUMN "on" varchar;
  ALTER TABLE "weekly_rituals" ADD COLUMN "time" varchar;
  ALTER TABLE "weekly_rituals" ADD COLUMN "part_of" varchar;
  ALTER TABLE "weekly_rituals" ADD COLUMN "part_of_tamil" varchar;
  ALTER TABLE "weekly_rituals" ADD COLUMN "tbc" boolean;
  ALTER TABLE "weekly_rituals_rels" ADD COLUMN "temples_id" integer;
  ALTER TABLE "weekly_rituals_days" ADD CONSTRAINT "weekly_rituals_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."weekly_rituals"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "weekly_rituals_days_order_idx" ON "weekly_rituals_days" USING btree ("order");
  CREATE INDEX "weekly_rituals_days_parent_idx" ON "weekly_rituals_days" USING btree ("parent_id");
  ALTER TABLE "weekly_rituals_rels" ADD CONSTRAINT "weekly_rituals_rels_temples_fk" FOREIGN KEY ("temples_id") REFERENCES "public"."temples"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "weekly_rituals_rels_temples_id_idx" ON "weekly_rituals_rels" USING btree ("temples_id");`)
}
