import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_observances_months" AS ENUM('year', 'chithirai', 'vaikasi', 'aani', 'aadi', 'aavani', 'purattasi', 'aippasi', 'karthigai', 'margazhi', 'thai', 'masi', 'panguni');
  CREATE TYPE "public"."enum__observances_v_version_months" AS ENUM('year', 'chithirai', 'vaikasi', 'aani', 'aadi', 'aavani', 'purattasi', 'aippasi', 'karthigai', 'margazhi', 'thai', 'masi', 'panguni');
  CREATE TABLE "observances_months" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_observances_months",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_observances_v_version_months" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__observances_v_version_months",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "observances_months" ADD CONSTRAINT "observances_months_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."observances"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_observances_v_version_months" ADD CONSTRAINT "_observances_v_version_months_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_observances_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "observances_months_order_idx" ON "observances_months" USING btree ("order");
  CREATE INDEX "observances_months_parent_idx" ON "observances_months" USING btree ("parent_id");
  CREATE INDEX "_observances_v_version_months_order_idx" ON "_observances_v_version_months" USING btree ("order");
  CREATE INDEX "_observances_v_version_months_parent_idx" ON "_observances_v_version_months" USING btree ("parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "observances_months" CASCADE;
  DROP TABLE "_observances_v_version_months" CASCADE;
  DROP TYPE "public"."enum_observances_months";
  DROP TYPE "public"."enum__observances_v_version_months";`)
}
