import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* A special nakshatram can fall twice in its Tamil month (Pooradam in
   Aippasi 2026: mid-October and 14 November). Each rule now says which to
   mark; all are "both" as before, but Aippasi Pooradam, Vishwaksena's
   thirunakshatram, is the second only. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_special_nakshatras_twice" AS ENUM('both', 'first', 'second');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  ALTER TABLE "special_nakshatras" ADD COLUMN IF NOT EXISTS "twice" "enum_special_nakshatras_twice" DEFAULT 'both';
  UPDATE "special_nakshatras" SET "twice" = 'second' WHERE "month" = 'aippasi' AND "nakshatram" = 'Pooradam';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "special_nakshatras" DROP COLUMN IF EXISTS "twice";
  DROP TYPE IF EXISTS "public"."enum_special_nakshatras_twice";`)
}
