import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* Each entry of what is done every week its day of the week (added by the
   migration before it, which needed it: here only if it is not there yet).
   The day entries made there have it; any other gets it from its name
   ("Fridays") or from its first time's day. */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN
    CREATE TYPE "public"."enum_weekly_rituals_weekday" AS ENUM('sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  ALTER TABLE "weekly_rituals" ADD COLUMN IF NOT EXISTS "weekday" "enum_weekly_rituals_weekday";`)
  // each day's entry its day ("Fridays": fri), from its name, or else from the day of its first time
  await db.execute(sql`
   UPDATE "weekly_rituals" w SET "weekday" = COALESCE(
     CASE lower(trim(w."what"))
       WHEN 'sundays' THEN 'sun' WHEN 'mondays' THEN 'mon' WHEN 'tuesdays' THEN 'tue' WHEN 'wednesdays' THEN 'wed'
       WHEN 'thursdays' THEN 'thu' WHEN 'fridays' THEN 'fri' WHEN 'saturdays' THEN 'sat'
     END,
     (SELECT d."value"::text FROM "weekly_rituals_at_temples" a
       JOIN "weekly_rituals_at_temples_times" t ON t."_parent_id" = a."id"
       JOIN "weekly_rituals_at_temples_times_days" d ON d."parent_id" = t."id"
      WHERE a."_parent_id" = w."id" ORDER BY a."_order", t."_order", d."order" LIMIT 1)
   )::"enum_weekly_rituals_weekday"
   WHERE w."often" = 'weekly';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "weekly_rituals" DROP COLUMN "weekday";
  DROP TYPE "public"."enum_weekly_rituals_weekday";`)
}
