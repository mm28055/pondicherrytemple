import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "varam" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"sun" varchar,
  	"mon" varchar,
  	"tue" varchar,
  	"wed" varchar,
  	"thu" varchar,
  	"fri" varchar,
  	"sat" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "varam" CASCADE;`)
}
