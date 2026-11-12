import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* How many days a festival lasts, as each temple's ritual calendar says
   (collections/Temples, "Festival lengths"), 12 November 2026. The Ritual
   Year on a temple's page shows a festival's number of days from here only;
   a festival not here shows its name alone (no longer the number of days
   recorded). New tables, then the lengths the calendars state in so many
   words ("Navaratri, 10 days"); nothing else is touched. A temple's row is
   added only where it has none for that festival and month, so nothing
   entered in the admin since is overwritten. Found by the temples' and
   festivals' web addresses, which are the same on both sites. */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_temples_festival_lengths_month" AS ENUM('chithirai', 'vaikasi', 'aani', 'aadi', 'aavani', 'purattasi', 'aippasi', 'karthigai', 'margazhi', 'thai', 'masi', 'panguni');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum__temples_v_version_festival_lengths_month" AS ENUM('chithirai', 'vaikasi', 'aani', 'aadi', 'aavani', 'purattasi', 'aippasi', 'karthigai', 'margazhi', 'thai', 'masi', 'panguni');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE TABLE IF NOT EXISTS "temples_festival_lengths" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"festival_id" integer,
  	"month" "enum_temples_festival_lengths_month",
  	"days" numeric
  );
  CREATE TABLE IF NOT EXISTS "_temples_v_version_festival_lengths" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"festival_id" integer,
  	"month" "enum__temples_v_version_festival_lengths_month",
  	"days" numeric,
  	"_uuid" varchar
  );
  DO $$ BEGIN
    ALTER TABLE "temples_festival_lengths" ADD CONSTRAINT "temples_festival_lengths_festival_id_observances_id_fk" FOREIGN KEY ("festival_id") REFERENCES "public"."observances"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "temples_festival_lengths" ADD CONSTRAINT "temples_festival_lengths_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."temples"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "_temples_v_version_festival_lengths" ADD CONSTRAINT "_temples_v_version_festival_lengths_festival_id_observances_id_fk" FOREIGN KEY ("festival_id") REFERENCES "public"."observances"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "_temples_v_version_festival_lengths" ADD CONSTRAINT "_temples_v_version_festival_lengths_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_temples_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE INDEX IF NOT EXISTS "temples_festival_lengths_order_idx" ON "temples_festival_lengths" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "temples_festival_lengths_parent_id_idx" ON "temples_festival_lengths" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "temples_festival_lengths_festival_idx" ON "temples_festival_lengths" USING btree ("festival_id");
  CREATE INDEX IF NOT EXISTS "_temples_v_version_festival_lengths_order_idx" ON "_temples_v_version_festival_lengths" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_temples_v_version_festival_lengths_parent_id_idx" ON "_temples_v_version_festival_lengths" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_temples_v_version_festival_lengths_festival_idx" ON "_temples_v_version_festival_lengths" USING btree ("festival_id");`)
  await festivalLengthsData({ db, payload, req })
}

/* [temple, festival, month (only for a festival the temple keeps twice), days],
   each as its ritual calendar puts it */
const LENGTHS: [string, string, string | null, number][] = [
  // "Navaratri Utavam, 10 days"; "Brahmotsavam ... 5 days"
  ['angala-parameswari', 'navaratri-festival', null, 10],
  ['angala-parameswari', 'brahmotsavam', null, 5],
  // in Aani, "Varadaraja Perumal Koil Brahmotstavam, 13 days"; "Pavitrotsavam, 3 days";
  // "Krishna Jayanti, 2 days"; "Navaratri, 10 days" (the Panguni Brahmotsavam: no number given)
  ['chetty-koil', 'brahmotsavam', 'aani', 13],
  ['chetty-koil', 'pavitrotsavam', null, 3],
  ['chetty-koil', 'krishna-jayanti', null, 2],
  ['chetty-koil', 'navaratri-festival', null, 10],
  // in Chithirai, "Tulasi Mariamman Brahmotsavam, 12 days"; Navaratri "held for nine days"
  ['ghousika-balasubramaniar', 'brahmotsavam', null, 12],
  ['ghousika-balasubramaniar', 'navaratri-festival', null, 9],
  // "Rama Navami Utsavam, 14 days"
  ['kanniga-parameswari', 'rama-navami-utsavam', null, 14],
  // "Navaratri, 9 days"
  ['nandhikeswara', 'navaratri-festival', null, 9],
  // "Navaratri ... 10days"
  ['siva-subramania-lawspet', 'navaratri-festival', null, 10],
  // "Brahmotsavam, 15 days"; "Panduranga Bhaktotsavam, 5 days"; "Pavitrotsavam, 5 days";
  // "Navaratri, 10 days"; "Thengala Acharya / Maamuni Utsavam, 10 days";
  // "Ramar Utsavam: 25 days"; "Masi Magam: 1 day"; "Laksha deepam ... (1 day)"
  ['varadaraja-perumal', 'brahmotsavam', null, 15],
  ['varadaraja-perumal', 'bhaktotsavam', null, 5],
  ['varadaraja-perumal', 'pavitrotsavam', null, 5],
  ['varadaraja-perumal', 'navaratri-festival', null, 10],
  ['varadaraja-perumal', 'manavala-mamunigal-utsavam', null, 10],
  ['varadaraja-perumal', 'rama-navami-utsavam', null, 25],
  ['varadaraja-perumal', 'masi-maham', null, 1],
  ['varadaraja-perumal', 'laksha-deepam', null, 1],
  // "Pavitrotsavam: 3 days"
  ['vedapuriswara', 'pavitrotsavam', null, 3],
]

/** Exported for this computer's copy of the database (scripts). */
export async function festivalLengthsData({ db }: Pick<MigrateUpArgs, 'db' | 'payload' | 'req'>): Promise<void> {
  for (const [temple, festival, month, days] of LENGTHS) {
    const t = (await db.execute(sql`SELECT "id" FROM "temples" WHERE "slug" = ${temple}`)).rows[0] as { id?: number } | undefined
    const f = (await db.execute(sql`SELECT "id" FROM "observances" WHERE "slug" = ${festival}`)).rows[0] as { id?: number } | undefined
    if (!t?.id || !f?.id) continue
    const has = await db.execute(sql`
      SELECT 1 FROM "temples_festival_lengths" WHERE "_parent_id" = ${t.id} AND "festival_id" = ${f.id}
        AND "month" IS NOT DISTINCT FROM ${month}::"enum_temples_festival_lengths_month"`)
    if (has.rows.length) continue
    const rowId = (await db.execute(sql`SELECT substr(md5(random()::text || clock_timestamp()::text), 1, 24) AS id`)).rows[0] as { id: string }
    await db.execute(sql`
      INSERT INTO "temples_festival_lengths" ("_order", "_parent_id", "id", "festival_id", "month", "days")
      SELECT COALESCE(MAX("_order"), 0) + 1, ${t.id}, ${rowId.id}, ${f.id}, ${month}::"enum_temples_festival_lengths_month", ${days}
      FROM "temples_festival_lengths" WHERE "_parent_id" = ${t.id}`)
    // the same in the temple's latest version, which the admin opens
    await db.execute(sql`
      INSERT INTO "_temples_v_version_festival_lengths" ("_order", "_parent_id", "festival_id", "month", "days", "_uuid")
      SELECT COALESCE((SELECT MAX("_order") FROM "_temples_v_version_festival_lengths" x WHERE x."_parent_id" = v."id"), 0) + 1,
        v."id", ${f.id}, ${month}::"enum__temples_v_version_festival_lengths_month", ${days}, ${rowId.id}
      FROM "_temples_v" v WHERE v."parent_id" = ${t.id} AND v."latest" = true`)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE IF EXISTS "temples_festival_lengths" CASCADE;
  DROP TABLE IF EXISTS "_temples_v_version_festival_lengths" CASCADE;
  DROP TYPE IF EXISTS "public"."enum_temples_festival_lengths_month";
  DROP TYPE IF EXISTS "public"."enum__temples_v_version_festival_lengths_month";`)
}
