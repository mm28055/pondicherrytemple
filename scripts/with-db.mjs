/* Runs a command (next dev, next build, payload …) with the local database
   available.

   When .env sets PGLITE_DIR, this starts the embedded Postgres (PGlite) on
   127.0.0.1:5433 for as long as the command runs — unless one is already
   running (say, `npm run dev` in another window), in which case the command
   simply uses that one. Without PGLITE_DIR (Neon, or on Vercel) it just runs
   the command.

   Two safeguards, added after the local database was wiped on 25 Sept 2026:
   - A lock file, so only ONE process ever opens the database files. (Two at
     once — say, two windows starting the site in the same few seconds —
     corrupts them.) A second process waits for the first and uses it.
   - A backup copy of the database files every time it is opened, before
     anything touches them. The last 10 are kept, next to the database, in
     "backups". To restore one: stop the site, replace the pgdata folder with
     the backup's contents, start the site. */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'

try {
  process.loadEnvFile('.env')
} catch {
  // no .env — fine on Vercel, where settings come from the dashboard
}

const command = process.argv.slice(2).join(' ')
if (!command) {
  console.error('usage: node scripts/with-db.mjs <command> [args…]')
  process.exit(1)
}

const dataDir = process.env.PGLITE_DIR
const port = Number(new URL(process.env.DATABASE_URL || 'postgres://db@127.0.0.1:5433/db').port || 5433)
const KEEP_BACKUPS = 10

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const portInUse = (p) =>
  new Promise((resolve) => {
    const socket = net.connect(p, '127.0.0.1')
    socket.once('connect', () => {
      socket.end()
      resolve(true)
    })
    socket.once('error', () => resolve(false))
  })

const alive = (pid) => {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

/** Try to become the one process that opens the database. */
function takeLock(lockFile) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      fs.writeFileSync(lockFile, String(process.pid), { flag: 'wx' })
      return true
    } catch {
      const owner = Number(fs.readFileSync(lockFile, 'utf8'))
      if (owner && alive(owner)) return false
      fs.rmSync(lockFile, { force: true }) // left behind by a process that died
    }
  }
  return false
}

function backUp(dir) {
  if (!fs.existsSync(path.join(dir, 'PG_VERSION'))) return
  const backups = path.join(path.dirname(dir), 'backups')
  const stamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '-')
  fs.cpSync(dir, path.join(backups, `pgdata-${stamp}`), { recursive: true })
  const old = fs.readdirSync(backups).filter((n) => n.startsWith('pgdata-')).sort()
  for (const name of old.slice(0, Math.max(0, old.length - KEEP_BACKUPS))) {
    fs.rmSync(path.join(backups, name), { recursive: true, force: true })
  }
  console.log(`[db] backup saved: ${path.join(backups, `pgdata-${stamp}`)}`)
}

let server
let lockFile
const ourLock = dataDir ? `${path.resolve(dataDir)}.lock` : undefined
if (dataDir && (await portInUse(port))) {
  // Something is already answering on the database port. Use it only if it
  // is THIS database (its lock is held by a running process). Otherwise it
  // is some other copy — e.g. a test database another window started — and
  // using it would show the site empty or save work in the wrong place.
  const owner = fs.existsSync(ourLock) ? Number(fs.readFileSync(ourLock, 'utf8')) : 0
  if (!owner || !alive(owner)) {
    console.error(
      `\n[db] Port ${port} is being used by a different database (probably a test copy started in another window).\n` +
        `[db] Not starting, so nothing is read from or saved to the wrong place. Stop that window's server, then try again.\n`
    )
    process.exit(1)
  }
}
if (dataDir && !(await portInUse(port))) {
  lockFile = `${path.resolve(dataDir)}.lock`
  if (takeLock(lockFile)) {
    backUp(dataDir)
    const { PGlite } = await import('@electric-sql/pglite')
    const { PGLiteSocketServer } = await import('@electric-sql/pglite-socket')
    fs.mkdirSync(dataDir, { recursive: true })
    const db = await PGlite.create(dataDir)
    // Every connection's queries share one queue, so a generous limit costs
    // nothing; it just stops a build's many workers from being turned away.
    server = new PGLiteSocketServer({ db, port, host: '127.0.0.1', maxConnections: 256 })
    await server.start()
    console.log(`[db] local Postgres (PGlite) on 127.0.0.1:${port} — files in ${dataDir}`)
  } else {
    // Another process is opening it right now: wait for it, then share it.
    lockFile = undefined
    console.log('[db] the database is being opened by another window — waiting for it…')
    for (let i = 0; i < 120 && !(await portInUse(port)); i++) await sleep(500)
  }
}

const child = spawn(command, { stdio: 'inherit', shell: true, env: process.env })

let stopping = false
async function shutdown(code) {
  if (stopping) return
  stopping = true
  if (server) {
    try {
      await server.stop()
      await server.db.close()
    } catch {
      // already closed
    }
  }
  if (lockFile) fs.rmSync(lockFile, { force: true })
  process.exit(code ?? 0)
}

child.on('exit', (code) => shutdown(code))
for (const signal of ['SIGINT', 'SIGTERM', 'SIGBREAK', 'SIGHUP']) {
  process.on(signal, () => child.kill(signal))
}
