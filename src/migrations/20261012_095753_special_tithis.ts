import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_special_nakshatras_icon" AS ENUM('nataraja');
  CREATE TYPE "public"."enum_special_tithis_month" AS ENUM('chithirai', 'vaikasi', 'aani', 'aadi', 'aavani', 'purattasi', 'aippasi', 'karthigai', 'margazhi', 'thai', 'masi', 'panguni');
  CREATE TYPE "public"."enum_special_tithis_tithi" AS ENUM('vinayaka-chaturthi', 'panchami-s', 'shashti', 'pradosham-s', 'chaturdashi-s', 'pournami', 'sankatahara-chaturthi', 'panchami-k', 'ashtami-k', 'pradosham-k', 'shivaratri', 'amavasya');
  CREATE TYPE "public"."enum_special_tithis_nakshatram" AS ENUM('Asvini', 'Bharani', 'Karthikai', 'Rohini', 'Mrigashirsham', 'Thiruvathirai', 'Punarpoosam', 'Poosam', 'Ayilyam', 'Makam', 'Pooram', 'Uthiram', 'Hastham', 'Chithirai', 'Swathi', 'Visakam', 'Anusham', 'Kettai', 'Moolam', 'Pooradam', 'Uthiradam', 'Tiruvonam', 'Avittam', 'Sadhayam', 'Poorattadhi', 'Uthirattadhi', 'Revathi');
  CREATE TYPE "public"."enum_special_tithis_icon" AS ENUM('nataraja');
  CREATE TABLE "special_tithis" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"tamil" varchar,
  	"month" "enum_special_tithis_month" NOT NULL,
  	"tithi" "enum_special_tithis_tithi" NOT NULL,
  	"nakshatram" "enum_special_tithis_nakshatram",
  	"replace_icon" boolean,
  	"icon" "enum_special_tithis_icon",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "special_nakshatras" ADD COLUMN "replace_icon" boolean;
  ALTER TABLE "special_nakshatras" ADD COLUMN "icon" "enum_special_nakshatras_icon";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "special_tithis_id" integer;
  CREATE INDEX "special_tithis_updated_at_idx" ON "special_tithis" USING btree ("updated_at");
  CREATE INDEX "special_tithis_created_at_idx" ON "special_tithis" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_special_tithis_fk" FOREIGN KEY ("special_tithis_id") REFERENCES "public"."special_tithis"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_special_tithis_id_idx" ON "payload_locked_documents_rels" USING btree ("special_tithis_id");`)

  // the year's great days, to begin with (more can be added in the admin)
  const rules = [
    { name: 'Chithirai Pournami', tamil: 'சித்திரை பௌர்ணமி', month: 'chithirai', tithi: 'pournami' },
    { name: 'Aadi Pournami', tamil: 'ஆடி பௌர்ணமி', month: 'aadi', tithi: 'pournami' },
    { name: 'Karthigai Deepam', tamil: 'கார்த்திகை தீபம்', month: 'karthigai', tithi: 'pournami', nakshatram: 'Karthikai' },
    { name: 'Thai Pusam', tamil: 'தைப்பூசம்', month: 'thai', tithi: 'pournami', nakshatram: 'Poosam' },
    { name: 'Masi Magam', tamil: 'மாசி மகம்', month: 'masi', tithi: 'pournami', nakshatram: 'Makam' },
    { name: 'Aadi Amavasai', tamil: 'ஆடி அமாவாசை', month: 'aadi', tithi: 'amavasya' },
    { name: 'Mahalaya Amavasai', tamil: 'மஹாளய அமாவாசை', month: 'purattasi', tithi: 'amavasya' },
    { name: 'Karthigai Amavasai', tamil: 'கார்த்திகை அமாவாசை', month: 'karthigai', tithi: 'amavasya' },
    { name: 'Thai Amavasai', tamil: 'தை அமாவாசை', month: 'thai', tithi: 'amavasya' },
    { name: 'Mahachaturthi', tamil: 'மகா சதுர்த்தி', month: 'aavani', tithi: 'vinayaka-chaturthi' },
    { name: 'Mahashivaratri', tamil: 'மகா சிவராத்திரி', month: 'masi', tithi: 'shivaratri' },
    { name: 'Aavani Chaturdashi', tamil: 'ஆவணி சதுர்த்தசி', month: 'aavani', tithi: 'chaturdashi-s', replaceIcon: true, icon: 'nataraja' },
    { name: 'Purattasi Chaturdashi', tamil: 'புரட்டாசி சதுர்த்தசி', month: 'purattasi', tithi: 'chaturdashi-s', replaceIcon: true, icon: 'nataraja' },
    { name: 'Masi Chaturdashi', tamil: 'மாசி சதுர்த்தசி', month: 'masi', tithi: 'chaturdashi-s', replaceIcon: true, icon: 'nataraja' },
  ] as const
  for (const data of rules)
    await payload.create({ collection: 'special-tithis', data, req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } })

  // Nataraja's days, shown by his icon: the special nakshatrams kept for him
  for (const [month, nakshatram] of [['chithirai', 'Tiruvonam'], ['aani', 'Uthiram'], ['margazhi', 'Thiruvathirai']] as const)
    await payload.update({
      collection: 'special-nakshatras',
      where: { and: [{ month: { equals: month } }, { nakshatram: { equals: nakshatram } }] },
      data: { replaceIcon: true, icon: 'nataraja' },
      req,
      overrideAccess: true,
      depth: 0,
      context: { skipRevalidate: true },
    })

}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "special_tithis" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "special_tithis" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_special_tithis_fk";
  
  DROP INDEX "payload_locked_documents_rels_special_tithis_id_idx";
  ALTER TABLE "special_nakshatras" DROP COLUMN "replace_icon";
  ALTER TABLE "special_nakshatras" DROP COLUMN "icon";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "special_tithis_id";
  DROP TYPE "public"."enum_special_nakshatras_icon";
  DROP TYPE "public"."enum_special_tithis_month";
  DROP TYPE "public"."enum_special_tithis_tithi";
  DROP TYPE "public"."enum_special_tithis_nakshatram";
  DROP TYPE "public"."enum_special_tithis_icon";`)
}
