import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "section_descriptions" ALTER COLUMN "field_notes" SET DEFAULT 'Everything recorded at the temples — notes written on the day, interviews, videos and photographs. Working material, lightly edited: the raw stuff of everything else on this site.';
  ALTER TABLE "section_descriptions" ALTER COLUMN "films" SET DEFAULT 'Short films from the temples, newest first. Press one to play it here; each has its own page with the words that go with it.';
  ALTER TABLE "section_descriptions" ALTER COLUMN "articles" SET DEFAULT 'Essays and longer writing with a named author: on the temple, its festivals and rituals, and what they mean.';
  ALTER TABLE "section_descriptions" ALTER COLUMN "observances" SET DEFAULT 'The festivals and rituals we have been present for so far. Each is explained once, and gathers every field note and article about it, from every temple where it was seen.';
  ALTER TABLE "section_descriptions" ALTER COLUMN "books" SET DEFAULT 'Alongside this site, a book is being written from the year''s fieldwork. Below is its provisional shape — the parts it may contain. It will change as the writing does.';
  ALTER TABLE "section_descriptions" DROP COLUMN "media";
  ALTER TABLE "section_descriptions" DROP COLUMN "temples";
  ALTER TABLE "section_descriptions" DROP COLUMN "temple_pieces";
  ALTER TABLE "section_descriptions" DROP COLUMN "occasions";
  ALTER TABLE "section_descriptions" DROP COLUMN "drawings";
  ALTER TABLE "section_descriptions" DROP COLUMN "users";
  ALTER TABLE "section_descriptions" DROP COLUMN "regions";
  ALTER TABLE "section_descriptions" DROP COLUMN "home_page";
  ALTER TABLE "section_descriptions" DROP COLUMN "about_page";
  ALTER TABLE "section_descriptions" DROP COLUMN "instagram";`)

  // The boxes used to hold the admin's help lines. Any still holding one now
  // get the site's own opening line (a box someone rewrote is left alone).
  await db.execute(sql`
   UPDATE "section_descriptions" SET "field_notes" = 'Everything recorded at the temples — notes written on the day, interviews, videos and photographs. Working material, lightly edited: the raw stuff of everything else on this site.'
     WHERE "field_notes" = 'Everything recorded at the temples: what happened, in words, photographs and videos.';
   UPDATE "section_descriptions" SET "films" = 'Short films from the temples, newest first. Press one to play it here; each has its own page with the words that go with it.'
     WHERE "films" = 'Finished short films, such as the Centre’s Instagram reels. New Instagram posts arrive here as drafts every morning.';
   UPDATE "section_descriptions" SET "articles" = 'Essays and longer writing with a named author: on the temple, its festivals and rituals, and what they mean.'
     WHERE "articles" = 'Essays and finished pieces. Tag a temple or festival only if the article actually discusses it.';
   UPDATE "section_descriptions" SET "observances" = 'The festivals and rituals we have been present for so far. Each is explained once, and gathers every field note and article about it, from every temple where it was seen.'
     WHERE "observances" = 'Each festival or ritual is explained once. Its page then gathers every temple, date, field note and article tagged with it.';
   UPDATE "section_descriptions" SET "books" = 'Alongside this site, a book is being written from the year''s fieldwork. Below is its provisional shape — the parts it may contain. It will change as the writing does.'
     WHERE "books" = 'The outline shown on The Book page. It will change as the writing does.';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "section_descriptions" ALTER COLUMN "observances" SET DEFAULT 'Each festival or ritual is explained once. Its page then gathers every temple, date, field note and article tagged with it.';
  ALTER TABLE "section_descriptions" ALTER COLUMN "field_notes" SET DEFAULT 'Everything recorded at the temples: what happened, in words, photographs and videos.';
  ALTER TABLE "section_descriptions" ALTER COLUMN "films" SET DEFAULT 'Finished short films, such as the Centre’s Instagram reels. New Instagram posts arrive here as drafts every morning.';
  ALTER TABLE "section_descriptions" ALTER COLUMN "articles" SET DEFAULT 'Essays and finished pieces. Tag a temple or festival only if the article actually discusses it.';
  ALTER TABLE "section_descriptions" ALTER COLUMN "books" SET DEFAULT 'The outline shown on The Book page. It will change as the writing does.';
  ALTER TABLE "section_descriptions" ADD COLUMN "media" varchar DEFAULT 'Every photo, video, recording and document. Drag several files in at once to upload them together.';
  ALTER TABLE "section_descriptions" ADD COLUMN "temples" varchar DEFAULT 'The temples being documented, in the order the site shows them — drag to reorder. Open a temple to edit everything on its page.';
  ALTER TABLE "section_descriptions" ADD COLUMN "temple_pieces" varchar DEFAULT 'Short finished pieces for the "The temple" and "The people" sections of temple pages, polished from the field notes.';
  ALTER TABLE "section_descriptions" ADD COLUMN "occasions" varchar DEFAULT 'Every occasion the team was present for. These make each temple''s ''year so far'', and the ''where we''ve seen it'' list on festival pages.';
  ALTER TABLE "section_descriptions" ADD COLUMN "drawings" varchar DEFAULT 'Abishek''s drawings: each temple''s illustrated plan, and scenes photographs can''t capture. A drawing appears at the top of every temple and festival page it is tagged with.';
  ALTER TABLE "section_descriptions" ADD COLUMN "users" varchar DEFAULT 'Everyone who can sign in. Admins add people here and choose what they can do.';
  ALTER TABLE "section_descriptions" ADD COLUMN "regions" varchar DEFAULT 'The towns the project documents. Only Pondicherry for now.';
  ALTER TABLE "section_descriptions" ADD COLUMN "home_page" varchar DEFAULT 'The words on the home page. The newest additions, temples and festivals shown there fill themselves in. "Save" puts changes on the site.';
  ALTER TABLE "section_descriptions" ADD COLUMN "about_page" varchar DEFAULT 'Everything on the About page. Drag sections to reorder them. "Save" puts changes on the site.';
  ALTER TABLE "section_descriptions" ADD COLUMN "instagram" varchar DEFAULT 'New Instagram videos arrive every morning as draft films, marked "awaiting review". Nothing appears on the site until someone checks the temples, festivals and consent, and publishes it.';`)
}
