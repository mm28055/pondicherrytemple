import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import words from './data/dictionary-2026-11-23.json'

/* The dictionary words drafted for the field notes of 1 to 22 November and the
   temple introductions, as approved (and edited) on 23 November 2026: 112
   words (data/dictionary-2026-11-23.json), each with the note or page it was
   found in. A word already there is left as it is. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  const rows = JSON.stringify(words)
  await db.execute(sql`
  INSERT INTO "dictionary" ("word", "also_written", "meaning", "exact_case", "status", "found_in", "updated_at", "created_at")
  SELECT x."word", x."alsoWritten", x."meaning", x."exactCase", 'approved', x."foundIn", now(), now()
  FROM json_to_recordset(${rows}::json) AS x("word" text, "alsoWritten" text, "meaning" text, "exactCase" boolean, "foundIn" text)
  ON CONFLICT ("word") DO NOTHING;`)
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the words are kept: they may have been edited since
}
