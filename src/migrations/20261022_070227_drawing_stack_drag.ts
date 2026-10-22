import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "drawings" ADD COLUMN "_drawings_drawings_order" varchar;
  ALTER TABLE "_drawings_v" ADD COLUMN "version__drawings_drawings_order" varchar;
  CREATE INDEX "drawings__drawings_drawings_order_idx" ON "drawings" USING btree ("_drawings_drawings_order");
  CREATE INDEX "_drawings_v_version_version__drawings_drawings_order_idx" ON "_drawings_v" USING btree ("version__drawings_drawings_order");`)
  await drawingStackOrderData(db)
}

/* Each drawing placed in the order the stacks have now (the old "Order in the
   stack of layouts", 1 on top; then the rest, oldest first), so dragging in a
   temple's Drawings tab starts from what the site shows: the keys the admin's
   dragging uses (fractional indexing: a0, a1, … a9, aA, … az, then b followed
   by two), in that order. In the drawing and its saved versions. Exported for
   this computer's copy of the database (scripts). */
const DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const keyOf = (i: number) => (i < 62 ? `a${DIGITS[i]}` : `b${DIGITS[Math.floor(i / 62)]}${DIGITS[i % 62]}`)
export async function drawingStackOrderData(db: MigrateUpArgs['db']): Promise<void> {
  const found = await db.execute(sql`SELECT "id" FROM "drawings" ORDER BY "layout_order" ASC NULLS LAST, "id" ASC`)
  const rows = found.rows as { id: number }[]
  for (const [i, r] of rows.entries()) {
    await db.execute(sql`UPDATE "drawings" SET "_drawings_drawings_order" = ${keyOf(i)} WHERE "id" = ${r.id}`)
    await db.execute(sql`UPDATE "_drawings_v" SET "version__drawings_drawings_order" = ${keyOf(i)} WHERE "parent_id" = ${r.id}`)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "drawings__drawings_drawings_order_idx";
  DROP INDEX "_drawings_v_version_version__drawings_drawings_order_idx";
  ALTER TABLE "drawings" DROP COLUMN "_drawings_drawings_order";
  ALTER TABLE "_drawings_v" DROP COLUMN "version__drawings_drawings_order";`)
}
