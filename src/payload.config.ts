import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Articles } from './payload/collections/Articles'
import { Books } from './payload/collections/Books'
import { Drawings } from './payload/collections/Drawings'
import { FieldNotes } from './payload/collections/FieldNotes'
import { Films } from './payload/collections/Films'
import { Media } from './payload/collections/Media'
import { Observances } from './payload/collections/Observances'
import { Occasions } from './payload/collections/Occasions'
import { Regions } from './payload/collections/Regions'
import { SpecialNakshatras } from './payload/collections/SpecialNakshatras'
import { WeeklyRituals } from './payload/collections/WeeklyRituals'
import { TemplePieces } from './payload/collections/TemplePieces'
import { Temples } from './payload/collections/Temples'
import { Users } from './payload/collections/Users'
import { fullEditor } from './payload/editor'
import { AboutPage } from './payload/globals/AboutPage'
import { HomePage } from './payload/globals/HomePage'
import { Instagram } from './payload/globals/Instagram'
import { SectionDescriptions } from './payload/globals/SectionDescriptions'
import { Varam } from './payload/globals/Varam'

/* The admin at /admin, where the team writes and uploads everything the
   site shows. The site reads the same database through src/lib/data.ts. */

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Photos and videos go to Cloudflare R2 once .env has its keys; until then
// (and on a laptop working from sample content) they stay in MEDIA_DIR.
const r2 = process.env.R2_BUCKET
  ? {
      bucket: process.env.R2_BUCKET,
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      publicURL: (process.env.R2_PUBLIC_URL || '').replace(/\/$/, ''),
    }
  : null

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' — Sthalam',
      description: "The Sthalam team's workspace",
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/icon.svg' }],
    },
    components: {
      graphics: {
        Logo: '/components/admin/Brand#Logo',
        Icon: '/components/admin/Brand#Icon',
      },
      beforeDashboard: ['/components/admin/Welcome#Welcome'],
    },
    dateFormat: 'd MMMM yyyy',
  },
  // The order here is the order of the admin's menu.
  // Four groups: Add to the site · Temple pages · Site pages · Admin.
  collections: [
    FieldNotes,
    Films,
    Articles,
    Media,
    Temples,
    TemplePieces,
    Occasions,
    Drawings,
    Observances,
    SpecialNakshatras,
    WeeklyRituals,
    Books,
    Users,
    Regions,
  ],
  globals: [HomePage, AboutPage, Instagram, SectionDescriptions, Varam],
  editor: fullEditor,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      // The local database takes a limited number of connections, shared by
      // the build's parallel workers; Neon uses the default.
      max: process.env.PGLITE_DIR ? 3 : undefined,
    },
    // The local embedded Postgres (PGlite) runs every connection through one
    // session, so transactions from different requests would mix. They stay
    // on everywhere else (Neon).
    transactionOptions: process.env.PGLITE_DIR ? false : undefined,
    // The local database follows the collections by itself. Neon — the real
    // data — changes only through the files in src/migrations, which the
    // live site applies when it is built.
    push: Boolean(process.env.PGLITE_DIR),
  }),
  plugins: [
    s3Storage({
      enabled: Boolean(r2),
      // The same database columns whether or not R2 is switched on.
      alwaysInsertFields: true,
      bucket: r2?.bucket || 'unused',
      config: {
        endpoint: r2?.endpoint,
        region: 'auto',
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
      },
      // Files go from the uploader's browser straight to R2, so a large video
      // never passes through the website (whose hosting caps uploads at 4.5 MB).
      clientUploads: true,
      collections: {
        media: {
          // Pages link straight to R2's public address, so photos load fast
          // and cost the website nothing.
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) =>
            `${r2?.publicURL}/${prefix ? `${prefix}/` : ''}${encodeURIComponent(filename)}`,
        },
      },
    }),
  ],
  sharp,
  // Videos can be large. (With R2 on, they go straight from the browser to R2.)
  upload: { limits: { fileSize: 2 * 1024 * 1024 * 1024 } },
  graphQL: { disable: true },
  // `npm run seed` — copies the site's original content into an empty database.
  bin: [
    { key: 'seed', scriptPath: path.resolve(dirname, 'seed/index.ts') },
    // `npm run payload seed-pages` — fills in the Home and About pages, if still empty.
    { key: 'seed-pages', scriptPath: path.resolve(dirname, 'seed/pages.ts') },
    // `npm run instagram` — brings in new Instagram posts now (it also runs every morning).
    { key: 'instagram', scriptPath: path.resolve(dirname, 'instagram/bin.ts') },
  ],
})
