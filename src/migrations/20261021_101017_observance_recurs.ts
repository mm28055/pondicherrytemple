import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_observances_recurs" AS ENUM('yearly', 'monthly', 'weekly', 'rite');
  CREATE TYPE "public"."enum__observances_v_version_recurs" AS ENUM('yearly', 'monthly', 'weekly', 'rite');
  ALTER TABLE "observances" ADD COLUMN "recurs" "enum_observances_recurs" DEFAULT 'yearly';
  ALTER TABLE "observances" ADD COLUMN "recurs_when" varchar;
  ALTER TABLE "_observances_v" ADD COLUMN "version_recurs" "enum__observances_v_version_recurs" DEFAULT 'yearly';
  ALTER TABLE "_observances_v" ADD COLUMN "version_recurs_when" varchar;`)
  await ritualYearData({ db, payload, req })
}

/* How each festival and ritual is listed in a temple's Ritual Year, as
   agreed (October 2026): anything that does not come round every month or
   every week once a year (the default); the monthly and weekly ones with
   when they come round; the rites done within other events not on their
   own (a day of rites alone is listed under its own name: lib/data). Also
   Varsha Pirappu, as what the day 14 April 2026 at Varadaraja Perumal was
   part of (its Laksha Deepam and Anjaneyar Utsavam). Each change is made
   only where things are still as they were, so nothing edited in the admin
   since is overwritten. Exported for this computer's copy of the database,
   which takes its columns by itself (scripts). */
export async function ritualYearData({ db }: Pick<MigrateUpArgs, 'db' | 'payload' | 'req'>): Promise<void> {
  const rites = [
    'Abhishekam', 'Alankaram', 'Ankurarpanam', 'Anugnai', 'Churnotsavam', 'Dhvajarohanam', 'Dhvajavarohanam',
    'Dwadasa Aradhanam', 'Gopuja', 'Homam', 'Kumbha Padayal', 'Laksharchanai', 'Manjal Neer', 'Mrtsangrahanam',
    'Navavarna Vazhipadu', 'Panaka Puja', 'Pancha Paruva Utsavam', 'Pattabhishekam', 'Purappadu', 'Rathotsavam',
    'Shankhabhishekam', 'Theerthavari', 'Theppotsavam', 'Thirukalyanam', 'Thirumanjanam', 'Thiruvona Deepam',
    'Unjal Utsavam', 'Utsava Shanti', 'Vallala Kottai', 'Vastu Shanti', 'Vidaiyatri', 'Vigneswara Puja', 'Vilakku Puja',
  ]
  const recurring: [string, 'monthly' | 'weekly', string][] = [
    ['Amavasya', 'monthly', 'Every month, on Amavasya'],
    ['Pournami', 'monthly', 'Every month, on Pournami'],
    ['Krittikai', 'monthly', 'Every month, on Krittikai'],
    ['Maasa Pirappu', 'monthly', 'Every month, on its first day'],
    ['Pradosham', 'monthly', 'Twice a month, on Trayodashi'],
    ['Ramar Nakshatra Naal', 'monthly', 'Every month, on Punarpoosam'],
    ['Theipirai Ashtami', 'monthly', 'Every month, on Theipirai Ashtami'],
    ['Mahalakshmi Puja', 'monthly', 'Every month, on its first Friday'],
    ['Rahu Kala Durga Puja', 'weekly', 'Every Tuesday, in Rahu kalam'],
    ['Vaara Pujai', 'weekly', 'Every week'],
  ]
  for (const name of rites) {
    await db.execute(sql`UPDATE "observances" SET "recurs" = 'rite' WHERE btrim("name") = ${name} AND "recurs" = 'yearly'`)
    await db.execute(sql`UPDATE "_observances_v" SET "version_recurs" = 'rite' WHERE btrim("version_name") = ${name} AND "version_recurs" = 'yearly'`)
  }
  for (const [name, how, when] of recurring) {
    await db.execute(sql`UPDATE "observances" SET "recurs" = ${how}::"enum_observances_recurs", "recurs_when" = ${when} WHERE btrim("name") = ${name} AND "recurs" = 'yearly'`)
    await db.execute(sql`UPDATE "_observances_v" SET "version_recurs" = ${how}::"enum__observances_v_version_recurs", "version_recurs_when" = ${when} WHERE btrim("version_name") = ${name} AND "version_recurs" = 'yearly'`)
  }

  // the day at Varadaraja Perumal, and the ritual or festival to put first on it
  const first = async (label: string, date: string, observanceId: number) => {
    const day = await db.execute(sql`
      SELECT o."id" FROM "occasions" o JOIN "temples" t ON t."id" = o."temple_id"
      WHERE t."slug" = 'varadaraja-perumal' AND o."label" = ${label} AND (o."date" AT TIME ZONE 'UTC')::date = ${date}::date`)
    const id = (day.rows[0] as { id?: number } | undefined)?.id
    if (!id) return
    const has = await db.execute(sql`SELECT 1 FROM "occasions_rels" WHERE "parent_id" = ${id} AND "path" = 'observances' AND "observances_id" = ${observanceId}`)
    if (has.rows.length) return
    await db.execute(sql`
      INSERT INTO "occasions_rels" ("order", "parent_id", "path", "observances_id")
      SELECT COALESCE(MIN("order"), 1) - 1, ${id}, 'observances', ${observanceId} FROM "occasions_rels" WHERE "parent_id" = ${id} AND "path" = 'observances'`)
  }

  // Varsha Pirappu, for 14 April 2026
  const varsha = await db.execute(sql`SELECT "id" FROM "observances" WHERE "slug" = 'varsha-pirappu'`)
  const varshaId = (varsha.rows[0] as { id?: number } | undefined)?.id
  if (varshaId) await first('Anjaneyar Utsavam, Laksha Deepam', '2026-04-14', varshaId)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "observances" DROP COLUMN "recurs";
  ALTER TABLE "observances" DROP COLUMN "recurs_when";
  ALTER TABLE "_observances_v" DROP COLUMN "version_recurs";
  ALTER TABLE "_observances_v" DROP COLUMN "version_recurs_when";
  DROP TYPE "public"."enum_observances_recurs";
  DROP TYPE "public"."enum__observances_v_version_recurs";`)
}
