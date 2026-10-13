import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_drawings_faces" AS ENUM('north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west');
  CREATE TYPE "public"."enum__drawings_v_version_faces" AS ENUM('north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west');
  ALTER TABLE "drawings" ADD COLUMN "faces" "enum_drawings_faces" DEFAULT 'east';
  ALTER TABLE "_drawings_v" ADD COLUMN "version_faces" "enum__drawings_v_version_faces" DEFAULT 'east';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "drawings" DROP COLUMN "faces";
  ALTER TABLE "_drawings_v" DROP COLUMN "version_faces";
  DROP TYPE "public"."enum_drawings_faces";
  DROP TYPE "public"."enum__drawings_v_version_faces";`)
}
