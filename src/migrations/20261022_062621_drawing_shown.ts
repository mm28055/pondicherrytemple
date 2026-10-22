import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import type { PayloadRequest } from 'payload'
import { makeShownCopy } from '../payload/collections/Drawings'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "drawings" ADD COLUMN "shown_id" integer;
  ALTER TABLE "_drawings_v" ADD COLUMN "version_shown_id" integer;
  ALTER TABLE "drawings" ADD CONSTRAINT "drawings_shown_id_media_id_fk" FOREIGN KEY ("shown_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_drawings_v" ADD CONSTRAINT "_drawings_v_version_shown_id_media_id_fk" FOREIGN KEY ("version_shown_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "drawings_shown_idx" ON "drawings" USING btree ("shown_id");
  CREATE INDEX "_drawings_v_version_version_shown_idx" ON "_drawings_v" USING btree ("version_shown_id");`)
  await drawingShownData({ db, payload, req })
}

/* The copy the site shows (cut to the drawing, its paper clear) made for each
   drawing already uploaded (Draupadi Amman Koyil's layout), and set in the
   drawing and its saved versions. One whose file cannot be read just now is
   left shown as uploaded, and made when it is next saved. Exported for this
   computer's copy of the database (scripts). */
export async function drawingShownData({ db, payload, req }: Pick<MigrateUpArgs, 'db' | 'payload' | 'req'>): Promise<void> {
  const found = await db.execute(sql`SELECT "id", "title", "image_id" FROM "drawings" WHERE "image_id" IS NOT NULL AND "shown_id" IS NULL`)
  for (const r of found.rows as { id: number; title: string; image_id: number }[]) {
    try {
      const shown = await makeShownCopy({ ...req, payload } as PayloadRequest, Number(r.image_id), r.title)
      if (!shown) continue
      await db.execute(sql`UPDATE "drawings" SET "shown_id" = ${shown} WHERE "id" = ${r.id}`)
      await db.execute(sql`UPDATE "_drawings_v" SET "version_shown_id" = ${shown} WHERE "parent_id" = ${r.id}`)
    } catch (e) {
      payload.logger.warn(`drawing ${r.id}: its copy for the site could not be made just now (${String(e)})`)
    }
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "drawings" DROP CONSTRAINT "drawings_shown_id_media_id_fk";
  
  ALTER TABLE "_drawings_v" DROP CONSTRAINT "_drawings_v_version_shown_id_media_id_fk";
  
  DROP INDEX "drawings_shown_idx";
  DROP INDEX "_drawings_v_version_version_shown_idx";
  ALTER TABLE "drawings" DROP COLUMN "shown_id";
  ALTER TABLE "_drawings_v" DROP COLUMN "version_shown_id";`)
}
