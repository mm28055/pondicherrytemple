import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* Every relationship table (*_rels: the links between documents) indexed on
   the columns its lookups go by: parent_id (the document the links are
   from) and each of its link columns (temples_id, observances_id, media_id…).
   Payload makes these indexes with its tables, so they should all be there:
   each is made only where no index begins with that column yet, so this
   adds nothing that is already in place, and changes no data. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$
   DECLARE c record;
   BEGIN
     FOR c IN
       SELECT col.table_name, col.column_name
       FROM information_schema.columns col
       WHERE col.table_schema = 'public'
         AND col.table_name LIKE '%\_rels'
         AND (col.column_name = 'parent_id' OR col.column_name LIKE '%\_id')
         AND NOT EXISTS (
           SELECT 1
           FROM pg_index i
           JOIN pg_class t ON t.oid = i.indrelid
           JOIN pg_namespace n ON n.oid = t.relnamespace
           JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = i.indkey[0]
           WHERE n.nspname = 'public' AND t.relname = col.table_name AND a.attname = col.column_name
         )
     LOOP
       EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I USING btree (%I)', c.table_name || '_' || c.column_name || '_rels_idx', c.table_name, c.column_name);
     END LOOP;
   END $$;`)
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the indexes made here (if any) are only ever a help: kept
}
