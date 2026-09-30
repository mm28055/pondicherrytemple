# Sthalam — The Temple Documentation Project

The website for a year-long study of fifteen temples in Pondicherry, by the
Centre for Shaiva Studies. The domain will be **sthalam.org**.

The site and its admin are one Next.js app. The team writes and uploads in the
admin (`/admin`, built with Payload); the site reads the same database.

## Running it

```
npm install
copy .env.example .env      (then fill in PAYLOAD_SECRET — see the file)
npm run dev
```

Then open http://localhost:3000 for the site and http://localhost:3000/admin for
the admin. `npm run dev` also starts the local database (see below).

On a brand-new database, `npm run seed` copies in the site's original content,
word for word. The first person to open `/admin` creates the first account,
which becomes the admin.

`npm run build` makes a full production build: it type-checks everything and
pre-renders every page, so run it before handing anything over.

## The six tabs

| Tab | Address | What's there |
|---|---|---|
| (logo) Home | `/` | The newest additions, whatever they are — nothing to keep up to date by hand |
| Temples | `/pondicherry`, `/pondicherry/[temple]` | The fifteen. A temple page: Abishek's drawing, the introduction, **The temple** (the place itself), **The people**, then everything else tagged with it, and **the year so far** |
| Festivals & Rituals | `/festivals-and-rituals`, `/festivals-and-rituals/[id]` | Each explained once, then where we've seen it, field notes, articles |
| Field Notes | `/field-notes`, `/field-notes/[id]` | Everything recorded in the field: notes, interviews, raw videos, audio, photographs |
| Articles | `/articles`, `/articles/[id]` | Essays — polished pieces, including general ones not about one temple |
| Films | `/films`, `/films/[id]` | Finished short films, such as the Centre's Instagram reels (see below) |
| About | `/about` | Project, how we work, the name, team, contact |

The Book (`/pondicherry/book`, the provisional outline of the Pondicherry book)
has no tab while it is in progress: it is linked from the footer, the About
page and the home page. It can come back as a tab once the book is written.

`/temples` redirects to `/pondicherry` while Pondicherry is the only region.

## The admin (`/admin`)

The menu has four groups. **Add to the site:** Field notes · Films · Articles ·
Photos & videos. **Temple pages:** Temples (drag to reorder) · The temple & its
people · The year so far · Drawings · Festivals & rituals. **Site pages:** The
book · Home page · About page. **Admin:** Team · Regions · Instagram. (The Home
and About pages' words live here; `npm run payload seed-pages` fills them in on
a new database.)

- **The editor.** Every text with paragraphs is written in a Word-like editor:
  headings, bold/italic, lists, quotations, links to other pages on the site,
  and photos, videos or recordings placed in the text. Pasting from Word or
  Google Docs keeps the basic formatting.
- **Uploads.** Drag files in — several at once for photos. Every photo gets
  smaller copies made automatically. Each file records a caption, a credit and
  **consent**: a file marked "consent not given" never appears on the site.
- **Drafts and publishing.** *Save draft* keeps a piece private; *Publish*
  puts it on the site within seconds (the built pages refresh themselves).
  *Preview* shows how a draft will look, with a bar saying so. Field notes,
  articles and temple pieces save as you type.
- **Roles.** Admin (everything, including adding people), Editor (writes,
  uploads, publishes), Contributor (writes drafts and uploads; changes only
  their own drafts; an editor publishes). Only admins add people.
- **Review.** Each piece has a *Review* box in the sidebar — awaiting review or
  approved — for the team's own tracking. It is never shown on the site. Use
  it to find what still needs approving before launch.

## How things connect: tags, not copies

Every piece is stored **once** and tagged with the temple(s) and the
festival(s)/ritual(s) it is about. Pages are then assembled from the tags:

- A **temple page** shows every drawing, field note and article tagged with
  that temple, the pieces about the place and its people, every festival and
  ritual seen there, and its dated occasions. A temple's plan drawing comes
  first, largest.
- A **festival/ritual page** shows its explanation first, then every temple and
  date it was seen, then the field notes and articles tagged with it.
- A general article (say, on temples as living places) sits in Articles, and is
  tagged with a temple only if it actually discusses that temple.

Nothing needs to be linked by hand. Add a field note with the right tags and it
appears on the right temple and festival pages.

## Films, and the Centre's Instagram

**Films** (`/films`) are finished short films made to be watched on their own,
such as the Centre's Instagram reels. They are kept apart from Field Notes,
which are the raw record of a day at a temple (a rough clip filmed there is
still a field note). The Films tab shows them as still frames in a grid,
newest first, filtered by temple or festival, and each plays in place. Each
film also has its own page (`/films/[id]`), appears in a *Films* row on its
temples' and festivals' pages, and shows in the home page's *Just added*.

Videos posted on **@shaivastudiespondicherry** come in by themselves. Every
morning (`vercel.json` → `/next/instagram`) each new video post becomes a
**draft** film, its video copied into our own files, the caption as its
text, and the temples and festivals it names ticked as a first guess.
Photo-only posts are passed over. Nothing is published: each waits,
*awaiting review*, for someone to check it.

- **Setting it up (done, 25 Sept 2026):** the account is Professional
  (Business). Manish's Meta developer app "Sthalam" (Instagram app
  "Sthalam-IG") has the account as an Instagram Tester, with read-only
  access. The key is pasted into **Settings → Instagram** in the admin, and
  each run renews it.
