import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/* Panduranga Bhajanai (Varadaraja Perumal) is on Sundays (the user, 25 November
   2026): it was entered under Saturday, with "Sunday" in its On box, and its
   few words said Saturday evenings. And its group in the film "The People of Pondicherry's
   Temples", the same: the Sunday evening bhajanai group. Runs again harmlessly. */
export async function pandurangaSundayData({ db }: Pick<MigrateUpArgs, 'db'>): Promise<void> {
  await db.execute(sql`UPDATE "weekly_rituals" SET "weekday" = 'sun' WHERE "what" = 'Panduranga Bhajanai' AND "weekday" = 'sat';`)
  // (on live its day was already Sunday, its words not)
  await db.execute(
    sql`UPDATE "weekly_rituals" SET "about" = replace("about", 'Saturday evenings', 'Sunday evenings') WHERE "what" = 'Panduranga Bhajanai' AND "about" LIKE '%Saturday evenings%';`,
  )
  await db.execute(
    sql`UPDATE "films" SET "body" = replace("body"::text, 'Saturday evening bhajanai group', 'Sunday evening bhajanai group')::jsonb WHERE "body"::text LIKE '%Saturday evening bhajanai group%';`,
  )
  await db.execute(
    sql`UPDATE "_films_v" SET "version_body" = replace("version_body"::text, 'Saturday evening bhajanai group', 'Sunday evening bhajanai group')::jsonb WHERE "version_body"::text LIKE '%Saturday evening bhajanai group%';`,
  )
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await pandurangaSundayData({ db })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // nothing to put back
}
