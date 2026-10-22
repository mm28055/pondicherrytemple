import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "weekly_rituals_at_temples_times_days" CASCADE;
  DROP TYPE "public"."enum_weekly_rituals_at_temples_times_days";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_weekly_rituals_at_temples_times_days" AS ENUM('sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat');
  CREATE TABLE "weekly_rituals_at_temples_times_days" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_weekly_rituals_at_temples_times_days",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "weekly_rituals_at_temples_times_days" ADD CONSTRAINT "weekly_rituals_at_temples_times_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."weekly_rituals_at_temples_times"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "weekly_rituals_at_temples_times_days_order_idx" ON "weekly_rituals_at_temples_times_days" USING btree ("order");
  CREATE INDEX "weekly_rituals_at_temples_times_days_parent_idx" ON "weekly_rituals_at_temples_times_days" USING btree ("parent_id");`)
}