- **Bringing in new posts now:** `npm run instagram`. The morning run takes up
  to 10 new posts a day. An admin can also open `/next/instagram`.
- A film deleted in the admin is not brought back. Posts shared *with* the
  Centre (collaborations owned by other accounts, e.g. Deepa's @paticheri)
  don't come through the Centre's key.
- On Vercel the daily run needs `CRON_SECRET` set, and file storage on R2.

## Pondicherry now, structured for more

The site reads as Pondicherry-only. Underneath, only the two things that are
expensive to change later are built for more regions:

- **Addresses include the town** — `/pondicherry/chetty-koil`. The region
  routes are `src/app/(site)/[region]/…`, so a second town needs data, not code.
- **Everything records its region, and dates are ordinary dates.** The Tamil
  month is a display label computed in `src/lib/calendar.ts`; another region
  with another calendar adds a table there.

Festivals and rituals are not tied to a region, so a Brahmotsavam in another
town would join the same Brahmotsavam page. (Its "where we've seen it" list
already handles any region; the field-note rows on that page still label
places with Pondicherry's temples and calendar — a small change when a second
region arrives.)

## Where things are

| Where | What |
|---|---|
| `src/payload.config.ts`, `src/payload/` | The admin: its sections (`collections/`), who can do what (`access.ts`), the editor (`editor.ts`), shared fields, and the page refresh on publish |
| `src/lib/data.ts` | **The only way pages get content.** Reads the database (published only, drafts while previewing) and hands pages the plain shapes in `src/content/types.ts` |
| `src/lib/richtext.ts` | Turns editor text into the page's HTML (escaped, so stored text can't inject code) |
| `src/app/(site)/` | The public site. `src/app/(payload)/` is the admin, its API, and the preview switch |
| `src/seed/` | The original hand-written content and the script (`npm run seed`) that copies it into an empty database |
| `scripts/with-db.mjs` | Starts the local database for `dev`, `build`, `start` and `seed` |
| `src/payload-types.ts` | Generated — run `npm run generate:types` after changing a collection (and `npm run generate:importmap` after adding an admin component) |

## The database and files

**Locally**, the database is PGlite — a complete Postgres that runs inside Node,
with nothing to install (it works on this Windows ARM laptop, where SQLite's
driver does not). `npm run dev` starts it. **Everything lives in this project
folder**, in `.data/` (never put in git): the database (`.data/pgdata`), uploaded
photos, videos and drawings (`.data/media`), and a backup of the database made
every time the site starts (`.data/backups`, last 10 kept). Only one window can
open the database at a time, and the site refuses to use any other database
that happens to be running. Transactions are switched off for PGlite only.

**Neon and Cloudflare R2.** The real data belongs on Neon (text, tags, users,
settings) and R2 (photos, videos, drawings). Which one a laptop uses is set in
`.env`: `DATABASE_URL` pointing at Neon with no `PGLITE_DIR` means the real
data, and the PGlite lines mean a practice copy (fill it with `npm run seed`).
Uploads go to R2 whenever the `R2_…` settings are filled in, straight from the
browser to R2, so large videos never pass through Vercel's 4.5 MB limit. Pages
link to R2's public address directly. That's why the bucket needs a CORS rule
allowing `PUT` from the site's address.

The one-time move from the laptop: `node scripts/move-to-neon.mjs` (with the
site stopped; it copies into an *empty* Neon database and checks every table's
row count) and `node scripts/move-media-to-r2.mjs` (safe to repeat).

**Changing a collection's fields once on Neon:** Neon's tables change only
through migration files in `src/migrations`. Run
`npm run payload migrate:create <name>`, then `npm run payload migrate`. The
live site's build (`vercel-build`) applies any new ones before building.
PGlite practice copies still update themselves.

Still to do for going live: an email service for password resets.

## Design

All styling is in `src/styles/site.css`: the temple-wall palette (lime-white,
red ochre, lamp-black), the red-and-white stripes, and three typefaces served
from the site itself — Anek Latin and Anek Tamil for headings (one family, so
English and Tamil match) and Newsreader for reading. Lists use rules, not cards.
The admin's own touches are in `src/app/(payload)/custom.scss`.

## The editorial rule

The running log is private and is **never** published as-is. It contains
things that must not go public: phone numbers, remarks about priests' income
and families, gossip. The path is:

1. **Running log** (private, Drive) →
2. **Field note** (edited: consent, money, contact details removed; approved by
   Deepa) →
3. sometimes an **article** (a longer, polished piece).

Tier 3 material (land, revenue, governance) is never published. The 1748
history is held until Deepa decides it can go public. In "The people", people
are described by their role; a name appears only when their consent is
recorded with it.

The site does not label drafts. The *Review* box on each piece in the admin is
the record of what the authors have approved; everything still "awaiting
review" must be approved before launch.

## Held sections

Concepts, the writings library, Stories, the Method page, the old placeholder
content and the old stylesheets are in `held/`, not deleted — see
`held/README.md`.

## Safety

- Never commit `.env` files, database URLs or storage keys.
- The repo will be public, and git keeps history, so deleting a file later
  doesn't remove it. The sample content in `src/seed/data/` is public once
  pushed.
- `src/components/Prose.tsx` is the only place HTML is inserted into pages, and
  that HTML comes only from `src/lib/richtext.ts`.
