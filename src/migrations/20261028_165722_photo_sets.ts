import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "photo_sets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"date" timestamp(3) with time zone,
  	"ethos" boolean DEFAULT false,
  	"field_note_id" integer,
  	"folder" varchar,
  	"region_id" integer NOT NULL,
  	"created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "photo_sets_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"temples_id" integer,
  	"observances_id" integer
  );
  
  ALTER TABLE "media" ADD COLUMN "set_id" integer;
  ALTER TABLE "media" ADD COLUMN "taken_at" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "photo_sets_id" integer;
  ALTER TABLE "photo_sets" ADD CONSTRAINT "photo_sets_field_note_id_field_notes_id_fk" FOREIGN KEY ("field_note_id") REFERENCES "public"."field_notes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "photo_sets" ADD CONSTRAINT "photo_sets_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "photo_sets" ADD CONSTRAINT "photo_sets_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "photo_sets_rels" ADD CONSTRAINT "photo_sets_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."photo_sets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "photo_sets_rels" ADD CONSTRAINT "photo_sets_rels_temples_fk" FOREIGN KEY ("temples_id") REFERENCES "public"."temples"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "photo_sets_rels" ADD CONSTRAINT "photo_sets_rels_observances_fk" FOREIGN KEY ("observances_id") REFERENCES "public"."observances"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "photo_sets_date_idx" ON "photo_sets" USING btree ("date");
  CREATE INDEX "photo_sets_field_note_idx" ON "photo_sets" USING btree ("field_note_id");
  CREATE INDEX "photo_sets_region_idx" ON "photo_sets" USING btree ("region_id");
  CREATE INDEX "photo_sets_created_by_idx" ON "photo_sets" USING btree ("created_by_id");
  CREATE INDEX "photo_sets_updated_at_idx" ON "photo_sets" USING btree ("updated_at");
  CREATE INDEX "photo_sets_created_at_idx" ON "photo_sets" USING btree ("created_at");
  CREATE INDEX "photo_sets_rels_order_idx" ON "photo_sets_rels" USING btree ("order");
  CREATE INDEX "photo_sets_rels_parent_idx" ON "photo_sets_rels" USING btree ("parent_id");
  CREATE INDEX "photo_sets_rels_path_idx" ON "photo_sets_rels" USING btree ("path");
  CREATE INDEX "photo_sets_rels_temples_id_idx" ON "photo_sets_rels" USING btree ("temples_id");
  CREATE INDEX "photo_sets_rels_observances_id_idx" ON "photo_sets_rels" USING btree ("observances_id");
  ALTER TABLE "media" ADD CONSTRAINT "media_set_id_photo_sets_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."photo_sets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_photo_sets_fk" FOREIGN KEY ("photo_sets_id") REFERENCES "public"."photo_sets"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_set_idx" ON "media" USING btree ("set_id");
  CREATE INDEX "payload_locked_documents_rels_photo_sets_id_idx" ON "payload_locked_documents_rels" USING btree ("photo_sets_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "photo_sets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "photo_sets_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "photo_sets" CASCADE;
  DROP TABLE "photo_sets_rels" CASCADE;
  ALTER TABLE "media" DROP CONSTRAINT "media_set_id_photo_sets_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_photo_sets_fk";
  
  DROP INDEX "media_set_idx";
  DROP INDEX "payload_locked_documents_rels_photo_sets_id_idx";
  ALTER TABLE "media" DROP COLUMN "set_id";
  ALTER TABLE "media" DROP COLUMN "taken_at";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "photo_sets_id";`)
}
