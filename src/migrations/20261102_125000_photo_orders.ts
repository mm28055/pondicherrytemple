import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* The order a festival's, a temple's or a field note's photographs are put in
   by hand, in its photo grid (collections/PhotoOrders, lib/photoOrders). */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "photo_orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"of" varchar NOT NULL,
  	"ids" jsonb NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS "photo_orders_of_idx" ON "photo_orders" USING btree ("of");
  CREATE INDEX IF NOT EXISTS "photo_orders_updated_at_idx" ON "photo_orders" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "photo_orders_created_at_idx" ON "photo_orders" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "photo_orders_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_photo_orders_fk" FOREIGN KEY ("photo_orders_id") REFERENCES "public"."photo_orders"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_photo_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("photo_orders_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_photo_orders_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_photo_orders_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "photo_orders_id";
  DROP TABLE IF EXISTS "photo_orders" CASCADE;`)
}
