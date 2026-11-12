import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* A festival or ritual left out of the temples' Ritual Year from its own page
   in the admin ("Leave out of the temples' Ritual Year", and "Only at these
   temples"), 12 November 2026, instead of ticking each of its dates. New
   columns and tables only: nothing is ticked, so every page stays as it is. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "observances" ADD COLUMN IF NOT EXISTS "not_in_year" boolean;
  ALTER TABLE "_observances_v" ADD COLUMN IF NOT EXISTS "version_not_in_year" boolean;
  CREATE TABLE IF NOT EXISTS "observances_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"temples_id" integer
  );
  CREATE TABLE IF NOT EXISTS "_observances_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"temples_id" integer
  );
  DO $$ BEGIN
    ALTER TABLE "observances_rels" ADD CONSTRAINT "observances_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."observances"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "observances_rels" ADD CONSTRAINT "observances_rels_temples_fk" FOREIGN KEY ("temples_id") REFERENCES "public"."temples"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "_observances_v_rels" ADD CONSTRAINT "_observances_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_observances_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "_observances_v_rels" ADD CONSTRAINT "_observances_v_rels_temples_fk" FOREIGN KEY ("temples_id") REFERENCES "public"."temples"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE INDEX IF NOT EXISTS "observances_rels_order_idx" ON "observances_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "observances_rels_parent_idx" ON "observances_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "observances_rels_path_idx" ON "observances_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "observances_rels_temples_id_idx" ON "observances_rels" USING btree ("temples_id");
  CREATE INDEX IF NOT EXISTS "_observances_v_rels_order_idx" ON "_observances_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_observances_v_rels_parent_idx" ON "_observances_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_observances_v_rels_path_idx" ON "_observances_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_observances_v_rels_temples_id_idx" ON "_observances_v_rels" USING btree ("temples_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE IF EXISTS "observances_rels" CASCADE;
  DROP TABLE IF EXISTS "_observances_v_rels" CASCADE;
  ALTER TABLE "observances" DROP COLUMN IF EXISTS "not_in_year";
  ALTER TABLE "_observances_v" DROP COLUMN IF EXISTS "version_not_in_year";`)
}
