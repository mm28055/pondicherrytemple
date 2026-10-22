import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import type { PayloadRequest } from 'payload'
import { makeShownCopy } from '../payload/collections/Drawings'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "drawings" ADD COLUMN "cut" boolean DEFAULT true;
  ALTER TABLE "_drawings_v" ADD COLUMN "version_cut" boolean DEFAULT true;`)
  await drawingCutData({ db, payload, req })
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "drawings" DROP COLUMN "cut";
  ALTER TABLE "_drawings_v" DROP COLUMN "version_cut";`)
}

/* The Nandhikeswara Samadhi layout shown whole, as uploaded ("Cut to the
   drawing" off); then the copy the site shows made again for every drawing,
   now that a photographed sheet's shadows and colour cast are evened out
   before its paper is made clear (lib/drawingImage), and for one saved while
   the site was being updated, which has none (Nandhi Diagrammatic). The copy
   before it is removed. One whose file cannot be read just now keeps what it
   has. Exported for this computer's copy of the database (scripts). */
export async function drawingCutData({ db, payload, req }: Pick<MigrateUpArgs, 'db' | 'payload' | 'req'>): Promise<void> {
  await db.execute(sql`UPDATE "drawings" SET "cut" = false WHERE "title" ILIKE 'Nandhikeswara Samadhi%'`)
  await db.execute(sql`
   UPDATE "_drawings_v" SET "version_cut" = false
   WHERE "parent_id" IN (SELECT "id" FROM "drawings" WHERE "title" ILIKE 'Nandhikeswara Samadhi%')`)
  const found = await db.execute(sql`SELECT "id", "title", "image_id", "shown_id", "cut" FROM "drawings" WHERE "image_id" IS NOT NULL`)
  for (const r of found.rows as { id: number; title: string; image_id: number; shown_id: number | null; cut: boolean | null }[]) {
    try {
      const shown = await makeShownCopy({ ...req, payload } as PayloadRequest, Number(r.image_id), r.title, r.cut !== false)
      if (!shown) continue
      await db.execute(sql`UPDATE "drawings" SET "shown_id" = ${shown} WHERE "id" = ${r.id}`)
      await db.execute(sql`UPDATE "_drawings_v" SET "version_shown_id" = ${shown} WHERE "parent_id" = ${r.id}`)
      if (r.shown_id && Number(r.shown_id) !== shown)
        await payload.delete({ collection: 'media', id: Number(r.shown_id), req, overrideAccess: true, context: { skipRevalidate: true } }).catch(() => null)
    } catch (e) {
      payload.logger.warn(`drawing ${r.id}: its copy for the site could not be made again just now (${String(e)})`)
    }
  }
}
