/* One-time move of the local database (PGlite, in PGLITE_DIR) to Neon.

     node scripts/move-to-neon.mjs

   Needs, in .env: PGLITE_DIR (the local database) and NEON_DATABASE_URL (the
   connection string from the Neon dashboard). Stop the site first — the
   local database has to be closed while it is copied.

   It copies everything — every page, draft, version, user and setting — into
   an EMPTY Neon database, and refuses to touch one that already has tables.
   The local database is left as it was (and backed up first), so nothing is
   lost if the move has to be done again. */
import fs from 'node:fs'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { pgDump } from '@electric-sql/pglite-tools/pg_dump'
import pg from 'pg'

process.loadEnvFile('.env')

const sourceDir = process.env.PGLITE_DIR
const targetURL = process.env.NEON_DATABASE_URL
if (!sourceDir || !fs.existsSync(path.join(sourceDir, 'PG_VERSION'))) {
  console.error('PGLITE_DIR in .env does not point at the local database.')
  process.exit(1)
}
if (!targetURL) {
  console.error('Put the Neon connection string in .env as NEON_DATABASE_URL first.')
  process.exit(1)
}

const lockFile = `${path.resolve(sourceDir)}.lock`
if (fs.existsSync(lockFile)) {
  const owner = Number(fs.readFileSync(lockFile, 'utf8'))
  let running = false
  try {
    process.kill(owner, 0)
    running = true
  } catch {}
  if (running) {
    console.error('The site is running and has the local database open. Stop it, then run this again.')
    process.exit(1)
  }
}

// 1. A backup copy of the local database, before opening it.
const stamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '-')
const backups = path.join(path.dirname(path.resolve(sourceDir)), 'backups')
fs.cpSync(sourceDir, path.join(backups, `pgdata-${stamp}-before-neon`), { recursive: true })

// 2. Dump it: the schema, all the rows, then the links between tables.
const local = await PGlite.create(sourceDir)
const counts = await rowCounts((sql) => local.query(sql))
const dump = await (await pgDump({ pg: local, args: ['--no-owner', '--no-privileges'] })).text()
await local.close()
const dumpFile = path.join(backups, `dump-${stamp}.sql`)
fs.writeFileSync(dumpFile, dump)
console.log(`[move] local database dumped (${(dump.length / 1e6).toFixed(1)} MB) → ${dumpFile}`)

// 3. Load it into Neon, all or nothing. Neon's direct connection, not the
//    pooled one: the load is one long session.
const url = new URL(targetURL)
url.hostname = url.hostname.replace('-pooler', '')
const neon = new pg.Client({ connectionString: url.toString() })
await neon.connect()
const existing = await neon.query(
  `select count(*)::int as n from information_schema.tables where table_schema = 'public'`
)
if (existing.rows[0].n > 0) {
  console.error(`[move] Neon already has ${existing.rows[0].n} tables. Not touching it.`)
  await neon.end()
  process.exit(1)
}

// psql-only lines (\restrict …) mean nothing to Postgres itself.
const sql = dump
  .split('\n')
  .filter((line) => !line.startsWith('\\'))
  .join('\n')

// The migrations that exist now are already in the copied tables; record them
// as done, in place of the local "dev" marker, so Neon only ever gets later ones.
const migrations = fs
  .readdirSync('src/migrations')
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''))
  .sort()

try {
  await neon.query('BEGIN')
  await neon.query(sql)
  await neon.query(`SET search_path TO public`)
  await neon.query(`DELETE FROM payload_migrations WHERE batch = -1`)
  for (const name of migrations) {
    await neon.query(
      `INSERT INTO payload_migrations (name, batch, updated_at, created_at) VALUES ($1, 1, now(), now())`,
      [name]
    )
  }
  await neon.query('COMMIT')
} catch (error) {
  await neon.query('ROLLBACK')
  await neon.end()
  console.error('[move] Failed — Neon was left empty.', error)
  process.exit(1)
}

// 4. Check every table arrived whole.
const moved = await rowCounts((q) => neon.query(q))
await neon.end()
let ok = true
for (const [table, n] of Object.entries(counts)) {
  if (table === 'payload_migrations') continue
  if (moved[table] !== n) {
    ok = false
    console.error(`[move] ${table}: ${n} rows locally, ${moved[table] ?? 'missing'} on Neon`)
  }
}
if (!ok) process.exit(1)
const total = Object.values(counts).reduce((a, b) => a + b, 0)
console.log(`[move] done: ${Object.keys(counts).length} tables, ${total} rows, all on Neon.`)

async function rowCounts(query) {
  const tables = await query(
    `select table_name from information_schema.tables where table_schema = 'public' order by 1`
  )
  const counts = {}
  for (const { table_name } of tables.rows) {
    counts[table_name] = (await query(`select count(*)::int as n from public."${table_name}"`)).rows[0].n
  }
  return counts
}
