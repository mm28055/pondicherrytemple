import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* A temple's ritual day: its kalams, each with its time, what happens and its
   naivedyam (collections/Temples, "The ritual day"), shown as The Day in
   Ritual Cycles. New tables only; nothing already written is touched. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "temples_ritual_day" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kalam" varchar,
  	"tamil" varchar,
  	"time" varchar,
  	"timing_note" varchar,
  	"what_happens" varchar,
  	"naivedyam" varchar
  );
  CREATE TABLE IF NOT EXISTS "_temples_v_version_ritual_day" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kalam" varchar,
  	"tamil" varchar,
  	"time" varchar,
  	"timing_note" varchar,
  	"what_happens" varchar,
  	"naivedyam" varchar,
  	"_uuid" varchar
  );
  DO $$ BEGIN
    ALTER TABLE "temples_ritual_day" ADD CONSTRAINT "temples_ritual_day_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."temples"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "_temples_v_version_ritual_day" ADD CONSTRAINT "_temples_v_version_ritual_day_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_temples_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE INDEX IF NOT EXISTS "temples_ritual_day_order_idx" ON "temples_ritual_day" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "temples_ritual_day_parent_id_idx" ON "temples_ritual_day" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_temples_v_version_ritual_day_order_idx" ON "_temples_v_version_ritual_day" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_temples_v_version_ritual_day_parent_id_idx" ON "_temples_v_version_ritual_day" USING btree ("_parent_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE IF EXISTS "temples_ritual_day" CASCADE;
  DROP TABLE IF EXISTS "_temples_v_version_ritual_day" CASCADE;`)
}
