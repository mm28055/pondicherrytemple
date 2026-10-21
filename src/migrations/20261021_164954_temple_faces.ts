import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_temples_faces" AS ENUM('east', 'north', 'south', 'west');
  CREATE TYPE "public"."enum__temples_v_version_faces" AS ENUM('east', 'north', 'south', 'west');
  ALTER TABLE "temples" ADD COLUMN "faces" "enum_temples_faces" DEFAULT 'east';
  ALTER TABLE "_temples_v" ADD COLUMN "version_faces" "enum__temples_v_version_faces" DEFAULT 'east';`)
  await templeFacesData(db)
}

/* Every temple faces East, but for Angalamman (north) and Nandhikeswara
   (south): set, in the temple and in its saved versions, so the admin shows
   it too. Exported for this computer's copy of the database, which takes its
   columns by itself (scripts). */
export async function templeFacesData(db: MigrateUpArgs['db']): Promise<void> {
  await db.execute(sql`
   UPDATE "temples" SET "faces" = 'north' WHERE "slug" = 'angala-parameswari';
  UPDATE "temples" SET "faces" = 'south' WHERE "slug" = 'nandikeswara';
  UPDATE "_temples_v" SET "version_faces" = 'north' WHERE "parent_id" IN (SELECT "id" FROM "temples" WHERE "slug" = 'angala-parameswari');
  UPDATE "_temples_v" SET "version_faces" = 'south' WHERE "parent_id" IN (SELECT "id" FROM "temples" WHERE "slug" = 'nandikeswara');`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "temples" DROP COLUMN "faces";
  ALTER TABLE "_temples_v" DROP COLUMN "version_faces";
  DROP TYPE "public"."enum_temples_faces";
  DROP TYPE "public"."enum__temples_v_version_faces";`)
}
