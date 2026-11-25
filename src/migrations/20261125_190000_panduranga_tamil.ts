import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/* Panduranga Bhajanai's own Tamil name said Pandarinatha (the user, 25 November
   2026: each of the two names keeps its own Tamil word). Runs again harmlessly. */
export async function pandurangaTamilData({ db }: Pick<MigrateUpArgs, 'db'>): Promise<void> {
  await db.execute(
    sql`UPDATE "weekly_rituals" SET "tamil" = 'பாண்டுரங்க பஜனை' WHERE "what" = 'Panduranga Bhajanai' AND "tamil" = 'பண்டரிநாத பஜனை';`,
  )
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await pandurangaTamilData({ db })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // nothing to put back
}
