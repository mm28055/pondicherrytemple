import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_films_consent" AS ENUM('not-needed', 'given', 'withhold');
  CREATE TYPE "public"."enum__films_v_version_consent" AS ENUM('not-needed', 'given', 'withhold');
  ALTER TABLE "media" ALTER COLUMN "consent" DROP NOT NULL;
  ALTER TABLE "films" ADD COLUMN "still_id" integer;
  ALTER TABLE "films" ADD COLUMN "consent" "enum_films_consent" DEFAULT 'not-needed';
  ALTER TABLE "_films_v" ADD COLUMN "version_still_id" integer;
  ALTER TABLE "_films_v" ADD COLUMN "version_consent" "enum__films_v_version_consent" DEFAULT 'not-needed';
  ALTER TABLE "media_rels" ADD COLUMN "films_id" integer;
  ALTER TABLE "media_rels" ADD COLUMN "field_notes_id" integer;
  ALTER TABLE "films" ADD CONSTRAINT "films_still_id_media_id_fk" FOREIGN KEY ("still_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_films_v" ADD CONSTRAINT "_films_v_version_still_id_media_id_fk" FOREIGN KEY ("version_still_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_films_fk" FOREIGN KEY ("films_id") REFERENCES "public"."films"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_field_notes_fk" FOREIGN KEY ("field_notes_id") REFERENCES "public"."field_notes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "films_still_idx" ON "films" USING btree ("still_id");
  CREATE INDEX "_films_v_version_version_still_idx" ON "_films_v" USING btree ("version_still_id");
  CREATE INDEX "media_rels_films_id_idx" ON "media_rels" USING btree ("films_id");
  CREATE INDEX "media_rels_field_notes_id_idx" ON "media_rels" USING btree ("field_notes_id");`)

  /* The films there already, LINKED ONLY: nothing already written on them or on
     their files changes (no caption, credit, consent or tag). Each film records
     the still and consent its video already has (where the still frame used to
     be set), in the film and its saved versions alike; and its video and still
     are marked as part of it. The details pass to its files only when someone
     next saves the film. Written straight to the tables, so no save rule runs. */
  await db.execute(sql`
   UPDATE "films" f SET "still_id" = m."poster_id", "consent" = COALESCE(m."consent"::text, 'not-needed')::"enum_films_consent" FROM "media" m WHERE m."id" = f."video_id" AND f."still_id" IS NULL;
  UPDATE "_films_v" v SET "version_still_id" = m."poster_id", "version_consent" = COALESCE(m."consent"::text, 'not-needed')::"enum__films_v_version_consent" FROM "media" m WHERE m."id" = v."version_video_id" AND v."version_still_id" IS NULL;
  INSERT INTO "media_rels" ("order", "parent_id", "path", "films_id")
    SELECT DISTINCT ON (x."media_id") NULL, x."media_id", 'partOf', x."film_id"
    FROM (SELECT "id" AS "film_id", "video_id" AS "media_id" FROM "films" WHERE "video_id" IS NOT NULL
          UNION ALL SELECT "id", "still_id" FROM "films" WHERE "still_id" IS NOT NULL) x
    WHERE NOT EXISTS (SELECT 1 FROM "media_rels" r WHERE r."parent_id" = x."media_id" AND r."path" = 'partOf')
    ORDER BY x."media_id", x."film_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "films" DROP CONSTRAINT "films_still_id_media_id_fk";
  
  ALTER TABLE "_films_v" DROP CONSTRAINT "_films_v_version_still_id_media_id_fk";
  
  ALTER TABLE "media_rels" DROP CONSTRAINT "media_rels_films_fk";
  
  ALTER TABLE "media_rels" DROP CONSTRAINT "media_rels_field_notes_fk";
  
  DROP INDEX "films_still_idx";
  DROP INDEX "_films_v_version_version_still_idx";
  DROP INDEX "media_rels_films_id_idx";
  DROP INDEX "media_rels_field_notes_id_idx";
  ALTER TABLE "media" ALTER COLUMN "consent" SET NOT NULL;
  ALTER TABLE "films" DROP COLUMN "still_id";
  ALTER TABLE "films" DROP COLUMN "consent";
  ALTER TABLE "_films_v" DROP COLUMN "version_still_id";
  ALTER TABLE "_films_v" DROP COLUMN "version_consent";
  ALTER TABLE "media_rels" DROP COLUMN "films_id";
  ALTER TABLE "media_rels" DROP COLUMN "field_notes_id";
  DROP TYPE "public"."enum_films_consent";
  DROP TYPE "public"."enum__films_v_version_consent";`)
}
