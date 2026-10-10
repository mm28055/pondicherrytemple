import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_weekly_rituals_days" AS ENUM('sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat');
  CREATE TABLE "weekly_rituals_days" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_weekly_rituals_days",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "weekly_rituals" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"what" varchar NOT NULL,
  	"time" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "weekly_rituals_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"temples_id" integer,
  	"observances_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "weekly_rituals_id" integer;
  ALTER TABLE "weekly_rituals_days" ADD CONSTRAINT "weekly_rituals_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."weekly_rituals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "weekly_rituals_rels" ADD CONSTRAINT "weekly_rituals_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."weekly_rituals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "weekly_rituals_rels" ADD CONSTRAINT "weekly_rituals_rels_temples_fk" FOREIGN KEY ("temples_id") REFERENCES "public"."temples"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "weekly_rituals_rels" ADD CONSTRAINT "weekly_rituals_rels_observances_fk" FOREIGN KEY ("observances_id") REFERENCES "public"."observances"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "weekly_rituals_days_order_idx" ON "weekly_rituals_days" USING btree ("order");
  CREATE INDEX "weekly_rituals_days_parent_idx" ON "weekly_rituals_days" USING btree ("parent_id");
  CREATE INDEX "weekly_rituals_updated_at_idx" ON "weekly_rituals" USING btree ("updated_at");
  CREATE INDEX "weekly_rituals_created_at_idx" ON "weekly_rituals" USING btree ("created_at");
  CREATE INDEX "weekly_rituals_rels_order_idx" ON "weekly_rituals_rels" USING btree ("order");
  CREATE INDEX "weekly_rituals_rels_parent_idx" ON "weekly_rituals_rels" USING btree ("parent_id");
  CREATE INDEX "weekly_rituals_rels_path_idx" ON "weekly_rituals_rels" USING btree ("path");
  CREATE INDEX "weekly_rituals_rels_temples_id_idx" ON "weekly_rituals_rels" USING btree ("temples_id");
  CREATE INDEX "weekly_rituals_rels_observances_id_idx" ON "weekly_rituals_rels" USING btree ("observances_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_weekly_rituals_fk" FOREIGN KEY ("weekly_rituals_id") REFERENCES "public"."weekly_rituals"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_weekly_rituals_id_idx" ON "payload_locked_documents_rels" USING btree ("weekly_rituals_id");`)

  // the first weekly rituals (Varam), their temples found by their slugs
  const temple = async (slug: string) => {
    const found = await payload.find({ collection: 'temples', where: { slug: { equals: slug } }, req, overrideAccess: true, depth: 0, draft: true, limit: 1 })
    return found.docs[0]?.id
  }
  const rituals: { what: string; days: ('sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat')[]; time: string; temples: string[] }[] = [
    { what: 'Durga puja', days: ['tue'], time: '3:30 pm onwards', temples: ['vedapuriswara', 'chetty-koil'] },
    { what: 'Palani Andavar Abhishekam', days: ['tue'], time: 'After 4:30 pm', temples: ['chetty-koil'] },
    { what: 'Thayar Abhishekam', days: ['fri'], time: 'Morning', temples: ['varadaraja-perumal'] },
    { what: 'Thayar Ul-purappadu', days: ['fri'], time: '5 pm', temples: ['varadaraja-perumal'] },
    { what: 'Lalita Trishati Archanai and Parashakti Ul-purappadu', days: ['fri'], time: 'After 7:30 pm', temples: ['chetty-koil'] },
    { what: 'Bhairava Abhishekam', days: ['sun'], time: 'After 7:30 pm', temples: ['chetty-koil'] },
  ]
  for (const r of rituals) {
    const temples = (await Promise.all(r.temples.map(temple))).filter((id) => id !== undefined)
    if (!temples.length) continue
    await payload.create({
      collection: 'weekly-rituals',
      data: { ...r, temples },
      req,
      overrideAccess: true,
      depth: 0,
      context: { skipRevalidate: true },
    })
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "weekly_rituals_days" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "weekly_rituals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "weekly_rituals_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "weekly_rituals_days" CASCADE;
  DROP TABLE "weekly_rituals" CASCADE;
  DROP TABLE "weekly_rituals_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_weekly_rituals_fk";
  
  DROP INDEX "payload_locked_documents_rels_weekly_rituals_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "weekly_rituals_id";
  DROP TYPE "public"."enum_weekly_rituals_days";`)
}
