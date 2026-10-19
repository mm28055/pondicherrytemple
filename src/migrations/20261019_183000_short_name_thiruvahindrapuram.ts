import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* Thiruvahindrapuram Devanatha Swamy Koyil's shortest name, as asked: just
   "Thiruvahindrapuram" (the filter bar on a phone, the calendar boxes). Only
   while it is still the name it had, so a change made in the admin since stays. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   UPDATE "temples" SET "short_name" = 'Thiruvahindrapuram' WHERE "slug" = 'devanathaswamy-thirukoil' AND "short_name" = 'Thiruvahindrapuram Devanatha Swamy';
  UPDATE "_temples_v" SET "version_short_name" = 'Thiruvahindrapuram' WHERE "version_slug" = 'devanathaswamy-thirukoil' AND "version_short_name" = 'Thiruvahindrapuram Devanatha Swamy';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   UPDATE "temples" SET "short_name" = 'Thiruvahindrapuram Devanatha Swamy' WHERE "slug" = 'devanathaswamy-thirukoil' AND "short_name" = 'Thiruvahindrapuram';
  UPDATE "_temples_v" SET "version_short_name" = 'Thiruvahindrapuram Devanatha Swamy' WHERE "version_slug" = 'devanathaswamy-thirukoil' AND "version_short_name" = 'Thiruvahindrapuram';`)
}
