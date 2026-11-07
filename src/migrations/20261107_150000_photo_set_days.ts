import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await photoSetDays(db)
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the days are right; nothing to take back
}

/* Photo sets that had no day, so that their photographs showed as "Day not
   known". Three were taken on one day, as the photographs' own time shows
   (and one's folder, which is its title's date, now taken out of the title),
   and have it as their day. Three span several days, so each photograph takes the
   day it was taken, in Pondicherry's time. Found by their folders, which are
   the same here and on live, and only where no day has been given. */
export async function photoSetDays(db: MigrateUpArgs['db']): Promise<void> {
  await db.execute(sql`
  UPDATE "photo_sets" SET "date" = '2026-04-17T12:00:00.000Z', "updated_at" = now()
    WHERE "folder" = 'other/Angalamman_Town_Pondicherry' AND "date" IS NULL;
  UPDATE "photo_sets" SET "date" = '2026-06-11T12:00:00.000Z', "updated_at" = now()
    WHERE "folder" = 'Vedapuriswara_Pondicherry/Drone' AND "date" IS NULL;
  UPDATE "photo_sets" SET "date" = '2026-04-05T12:00:00.000Z', "title" = 'Sita Ramar Kalyanam', "updated_at" = now()
    WHERE "title" = '2026-04–05, Sita Ramar Kalyanam' AND "date" IS NULL;
  UPDATE "media" AS m
    SET "taken_on" = date_trunc('day', m."taken_at" AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'UTC' + interval '12 hours', "updated_at" = now()
    FROM "photo_sets" AS s
    WHERE m."set_id" = s."id" AND s."date" IS NULL AND m."taken_on" IS NULL AND m."taken_at" IS NOT NULL
      AND s."folder" IN ('Nandhikeswara_Pondicherry/Nandikeswara Miscellaneous Photos', 'Nandhikeswara_Pondicherry/Gangai Vinayakar', 'Vedapuriswara_Pondicherry/Nandavanam');`)
}
