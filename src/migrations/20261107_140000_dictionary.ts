import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import words from './data/dictionary-2026-11-07.json'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "dictionary" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"word" varchar NOT NULL,
  	"also_written" varchar,
  	"meaning" varchar NOT NULL,
  	"exact_case" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "dictionary_id" integer;
  CREATE UNIQUE INDEX IF NOT EXISTS "dictionary_word_idx" ON "dictionary" USING btree ("word");
  CREATE INDEX IF NOT EXISTS "dictionary_updated_at_idx" ON "dictionary" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "dictionary_created_at_idx" ON "dictionary" USING btree ("created_at");
  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_dictionary_fk" FOREIGN KEY ("dictionary_id") REFERENCES "public"."dictionary"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_dictionary_id_idx" ON "payload_locked_documents_rels" USING btree ("dictionary_id");`)
  await dictionaryWords(db)
  await maalaData({ payload, req })
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_dictionary_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_dictionary_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "dictionary_id";
  DROP TABLE IF EXISTS "dictionary" CASCADE;`)
}

/* The dictionary as settled in the "Sthalam language review" document, added
   in one statement. A word already there is left as it is. */
export async function dictionaryWords(db: MigrateUpArgs['db']): Promise<void> {
  const rows = JSON.stringify(
    (words as unknown[][]).map(([w, a, m, e]) => ({ w, a: a || null, m, e: !!e })),
  )
  await db.execute(sql`
  INSERT INTO "dictionary" ("word", "also_written", "meaning", "exact_case")
  SELECT x.w, x.a, x.m, x.e FROM json_to_recordset(${rows}::json) AS x(w text, a text, m text, e boolean)
  ON CONFLICT ("word") DO NOTHING;`)
}

/* Maala is the garland, mala another word: every mala written so far means the
   garland. And one form of garbhagriha the language review did not list. Only
   the records with these words are read twice or written, so this is quick.
   Web addresses stay. Newer drafts are put back still drafts. */
const fix = (s: string) =>
  s
    .replace(/(?<![A-Za-z])([Mm])ala(s?)(?![A-Za-z])/g, '$1aala$2')
    .replace(/(?<![A-Za-z])garba griham(?![A-Za-z])/g, 'garbhagriha')

const NOT_WORDS = new Set(['id', 'tamil', 'time', 'temple'])
function fixed(v: any): any {
  if (typeof v === 'string') return fix(v)
  if (Array.isArray(v)) return v.map(fixed)
  if (v && typeof v === 'object') {
    if (v.type === 'link' || v.type === 'upload') return v
    return Object.fromEntries(
      Object.entries(v).map(([k, x]) => [k, NOT_WORDS.has(k) ? x : k === 'text' || k === 'children' || k === 'root' || typeof x === 'object' || !('type' in v) ? fixed(x) : x]),
    )
  }
  return v
}
function changes(doc: any, fields: string[]) {
  const out: Record<string, unknown> = {}
  for (const k of fields) {
    if (doc[k] === undefined || doc[k] === null) continue
    const next = fixed(doc[k])
    if (JSON.stringify(next) !== JSON.stringify(doc[k])) out[k] = next
  }
  return Object.keys(out).length ? out : null
}

const META = new Set(['id', 'createdAt', 'updatedAt', '_status', 'createdBy'])
const whole = (doc: Record<string, unknown>) => Object.fromEntries(Object.entries(doc).filter(([k]) => !META.has(k)))

export async function maalaData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const made: Record<string, number> = {}
  for (const [collection, fields] of [
    ['field-notes', ['title', 'occasion', 'body']],
    ['films', ['title', 'body']],
    ['observances', ['gloss', 'about']],
    ['temples', ['intro', 'ritualDay']],
    ['photo-sets', ['title', 'short']],
    ['occasions', ['label', 'schedule', 'yearNote']],
    ['media', ['alt', 'caption']],
    ['weekly-rituals', ['what', 'atTemples']],
  ] as [string, string[]][]) {
    const drafts = !!(payload.collections as any)[collection]?.config.versions?.drafts
    const { docs: all } = await payload.find({ collection, limit: 0, pagination: false, ...(drafts ? { draft: true } : {}), ...quiet } as any)
    for (const latest of all as any[]) {
      const d = changes(latest, fields)
      if (!drafts) {
        if (!d) continue
        await payload.update({ collection, id: latest.id, data: { ...(latest.slug ? { slug: latest.slug } : {}), ...d }, ...quiet } as any)
        made[collection] = (made[collection] ?? 0) + 1
        continue
      }
      if (!d) continue
      const { docs: pub } = await payload.find({ collection, limit: 1, draft: false, where: { and: [{ id: { equals: latest.id } }, { _status: { equals: 'published' } }] }, ...quiet } as any)
      const published = pub[0] as any
      const c = published ? changes(published, fields) : null
      if (published && c) await payload.update({ collection, id: published.id, data: { ...whole(published), ...c, _status: 'published' }, draft: false, ...quiet } as any)
      if (latest._status === 'draft') await payload.update({ collection, id: latest.id, data: { ...whole(latest), ...d, _status: 'draft' }, draft: true, ...quiet } as any)
      made[collection] = (made[collection] ?? 0) + 1
    }
  }
  payload.logger.info(`maala: ${JSON.stringify(made)}`)
}
