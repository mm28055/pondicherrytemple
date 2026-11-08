import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* The home page's film (globals/HomePage, "Film"): a video chosen in the
   admin, shown under the opening paragraphs. One new column only; nothing
   already written is touched. The film itself is chosen on live in the admin
   once the video is uploaded there. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "home_page" ADD COLUMN IF NOT EXISTS "film_id" integer;
  DO $$ BEGIN
    ALTER TABLE "home_page" ADD CONSTRAINT "home_page_film_id_media_id_fk" FOREIGN KEY ("film_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE INDEX IF NOT EXISTS "home_page_film_idx" ON "home_page" USING btree ("film_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "home_page" DROP CONSTRAINT IF EXISTS "home_page_film_id_media_id_fk";
  DROP INDEX IF EXISTS "home_page_film_idx";
  ALTER TABLE "home_page" DROP COLUMN IF EXISTS "film_id";`)
}
