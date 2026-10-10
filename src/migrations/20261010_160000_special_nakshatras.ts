import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_special_nakshatras_month" AS ENUM('chithirai', 'vaikasi', 'aani', 'aadi', 'aavani', 'purattasi', 'aippasi', 'karthigai', 'margazhi', 'thai', 'masi', 'panguni');
  CREATE TYPE "public"."enum_special_nakshatras_nakshatram" AS ENUM('Asvini', 'Bharani', 'Karthikai', 'Rohini', 'Mrigashirsham', 'Thiruvathirai', 'Punarpoosam', 'Poosam', 'Ayilyam', 'Makam', 'Pooram', 'Uthiram', 'Hastham', 'Chithirai', 'Swathi', 'Visakam', 'Anusham', 'Kettai', 'Moolam', 'Pooradam', 'Uthiradam', 'Tiruvonam', 'Avittam', 'Sadhayam', 'Poorattadhi', 'Uthirattadhi', 'Revathi');
  CREATE TABLE "special_nakshatras" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"month" "enum_special_nakshatras_month" NOT NULL,
  	"nakshatram" "enum_special_nakshatras_nakshatram" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "special_nakshatras_id" integer;
  CREATE INDEX "special_nakshatras_updated_at_idx" ON "special_nakshatras" USING btree ("updated_at");
  CREATE INDEX "special_nakshatras_created_at_idx" ON "special_nakshatras" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_special_nakshatras_fk" FOREIGN KEY ("special_nakshatras_id") REFERENCES "public"."special_nakshatras"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_special_nakshatras_id_idx" ON "payload_locked_documents_rels" USING btree ("special_nakshatras_id");`)

  // the special nakshatrams set on localhost
  const rules = [
    { name: 'Chithirai Thiruvonam', month: 'chithirai', nakshatram: 'Tiruvonam' },
    { name: 'Aani Uthiram', month: 'aani', nakshatram: 'Uthiram' },
    { name: 'Margazhi Thiruvathirai', month: 'margazhi', nakshatram: 'Thiruvathirai' },
  ] as const
  for (const data of rules)
    await payload.create({ collection: 'special-nakshatras', data, req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } })
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "special_nakshatras" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "special_nakshatras" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_special_nakshatras_fk";
  
  DROP INDEX "payload_locked_documents_rels_special_nakshatras_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "special_nakshatras_id";
  DROP TYPE "public"."enum_special_nakshatras_month";
  DROP TYPE "public"."enum_special_nakshatras_nakshatram";`)
}
