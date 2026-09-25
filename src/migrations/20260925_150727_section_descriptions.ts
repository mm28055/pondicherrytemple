import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "section_descriptions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"field_notes" varchar DEFAULT 'Everything recorded at the temples: what happened, in words, photographs and videos.',
  	"films" varchar DEFAULT 'Finished short films, such as the Centre’s Instagram reels. New Instagram posts arrive here as drafts every morning.',
  	"articles" varchar DEFAULT 'Essays and finished pieces. Tag a temple or festival only if the article actually discusses it.',
  	"media" varchar DEFAULT 'Every photo, video, recording and document. Drag several files in at once to upload them together.',
  	"temples" varchar DEFAULT 'The temples being documented, in the order the site shows them — drag to reorder. Open a temple to edit everything on its page.',
  	"temple_pieces" varchar DEFAULT 'Short finished pieces for the "The temple" and "The people" sections of temple pages, polished from the field notes.',
  	"occasions" varchar DEFAULT 'Every occasion the team was present for. These make each temple''s ''year so far'', and the ''where we''ve seen it'' list on festival pages.',
  	"drawings" varchar DEFAULT 'Abishek''s drawings: each temple''s illustrated plan, and scenes photographs can''t capture. A drawing appears at the top of every temple and festival page it is tagged with.',
  	"observances" varchar DEFAULT 'Each festival or ritual is explained once. Its page then gathers every temple, date, field note and article tagged with it.',
  	"books" varchar DEFAULT 'The outline shown on The Book page. It will change as the writing does.',
  	"users" varchar DEFAULT 'Everyone who can sign in. Admins add people here and choose what they can do.',
  	"regions" varchar DEFAULT 'The towns the project documents. Only Pondicherry for now.',
  	"home_page" varchar DEFAULT 'The words on the home page. The newest additions, temples and festivals shown there fill themselves in. "Save" puts changes on the site.',
  	"about_page" varchar DEFAULT 'Everything on the About page. Drag sections to reorder them. "Save" puts changes on the site.',
  	"instagram" varchar DEFAULT 'New Instagram videos arrive every morning as draft films, marked "awaiting review". Nothing appears on the site until someone checks the temples, festivals and consent, and publishes it.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "section_descriptions" CASCADE;`)
}
