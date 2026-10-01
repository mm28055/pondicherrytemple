import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_temple_pieces_topic" ADD VALUE 'history';
  ALTER TYPE "public"."enum_temple_pieces_topic" ADD VALUE 'stories';
  ALTER TYPE "public"."enum__temple_pieces_v_version_topic" ADD VALUE 'history';
  ALTER TYPE "public"."enum__temple_pieces_v_version_topic" ADD VALUE 'stories';
  ALTER TABLE "temple_pieces" ADD COLUMN "date" timestamp(3) with time zone;
  ALTER TABLE "_temple_pieces_v" ADD COLUMN "version_date" timestamp(3) with time zone;`)
  // Pieces written before there was a Date box: the day they were added.
  await db.execute(sql`
   UPDATE "temple_pieces" SET "date" = "created_at" WHERE "date" IS NULL;
  UPDATE "_temple_pieces_v" SET "version_date" = "version_created_at" WHERE "version_date" IS NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "temple_pieces" ALTER COLUMN "topic" SET DATA TYPE text;
  ALTER TABLE "temple_pieces" ALTER COLUMN "topic" SET DEFAULT 'temple'::text;
  DROP TYPE "public"."enum_temple_pieces_topic";
  CREATE TYPE "public"."enum_temple_pieces_topic" AS ENUM('temple', 'people');
  ALTER TABLE "temple_pieces" ALTER COLUMN "topic" SET DEFAULT 'temple'::"public"."enum_temple_pieces_topic";
  ALTER TABLE "temple_pieces" ALTER COLUMN "topic" SET DATA TYPE "public"."enum_temple_pieces_topic" USING "topic"::"public"."enum_temple_pieces_topic";
  ALTER TABLE "_temple_pieces_v" ALTER COLUMN "version_topic" SET DATA TYPE text;
  ALTER TABLE "_temple_pieces_v" ALTER COLUMN "version_topic" SET DEFAULT 'temple'::text;
  DROP TYPE "public"."enum__temple_pieces_v_version_topic";
  CREATE TYPE "public"."enum__temple_pieces_v_version_topic" AS ENUM('temple', 'people');
  ALTER TABLE "_temple_pieces_v" ALTER COLUMN "version_topic" SET DEFAULT 'temple'::"public"."enum__temple_pieces_v_version_topic";
  ALTER TABLE "_temple_pieces_v" ALTER COLUMN "version_topic" SET DATA TYPE "public"."enum__temple_pieces_v_version_topic" USING "version_topic"::"public"."enum__temple_pieces_v_version_topic";
  ALTER TABLE "temple_pieces" DROP COLUMN "date";
  ALTER TABLE "_temple_pieces_v" DROP COLUMN "version_date";`)
}
