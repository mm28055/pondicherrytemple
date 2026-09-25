/* One-time copy of the uploaded photos, videos and drawings (MEDIA_DIR) to
   Cloudflare R2.

     node scripts/move-media-to-r2.mjs

   Needs the R2_… settings in .env. Each file keeps its name, which is how
   the site finds it. Files already in R2 at the same size are skipped, so it
   is safe to run again; the local files are not touched. */
import fs from 'node:fs'
import path from 'node:path'
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

process.loadEnvFile('.env')

const { MEDIA_DIR, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL } =
  process.env
for (const [name, value] of Object.entries({
  MEDIA_DIR,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  R2_PUBLIC_URL,
})) {
  if (!value) {
    console.error(`${name} is missing from .env.`)
    process.exit(1)
  }
}

const types = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
}

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
})

const files = fs.readdirSync(MEDIA_DIR).filter((f) => fs.statSync(path.join(MEDIA_DIR, f)).isFile())
let copied = 0
let skipped = 0
for (const file of files) {
  const full = path.join(MEDIA_DIR, file)
  const size = fs.statSync(full).size
  try {
    const head = await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: file }))
    if (head.ContentLength === size) {
      skipped++
      continue
    }
  } catch {
    // not there yet
  }
  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: file,
      Body: fs.readFileSync(full),
      ContentLength: size,
      ContentType: types[path.extname(file).toLowerCase()] || 'application/octet-stream',
    })
  )
  copied++
  console.log(`[r2] ${file} (${(size / 1e6).toFixed(1)} MB)`)
}
console.log(`[r2] ${copied} copied, ${skipped} already there.`)

// Check the public address answers for the first file.
if (files.length) {
  const url = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${encodeURIComponent(files[0])}`
  const res = await fetch(url, { method: 'HEAD' })
  console.log(res.ok ? `[r2] public address works: ${url}` : `[r2] public address NOT working (${res.status}): ${url}`)
  if (!res.ok) process.exit(1)
}
