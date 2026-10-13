import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* Every temple now has all three names (each required in the admin): where its
   semi-formal name is empty, its formal name; where its shortest name is
   empty, its formal name without "Koyil", "Koil", "Thirukoil" or
   "Devasthanam". Only empty names are filled; nothing already written changes.
   (In the temples and in their latest saved versions alike.) The patterns'
   backslashes are doubled: this is a template string. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   UPDATE "temples" SET "known_as" = "name" WHERE "known_as" IS NULL OR btrim("known_as") = '';
  UPDATE "temples" SET "short_name" = COALESCE(NULLIF(btrim(regexp_replace(regexp_replace("name", '\\s*\\m(thiru)?ko(y)?il\\M|\\s*\\mdevasthanam\\M', '', 'gi'), '\\s+', ' ', 'g')), ''), "name") WHERE "short_name" IS NULL OR btrim("short_name") = '';
  UPDATE "_temples_v" SET "version_known_as" = "version_name" WHERE "version_known_as" IS NULL OR btrim("version_known_as") = '';
  UPDATE "_temples_v" SET "version_short_name" = COALESCE(NULLIF(btrim(regexp_replace(regexp_replace("version_name", '\\s*\\m(thiru)?ko(y)?il\\M|\\s*\\mdevasthanam\\M', '', 'gi'), '\\s+', ' ', 'g')), ''), "version_name") WHERE "version_short_name" IS NULL OR btrim("version_short_name") = '';`)
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the names filled in are kept: they are the temples' names now
}
