import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* A recorded day's schedule, what was to happen when (collections/Occasions,
   "The day's schedule"), shown in the calendar's pop-up. Made before the
   migration after it, which brings in the log that fills it. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "occasions_schedule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"time" varchar,
  	"what" varchar
  );
  DO $$ BEGIN
    ALTER TABLE "occasions_schedule" ADD CONSTRAINT "occasions_schedule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."occasions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE INDEX IF NOT EXISTS "occasions_schedule_order_idx" ON "occasions_schedule" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "occasions_schedule_parent_id_idx" ON "occasions_schedule" USING btree ("_parent_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "occasions_schedule" CASCADE;`)
}
