import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/* Puja in Tamil is பூசை throughout (25 November 2026; it was பூஜை in the names
   of the festivals and rituals, கோபூஜை among them). Their Tamil names only:
   the words of a song quoted in a field note are left as they are. Plain
   SQL, so it needs no column beyond these; runs again harmlessly. */
export async function poosaiData({ db }: Pick<MigrateUpArgs, 'db'>): Promise<void> {
  await db.execute(sql`UPDATE "observances" SET "tamil" = replace("tamil", 'பூஜை', 'பூசை') WHERE "tamil" LIKE '%பூஜை%';`)
  await db.execute(sql`UPDATE "_observances_v" SET "version_tamil" = replace("version_tamil", 'பூஜை', 'பூசை') WHERE "version_tamil" LIKE '%பூஜை%';`)
  await db.execute(sql`UPDATE "weekly_rituals" SET "tamil" = replace("tamil", 'பூஜை', 'பூசை') WHERE "tamil" LIKE '%பூஜை%';`)
  await db.execute(sql`UPDATE "weekly_rituals_at_temples" SET "tamil" = replace("tamil", 'பூஜை', 'பூசை') WHERE "tamil" LIKE '%பூஜை%';`)
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await poosaiData({ db })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // which were written with ஜ is not kept: nothing to put back
}
