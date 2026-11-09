import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* Dictionary → Status and Found in: a word drafted for a word new to the site
   waits for approval and shows nowhere until approved. Every word already
   there is approved. Only the two columns are added; no word is changed. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_dictionary_status" AS ENUM('approved', 'waiting');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  ALTER TABLE "dictionary" ADD COLUMN IF NOT EXISTS "status" "enum_dictionary_status" DEFAULT 'approved';
  ALTER TABLE "dictionary" ADD COLUMN IF NOT EXISTS "found_in" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "dictionary" DROP COLUMN IF EXISTS "status";
  ALTER TABLE "dictionary" DROP COLUMN IF EXISTS "found_in";
  DROP TYPE IF EXISTS "public"."enum_dictionary_status";`)
}
