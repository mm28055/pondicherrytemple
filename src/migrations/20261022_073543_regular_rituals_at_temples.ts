import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { ORIGINAL_WORDS } from './data/regular-ritual-words-2026-10-22'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_weekly_rituals_at_temples_times_days" AS ENUM('sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat');
  CREATE TABLE "weekly_rituals_at_temples_times_days" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_weekly_rituals_at_temples_times_days",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "weekly_rituals_at_temples_times" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"on" varchar,
  	"time" varchar,
  	"details" varchar
  );
  
  CREATE TABLE "weekly_rituals_at_temples" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"temple_id" integer NOT NULL,
  	"pancha_parvam" boolean DEFAULT false,
  	"name" varchar,
  	"tamil" varchar,
  	"about" varchar,
  	"tbc" boolean DEFAULT false
  );
  
  ALTER TABLE "weekly_rituals" ALTER COLUMN "tbc" DROP DEFAULT;
  ALTER TABLE "weekly_rituals_at_temples_times_days" ADD CONSTRAINT "weekly_rituals_at_temples_times_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."weekly_rituals_at_temples_times"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "weekly_rituals_at_temples_times" ADD CONSTRAINT "weekly_rituals_at_temples_times_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."weekly_rituals_at_temples"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "weekly_rituals_at_temples" ADD CONSTRAINT "weekly_rituals_at_temples_temple_id_temples_id_fk" FOREIGN KEY ("temple_id") REFERENCES "public"."temples"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "weekly_rituals_at_temples" ADD CONSTRAINT "weekly_rituals_at_temples_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."weekly_rituals"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "weekly_rituals_at_temples_times_days_order_idx" ON "weekly_rituals_at_temples_times_days" USING btree ("order");
  CREATE INDEX "weekly_rituals_at_temples_times_days_parent_idx" ON "weekly_rituals_at_temples_times_days" USING btree ("parent_id");
  CREATE INDEX "weekly_rituals_at_temples_times_order_idx" ON "weekly_rituals_at_temples_times" USING btree ("_order");
  CREATE INDEX "weekly_rituals_at_temples_times_parent_id_idx" ON "weekly_rituals_at_temples_times" USING btree ("_parent_id");
  CREATE INDEX "weekly_rituals_at_temples_order_idx" ON "weekly_rituals_at_temples" USING btree ("_order");
  CREATE INDEX "weekly_rituals_at_temples_parent_id_idx" ON "weekly_rituals_at_temples" USING btree ("_parent_id");
  CREATE INDEX "weekly_rituals_at_temples_temple_idx" ON "weekly_rituals_at_temples" USING btree ("temple_id");`)
  await regularRitualsMergeData({ db, payload, req })
}

type Day = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'
type Often = 'weekly' | 'fortnightly' | 'monthly'
/** An entry as it was: one set of days (or a tithi), time and words for all its temples. */
export type OldRitual = {
  id: number
  what: string
  tamil?: string
  often: Often
  days: Day[]
  on?: string
  time?: string
  tbc: boolean
  about?: string
  partOf?: string
  temples: { id: number; slug: string }[]
  observances: number[]
}
type Time = { days?: Day[]; on?: string; time?: string; details?: string }
type AtTemple = { temple: number; panchaParvam: boolean; tbc: boolean; tamil?: string; about?: string; times: Time[] }
export type MergedRitual = {
  keep: OldRitual
  drop: number[]
  data: { what: string; tamil?: string; often: Often; about: null; observances: number[]; atTemples: AtTemple[] }
}

// names changed since the words were written (now → then)
const WAS: Record<string, string[]> = {
  'vinayaka chaturthi': ['chaturthi'],
  'ramar janma nakshatram': ['ramar nakshatra naal'],
  'rahu kala durga abhishekam': ['durga puja'],
  'velli kavacha alankaram': ['velli kavasa alankaram'],
  'thayar ul-purappadu': ['thayar thirumanjanam and ul-purappadu'],
  'parashakti ul-purappadu': ['lalita trishati archanai and parashakti ul-purappadu'],
}
const plain = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')
const clean = (v: string | null | undefined) => (v ?? '').trim() || undefined

/** A temple's own words (and days, tithi and time) for a ritual, as first written for it. */
function originalOf(what: string, temple: string) {
  const names = [plain(what), ...(WAS[plain(what)] ?? [])]
  return ORIGINAL_WORDS.find((o) => o.temple === temple && names.includes(plain(o.what)))
}

/* Each ritual once: the entries of the same name (and as often) made one,
   with a section for each temple they are at. A temple's section comes from
   its own entry, where it has one (one for it alone: two such, as Rahu Kala
   Durga Puja at Lawspet on two days, are two times in its section, the
   second's words as its details where they differ); otherwise from the
   entry it shares with others, which had one set of words and one time for
   them all: then the temple's own words, days or tithi and time, as first
   written for it (data/regular-ritual-words-2026-10-22); for a temple with
   none, the shared entry's, but not its words where they are another
   temple's own (those are left for the admin). "Counted in the Pancha Parvam" where it was part of that
   set; to be confirmed; its own Tamil where it differs. The first entry of
   each name is kept, the others removed; no words are left shared. */
export function mergeRegularRituals(olds: OldRitual[]): MergedRitual[] {
  const groups = new Map<string, OldRitual[]>()
  for (const o of [...olds].sort((a, b) => a.id - b.id)) {
    const key = `${plain(o.what)}|${o.often}`
    groups.set(key, [...(groups.get(key) ?? []), o])
  }
  return [...groups.values()].map((rows) => {
    const keep = rows[0]
    const tamil = rows.map((r) => clean(r.tamil)).find(Boolean)
    const temples = [...new Map(rows.flatMap((r) => r.temples).map((t) => [t.id, t])).values()]
    const atTemples = temples.map((t): AtTemple => {
      const at = rows.filter((r) => r.temples.some((x) => x.id === t.id))
      const own = at.filter((r) => r.temples.length === 1)
      const from = own.length ? own : at
      const original = own.length ? undefined : originalOf(keep.what, t.slug)
      const here: AtTemple = {
        temple: t.id,
        panchaParvam: from.some((r) => Boolean(clean(r.partOf))),
        tbc: from.some((r) => r.tbc),
        times: [],
      }
      const ownTamil = from.map((r) => clean(r.tamil)).find(Boolean)
      if (ownTamil && ownTamil !== tamil) here.tamil = ownTamil
      // the shared entry's words, unless they are another temple's own
      const othersWords = (r: OldRitual) => temples.some((o) => o.id !== t.id && originalOf(keep.what, o.slug)?.about === clean(r.about))
      for (const r of from) {
        const words = original?.about ?? (own.length || !othersWords(r) ? clean(r.about) : undefined)
        let details: string | undefined
        if (words) {
          if (here.about === undefined) here.about = words
          else if (here.about !== words) details = words
        }
        const days = original?.days?.length ? original.days : r.days
        here.times.push({
          ...(keep.often === 'weekly' ? { days } : { on: original?.on ?? clean(r.on) }),
          time: original ? original.time : clean(r.time),
          details,
        })
      }
      return here
    })
    return {
      keep,
      drop: rows.slice(1).map((r) => r.id),
      data: {
        what: keep.what.trim(),
        tamil,
        often: keep.often,
        about: null,
        observances: [...new Set(rows.flatMap((r) => r.observances))],
        atTemples,
      },
    }
  })
}

/* The entries as they are in the database (the fields being removed are read
   before they go, in the next migration), merged, and written as the code
   has them. Exported for this computer's copy of the database (scripts). */
export async function regularRitualsMergeData({ db, payload, req }: Pick<MigrateUpArgs, 'db' | 'payload' | 'req'>): Promise<void> {
  type Row = { id: number; what: string; tamil: string | null; often: string | null; on: string | null; time: string | null; tbc: boolean | null; about: string | null; part_of: string | null }
  const rows = (await db.execute(sql`SELECT "id", "what", "tamil", "often", "on", "time", "tbc", "about", "part_of" FROM "weekly_rituals" ORDER BY "id"`)).rows as Row[]
  const days = (await db.execute(sql`SELECT "parent_id", "value" FROM "weekly_rituals_days" ORDER BY "parent_id", "order"`)).rows as { parent_id: number; value: Day }[]
  const rels = (await db.execute(sql`
   SELECT r."parent_id", r."path", r."observances_id", t."id" AS "temple_id", t."slug" AS "temple_slug"
   FROM "weekly_rituals_rels" r LEFT JOIN "temples" t ON t."id" = r."temples_id"
   ORDER BY r."parent_id", r."order"`)).rows as { parent_id: number; path: string; observances_id: number | null; temple_id: number | null; temple_slug: string | null }[]
  const olds: OldRitual[] = rows.map((r) => ({
    id: Number(r.id),
    what: r.what,
    tamil: clean(r.tamil),
    often: (r.often ?? 'weekly') as Often,
    days: days.filter((d) => Number(d.parent_id) === Number(r.id)).map((d) => d.value),
    on: clean(r.on),
    time: clean(r.time),
    tbc: Boolean(r.tbc),
    about: clean(r.about),
    partOf: clean(r.part_of),
    temples: rels
      .filter((x) => Number(x.parent_id) === Number(r.id) && x.path === 'temples' && x.temple_id)
      .map((x) => ({ id: Number(x.temple_id), slug: x.temple_slug ?? '' })),
    observances: rels.filter((x) => Number(x.parent_id) === Number(r.id) && x.path === 'observances' && x.observances_id).map((x) => Number(x.observances_id)),
  }))
  const quiet = { req, overrideAccess: true, context: { skipRevalidate: true } } as const
  for (const m of mergeRegularRituals(olds)) {
    if (!m.data.atTemples.length) continue
    await payload.update({ collection: 'weekly-rituals', id: m.keep.id, data: m.data, ...quiet })
    for (const id of m.drop) await payload.delete({ collection: 'weekly-rituals', id, ...quiet })
  }
}


export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "weekly_rituals_at_temples_times_days" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "weekly_rituals_at_temples_times" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "weekly_rituals_at_temples" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "weekly_rituals_at_temples_times_days" CASCADE;
  DROP TABLE "weekly_rituals_at_temples_times" CASCADE;
  DROP TABLE "weekly_rituals_at_temples" CASCADE;
  ALTER TABLE "weekly_rituals" ALTER COLUMN "tbc" SET DEFAULT false;
  DROP TYPE "public"."enum_weekly_rituals_at_temples_times_days";`)
}
