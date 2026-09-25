import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_field_notes_kind" AS ENUM('note', 'interview', 'video', 'audio', 'photos');
  CREATE TYPE "public"."enum_field_notes_review_status" AS ENUM('awaiting', 'approved');
  CREATE TYPE "public"."enum_field_notes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__field_notes_v_version_kind" AS ENUM('note', 'interview', 'video', 'audio', 'photos');
  CREATE TYPE "public"."enum__field_notes_v_version_review_status" AS ENUM('awaiting', 'approved');
  CREATE TYPE "public"."enum__field_notes_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_films_review_status" AS ENUM('awaiting', 'approved');
  CREATE TYPE "public"."enum_films_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__films_v_version_review_status" AS ENUM('awaiting', 'approved');
  CREATE TYPE "public"."enum__films_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_articles_review_status" AS ENUM('awaiting', 'approved');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_version_review_status" AS ENUM('awaiting', 'approved');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_media_consent" AS ENUM('not-needed', 'given', 'withhold');
  CREATE TYPE "public"."enum_temples_deity_group" AS ENUM('shiva', 'vishnu', 'amman', 'vinayaka', 'murugan');
  CREATE TYPE "public"."enum_temples_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__temples_v_version_deity_group" AS ENUM('shiva', 'vishnu', 'amman', 'vinayaka', 'murugan');
  CREATE TYPE "public"."enum__temples_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_temple_pieces_topic" AS ENUM('temple', 'people');
  CREATE TYPE "public"."enum_temple_pieces_review_status" AS ENUM('awaiting', 'approved');
  CREATE TYPE "public"."enum_temple_pieces_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__temple_pieces_v_version_topic" AS ENUM('temple', 'people');
  CREATE TYPE "public"."enum__temple_pieces_v_version_review_status" AS ENUM('awaiting', 'approved');
  CREATE TYPE "public"."enum__temple_pieces_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_drawings_kind" AS ENUM('plan', 'scene');
  CREATE TYPE "public"."enum_drawings_review_status" AS ENUM('awaiting', 'approved');
  CREATE TYPE "public"."enum_drawings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__drawings_v_version_kind" AS ENUM('plan', 'scene');
  CREATE TYPE "public"."enum__drawings_v_version_review_status" AS ENUM('awaiting', 'approved');
  CREATE TYPE "public"."enum__drawings_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_observances_kind" AS ENUM('festival', 'ritual');
  CREATE TYPE "public"."enum_observances_review_status" AS ENUM('awaiting', 'approved');
  CREATE TYPE "public"."enum_observances_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__observances_v_version_kind" AS ENUM('festival', 'ritual');
  CREATE TYPE "public"."enum__observances_v_version_review_status" AS ENUM('awaiting', 'approved');
  CREATE TYPE "public"."enum__observances_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_books_review_status" AS ENUM('awaiting', 'approved');
  CREATE TYPE "public"."enum_books_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__books_v_version_review_status" AS ENUM('awaiting', 'approved');
  CREATE TYPE "public"."enum__books_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor', 'contributor');
  CREATE TYPE "public"."enum_regions_calendar" AS ENUM('tamil');
  CREATE TABLE "field_notes_removed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "field_notes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"date" timestamp(3) with time zone,
  	"occasion" varchar,
  	"body" jsonb,
  	"kind" "enum_field_notes_kind" DEFAULT 'note',
  	"recording_id" integer,
  	"poster_id" integer,
  	"recording_caption" varchar,
  	"instagram_post_id" varchar,
  	"instagram_link" varchar,
  	"slug" varchar,
  	"region_id" integer,
  	"review_status" "enum_field_notes_review_status" DEFAULT 'awaiting',
  	"review_note" varchar,
  	"created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_field_notes_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "field_notes_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "field_notes_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"temples_id" integer,
  	"observances_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "_field_notes_v_version_removed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_field_notes_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_occasion" varchar,
  	"version_body" jsonb,
  	"version_kind" "enum__field_notes_v_version_kind" DEFAULT 'note',
  	"version_recording_id" integer,
  	"version_poster_id" integer,
  	"version_recording_caption" varchar,
  	"version_instagram_post_id" varchar,
  	"version_instagram_link" varchar,
  	"version_slug" varchar,
  	"version_region_id" integer,
  	"version_review_status" "enum__field_notes_v_version_review_status" DEFAULT 'awaiting',
  	"version_review_note" varchar,
  	"version_created_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__field_notes_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_field_notes_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_field_notes_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"temples_id" integer,
  	"observances_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "films" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"date" timestamp(3) with time zone,
  	"made_by" varchar,
  	"video_id" integer,
  	"body" jsonb,
  	"instagram_post_id" varchar,
  	"instagram_link" varchar,
  	"slug" varchar,
  	"region_id" integer,
  	"review_status" "enum_films_review_status" DEFAULT 'awaiting',
  	"review_note" varchar,
  	"created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_films_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "films_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"temples_id" integer,
  	"observances_id" integer
  );
  
  CREATE TABLE "_films_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_made_by" varchar,
  	"version_video_id" integer,
  	"version_body" jsonb,
  	"version_instagram_post_id" varchar,
  	"version_instagram_link" varchar,
  	"version_slug" varchar,
  	"version_region_id" integer,
  	"version_review_status" "enum__films_v_version_review_status" DEFAULT 'awaiting',
  	"version_review_note" varchar,
  	"version_created_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__films_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_films_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"temples_id" integer,
  	"observances_id" integer
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"author" varchar,
  	"date" timestamp(3) with time zone,
  	"teaser" varchar,
  	"body" jsonb,
  	"slug" varchar,
  	"review_status" "enum_articles_review_status" DEFAULT 'awaiting',
  	"review_note" varchar,
  	"created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "articles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"temples_id" integer,
  	"observances_id" integer
  );
  
  CREATE TABLE "_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_author" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_teaser" varchar,
  	"version_body" jsonb,
  	"version_slug" varchar,
  	"version_review_status" "enum__articles_v_version_review_status" DEFAULT 'awaiting',
  	"version_review_note" varchar,
  	"version_created_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_articles_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"temples_id" integer,
  	"observances_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"caption" varchar,
  	"credit" varchar,
  	"poster_id" integer,
  	"consent" "enum_media_consent" DEFAULT 'not-needed' NOT NULL,
  	"created_by_id" integer,
  	"prefix" varchar DEFAULT '',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar
  );
  
  CREATE TABLE "media_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"temples_id" integer
  );
  
  CREATE TABLE "temples" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"name" varchar,
  	"known_as" varchar,
  	"deity" varchar,
  	"deity_group" "enum_temples_deity_group",
  	"street" varchar,
  	"intro" jsonb,
  	"coordinates_lat" numeric,
  	"coordinates_lng" numeric,
  	"slug" varchar,
  	"region_id" integer,
  	"created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_temples_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_temples_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_name" varchar,
  	"version_known_as" varchar,
  	"version_deity" varchar,
  	"version_deity_group" "enum__temples_v_version_deity_group",
  	"version_street" varchar,
  	"version_intro" jsonb,
  	"version_coordinates_lat" numeric,
  	"version_coordinates_lng" numeric,
  	"version_slug" varchar,
  	"version_region_id" integer,
  	"version_created_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__temples_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "temple_pieces" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"topic" "enum_temple_pieces_topic" DEFAULT 'temple',
  	"body" jsonb,
  	"picture_id" integer,
  	"named_name" varchar,
  	"named_consent" varchar,
  	"region_id" integer,
  	"review_status" "enum_temple_pieces_review_status" DEFAULT 'awaiting',
  	"review_note" varchar,
  	"created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_temple_pieces_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "temple_pieces_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"temples_id" integer,
  	"field_notes_id" integer
  );
  
  CREATE TABLE "_temple_pieces_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_topic" "enum__temple_pieces_v_version_topic" DEFAULT 'temple',
  	"version_body" jsonb,
  	"version_picture_id" integer,
  	"version_named_name" varchar,
  	"version_named_consent" varchar,
  	"version_region_id" integer,
  	"version_review_status" "enum__temple_pieces_v_version_review_status" DEFAULT 'awaiting',
  	"version_review_note" varchar,
  	"version_created_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__temple_pieces_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_temple_pieces_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"temples_id" integer,
  	"field_notes_id" integer
  );
  
  CREATE TABLE "occasions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"temple_id" integer NOT NULL,
  	"label" varchar NOT NULL,
  	"field_note_id" integer,
  	"region_id" integer NOT NULL,
  	"created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "occasions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"observances_id" integer
  );
  
  CREATE TABLE "drawings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"kind" "enum_drawings_kind" DEFAULT 'scene',
  	"image_id" integer,
  	"caption" varchar,
  	"credit" varchar DEFAULT 'Drawing by Abishek P.',
  	"region_id" integer,
  	"review_status" "enum_drawings_review_status" DEFAULT 'awaiting',
  	"review_note" varchar,
  	"created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_drawings_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "drawings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"temples_id" integer,
  	"observances_id" integer
  );
  
  CREATE TABLE "_drawings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_kind" "enum__drawings_v_version_kind" DEFAULT 'scene',
  	"version_image_id" integer,
  	"version_caption" varchar,
  	"version_credit" varchar DEFAULT 'Drawing by Abishek P.',
  	"version_region_id" integer,
  	"version_review_status" "enum__drawings_v_version_review_status" DEFAULT 'awaiting',
  	"version_review_note" varchar,
  	"version_created_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__drawings_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_drawings_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"temples_id" integer,
  	"observances_id" integer
  );
  
  CREATE TABLE "observances_about" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb
  );
  
  CREATE TABLE "observances" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"tamil" varchar,
  	"kind" "enum_observances_kind" DEFAULT 'festival',
  	"also_known_as" varchar,
  	"gloss" varchar,
  	"slug" varchar,
  	"review_status" "enum_observances_review_status" DEFAULT 'awaiting',
  	"review_note" varchar,
  	"created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_observances_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_observances_v_version_about" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_observances_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_tamil" varchar,
  	"version_kind" "enum__observances_v_version_kind" DEFAULT 'festival',
  	"version_also_known_as" varchar,
  	"version_gloss" varchar,
  	"version_slug" varchar,
  	"version_review_status" "enum__observances_v_version_review_status" DEFAULT 'awaiting',
  	"version_review_note" varchar,
  	"version_created_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__observances_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "books_parts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"summary" varchar,
  	"link_label" varchar,
  	"link_href" varchar
  );
  
  CREATE TABLE "books" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'The Temples of Pondicherry',
  	"status" varchar,
  	"byline" varchar,
  	"illustrations" varchar,
  	"region_id" integer,
  	"review_status" "enum_books_review_status" DEFAULT 'awaiting',
  	"review_note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_books_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_books_v_version_parts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"summary" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_books_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar DEFAULT 'The Temples of Pondicherry',
  	"version_status" varchar,
  	"version_byline" varchar,
  	"version_illustrations" varchar,
  	"version_region_id" integer,
  	"version_review_status" "enum__books_v_version_review_status" DEFAULT 'awaiting',
  	"version_review_note" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__books_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "regions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"intro" jsonb,
  	"total_temples" numeric,
  	"calendar" "enum_regions_calendar" DEFAULT 'tamil' NOT NULL,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"field_notes_id" integer,
  	"films_id" integer,
  	"articles_id" integer,
  	"media_id" integer,
  	"temples_id" integer,
  	"temple_pieces_id" integer,
  	"occasions_id" integer,
  	"drawings_id" integer,
  	"observances_id" integer,
  	"books_id" integer,
  	"users_id" integer,
  	"regions_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar NOT NULL,
  	"opening" jsonb,
  	"quote" varchar,
  	"quote_by" varchar,
  	"book_heading" varchar,
  	"book_text" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_page_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"anchor" varchar,
  	"body" jsonb NOT NULL
  );
  
  CREATE TABLE "about_page_team" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar,
  	"bio" varchar
  );
  
  CREATE TABLE "about_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"lede" varchar NOT NULL,
  	"contact_text" varchar,
  	"contact_email" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "instagram" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"token" varchar,
  	"account" varchar,
  	"last_run" timestamp(3) with time zone,
  	"last_result" varchar,
  	"token_renewed" timestamp(3) with time zone,
  	"imported" jsonb DEFAULT '[]'::jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "field_notes_removed" ADD CONSTRAINT "field_notes_removed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."field_notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "field_notes" ADD CONSTRAINT "field_notes_recording_id_media_id_fk" FOREIGN KEY ("recording_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "field_notes" ADD CONSTRAINT "field_notes_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "field_notes" ADD CONSTRAINT "field_notes_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "field_notes" ADD CONSTRAINT "field_notes_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "field_notes_texts" ADD CONSTRAINT "field_notes_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."field_notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "field_notes_rels" ADD CONSTRAINT "field_notes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."field_notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "field_notes_rels" ADD CONSTRAINT "field_notes_rels_temples_fk" FOREIGN KEY ("temples_id") REFERENCES "public"."temples"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "field_notes_rels" ADD CONSTRAINT "field_notes_rels_observances_fk" FOREIGN KEY ("observances_id") REFERENCES "public"."observances"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "field_notes_rels" ADD CONSTRAINT "field_notes_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_field_notes_v_version_removed" ADD CONSTRAINT "_field_notes_v_version_removed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_field_notes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_field_notes_v" ADD CONSTRAINT "_field_notes_v_parent_id_field_notes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."field_notes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_field_notes_v" ADD CONSTRAINT "_field_notes_v_version_recording_id_media_id_fk" FOREIGN KEY ("version_recording_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_field_notes_v" ADD CONSTRAINT "_field_notes_v_version_poster_id_media_id_fk" FOREIGN KEY ("version_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_field_notes_v" ADD CONSTRAINT "_field_notes_v_version_region_id_regions_id_fk" FOREIGN KEY ("version_region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_field_notes_v" ADD CONSTRAINT "_field_notes_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_field_notes_v_texts" ADD CONSTRAINT "_field_notes_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_field_notes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_field_notes_v_rels" ADD CONSTRAINT "_field_notes_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_field_notes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_field_notes_v_rels" ADD CONSTRAINT "_field_notes_v_rels_temples_fk" FOREIGN KEY ("temples_id") REFERENCES "public"."temples"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_field_notes_v_rels" ADD CONSTRAINT "_field_notes_v_rels_observances_fk" FOREIGN KEY ("observances_id") REFERENCES "public"."observances"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_field_notes_v_rels" ADD CONSTRAINT "_field_notes_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "films" ADD CONSTRAINT "films_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "films" ADD CONSTRAINT "films_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "films" ADD CONSTRAINT "films_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "films_rels" ADD CONSTRAINT "films_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."films"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "films_rels" ADD CONSTRAINT "films_rels_temples_fk" FOREIGN KEY ("temples_id") REFERENCES "public"."temples"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "films_rels" ADD CONSTRAINT "films_rels_observances_fk" FOREIGN KEY ("observances_id") REFERENCES "public"."observances"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_films_v" ADD CONSTRAINT "_films_v_parent_id_films_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."films"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_films_v" ADD CONSTRAINT "_films_v_version_video_id_media_id_fk" FOREIGN KEY ("version_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_films_v" ADD CONSTRAINT "_films_v_version_region_id_regions_id_fk" FOREIGN KEY ("version_region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_films_v" ADD CONSTRAINT "_films_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_films_v_rels" ADD CONSTRAINT "_films_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_films_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_films_v_rels" ADD CONSTRAINT "_films_v_rels_temples_fk" FOREIGN KEY ("temples_id") REFERENCES "public"."temples"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_films_v_rels" ADD CONSTRAINT "_films_v_rels_observances_fk" FOREIGN KEY ("observances_id") REFERENCES "public"."observances"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_temples_fk" FOREIGN KEY ("temples_id") REFERENCES "public"."temples"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_observances_fk" FOREIGN KEY ("observances_id") REFERENCES "public"."observances"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_temples_fk" FOREIGN KEY ("temples_id") REFERENCES "public"."temples"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_observances_fk" FOREIGN KEY ("observances_id") REFERENCES "public"."observances"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_temples_fk" FOREIGN KEY ("temples_id") REFERENCES "public"."temples"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "temples" ADD CONSTRAINT "temples_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "temples" ADD CONSTRAINT "temples_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_temples_v" ADD CONSTRAINT "_temples_v_parent_id_temples_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."temples"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_temples_v" ADD CONSTRAINT "_temples_v_version_region_id_regions_id_fk" FOREIGN KEY ("version_region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_temples_v" ADD CONSTRAINT "_temples_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "temple_pieces" ADD CONSTRAINT "temple_pieces_picture_id_media_id_fk" FOREIGN KEY ("picture_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "temple_pieces" ADD CONSTRAINT "temple_pieces_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "temple_pieces" ADD CONSTRAINT "temple_pieces_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "temple_pieces_rels" ADD CONSTRAINT "temple_pieces_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."temple_pieces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "temple_pieces_rels" ADD CONSTRAINT "temple_pieces_rels_temples_fk" FOREIGN KEY ("temples_id") REFERENCES "public"."temples"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "temple_pieces_rels" ADD CONSTRAINT "temple_pieces_rels_field_notes_fk" FOREIGN KEY ("field_notes_id") REFERENCES "public"."field_notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_temple_pieces_v" ADD CONSTRAINT "_temple_pieces_v_parent_id_temple_pieces_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."temple_pieces"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_temple_pieces_v" ADD CONSTRAINT "_temple_pieces_v_version_picture_id_media_id_fk" FOREIGN KEY ("version_picture_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_temple_pieces_v" ADD CONSTRAINT "_temple_pieces_v_version_region_id_regions_id_fk" FOREIGN KEY ("version_region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_temple_pieces_v" ADD CONSTRAINT "_temple_pieces_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_temple_pieces_v_rels" ADD CONSTRAINT "_temple_pieces_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_temple_pieces_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_temple_pieces_v_rels" ADD CONSTRAINT "_temple_pieces_v_rels_temples_fk" FOREIGN KEY ("temples_id") REFERENCES "public"."temples"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_temple_pieces_v_rels" ADD CONSTRAINT "_temple_pieces_v_rels_field_notes_fk" FOREIGN KEY ("field_notes_id") REFERENCES "public"."field_notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "occasions" ADD CONSTRAINT "occasions_temple_id_temples_id_fk" FOREIGN KEY ("temple_id") REFERENCES "public"."temples"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "occasions" ADD CONSTRAINT "occasions_field_note_id_field_notes_id_fk" FOREIGN KEY ("field_note_id") REFERENCES "public"."field_notes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "occasions" ADD CONSTRAINT "occasions_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "occasions" ADD CONSTRAINT "occasions_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "occasions_rels" ADD CONSTRAINT "occasions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."occasions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "occasions_rels" ADD CONSTRAINT "occasions_rels_observances_fk" FOREIGN KEY ("observances_id") REFERENCES "public"."observances"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "drawings" ADD CONSTRAINT "drawings_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "drawings" ADD CONSTRAINT "drawings_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "drawings" ADD CONSTRAINT "drawings_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "drawings_rels" ADD CONSTRAINT "drawings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."drawings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "drawings_rels" ADD CONSTRAINT "drawings_rels_temples_fk" FOREIGN KEY ("temples_id") REFERENCES "public"."temples"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "drawings_rels" ADD CONSTRAINT "drawings_rels_observances_fk" FOREIGN KEY ("observances_id") REFERENCES "public"."observances"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_drawings_v" ADD CONSTRAINT "_drawings_v_parent_id_drawings_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."drawings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_drawings_v" ADD CONSTRAINT "_drawings_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_drawings_v" ADD CONSTRAINT "_drawings_v_version_region_id_regions_id_fk" FOREIGN KEY ("version_region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_drawings_v" ADD CONSTRAINT "_drawings_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_drawings_v_rels" ADD CONSTRAINT "_drawings_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_drawings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_drawings_v_rels" ADD CONSTRAINT "_drawings_v_rels_temples_fk" FOREIGN KEY ("temples_id") REFERENCES "public"."temples"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_drawings_v_rels" ADD CONSTRAINT "_drawings_v_rels_observances_fk" FOREIGN KEY ("observances_id") REFERENCES "public"."observances"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "observances_about" ADD CONSTRAINT "observances_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."observances"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "observances" ADD CONSTRAINT "observances_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_observances_v_version_about" ADD CONSTRAINT "_observances_v_version_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_observances_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_observances_v" ADD CONSTRAINT "_observances_v_parent_id_observances_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."observances"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_observances_v" ADD CONSTRAINT "_observances_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "books_parts" ADD CONSTRAINT "books_parts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "books" ADD CONSTRAINT "books_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_books_v_version_parts" ADD CONSTRAINT "_books_v_version_parts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_books_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_books_v" ADD CONSTRAINT "_books_v_parent_id_books_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_books_v" ADD CONSTRAINT "_books_v_version_region_id_regions_id_fk" FOREIGN KEY ("version_region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_field_notes_fk" FOREIGN KEY ("field_notes_id") REFERENCES "public"."field_notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_films_fk" FOREIGN KEY ("films_id") REFERENCES "public"."films"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_temples_fk" FOREIGN KEY ("temples_id") REFERENCES "public"."temples"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_temple_pieces_fk" FOREIGN KEY ("temple_pieces_id") REFERENCES "public"."temple_pieces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_occasions_fk" FOREIGN KEY ("occasions_id") REFERENCES "public"."occasions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_drawings_fk" FOREIGN KEY ("drawings_id") REFERENCES "public"."drawings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_observances_fk" FOREIGN KEY ("observances_id") REFERENCES "public"."observances"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_books_fk" FOREIGN KEY ("books_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_regions_fk" FOREIGN KEY ("regions_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_sections" ADD CONSTRAINT "about_page_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_team" ADD CONSTRAINT "about_page_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "field_notes_removed_order_idx" ON "field_notes_removed" USING btree ("_order");
  CREATE INDEX "field_notes_removed_parent_id_idx" ON "field_notes_removed" USING btree ("_parent_id");
  CREATE INDEX "field_notes_recording_idx" ON "field_notes" USING btree ("recording_id");
  CREATE INDEX "field_notes_poster_idx" ON "field_notes" USING btree ("poster_id");
  CREATE INDEX "field_notes_instagram_instagram_post_id_idx" ON "field_notes" USING btree ("instagram_post_id");
  CREATE UNIQUE INDEX "field_notes_slug_idx" ON "field_notes" USING btree ("slug");
  CREATE INDEX "field_notes_region_idx" ON "field_notes" USING btree ("region_id");
  CREATE INDEX "field_notes_created_by_idx" ON "field_notes" USING btree ("created_by_id");
  CREATE INDEX "field_notes_updated_at_idx" ON "field_notes" USING btree ("updated_at");
  CREATE INDEX "field_notes_created_at_idx" ON "field_notes" USING btree ("created_at");
  CREATE INDEX "field_notes__status_idx" ON "field_notes" USING btree ("_status");
  CREATE INDEX "field_notes_texts_order_parent" ON "field_notes_texts" USING btree ("order","parent_id");
  CREATE INDEX "field_notes_rels_order_idx" ON "field_notes_rels" USING btree ("order");
  CREATE INDEX "field_notes_rels_parent_idx" ON "field_notes_rels" USING btree ("parent_id");
  CREATE INDEX "field_notes_rels_path_idx" ON "field_notes_rels" USING btree ("path");
  CREATE INDEX "field_notes_rels_temples_id_idx" ON "field_notes_rels" USING btree ("temples_id");
  CREATE INDEX "field_notes_rels_observances_id_idx" ON "field_notes_rels" USING btree ("observances_id");
  CREATE INDEX "field_notes_rels_media_id_idx" ON "field_notes_rels" USING btree ("media_id");
  CREATE INDEX "_field_notes_v_version_removed_order_idx" ON "_field_notes_v_version_removed" USING btree ("_order");
  CREATE INDEX "_field_notes_v_version_removed_parent_id_idx" ON "_field_notes_v_version_removed" USING btree ("_parent_id");
  CREATE INDEX "_field_notes_v_parent_idx" ON "_field_notes_v" USING btree ("parent_id");
  CREATE INDEX "_field_notes_v_version_version_recording_idx" ON "_field_notes_v" USING btree ("version_recording_id");
  CREATE INDEX "_field_notes_v_version_version_poster_idx" ON "_field_notes_v" USING btree ("version_poster_id");
  CREATE INDEX "_field_notes_v_version_instagram_version_instagram_post__idx" ON "_field_notes_v" USING btree ("version_instagram_post_id");
  CREATE INDEX "_field_notes_v_version_version_slug_idx" ON "_field_notes_v" USING btree ("version_slug");
  CREATE INDEX "_field_notes_v_version_version_region_idx" ON "_field_notes_v" USING btree ("version_region_id");
  CREATE INDEX "_field_notes_v_version_version_created_by_idx" ON "_field_notes_v" USING btree ("version_created_by_id");
  CREATE INDEX "_field_notes_v_version_version_updated_at_idx" ON "_field_notes_v" USING btree ("version_updated_at");
  CREATE INDEX "_field_notes_v_version_version_created_at_idx" ON "_field_notes_v" USING btree ("version_created_at");
  CREATE INDEX "_field_notes_v_version_version__status_idx" ON "_field_notes_v" USING btree ("version__status");
  CREATE INDEX "_field_notes_v_created_at_idx" ON "_field_notes_v" USING btree ("created_at");
  CREATE INDEX "_field_notes_v_updated_at_idx" ON "_field_notes_v" USING btree ("updated_at");
  CREATE INDEX "_field_notes_v_latest_idx" ON "_field_notes_v" USING btree ("latest");
  CREATE INDEX "_field_notes_v_autosave_idx" ON "_field_notes_v" USING btree ("autosave");
  CREATE INDEX "_field_notes_v_texts_order_parent" ON "_field_notes_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_field_notes_v_rels_order_idx" ON "_field_notes_v_rels" USING btree ("order");
  CREATE INDEX "_field_notes_v_rels_parent_idx" ON "_field_notes_v_rels" USING btree ("parent_id");
  CREATE INDEX "_field_notes_v_rels_path_idx" ON "_field_notes_v_rels" USING btree ("path");
  CREATE INDEX "_field_notes_v_rels_temples_id_idx" ON "_field_notes_v_rels" USING btree ("temples_id");
  CREATE INDEX "_field_notes_v_rels_observances_id_idx" ON "_field_notes_v_rels" USING btree ("observances_id");
  CREATE INDEX "_field_notes_v_rels_media_id_idx" ON "_field_notes_v_rels" USING btree ("media_id");
  CREATE INDEX "films_video_idx" ON "films" USING btree ("video_id");
  CREATE INDEX "films_instagram_instagram_post_id_idx" ON "films" USING btree ("instagram_post_id");
  CREATE UNIQUE INDEX "films_slug_idx" ON "films" USING btree ("slug");
  CREATE INDEX "films_region_idx" ON "films" USING btree ("region_id");
  CREATE INDEX "films_created_by_idx" ON "films" USING btree ("created_by_id");
  CREATE INDEX "films_updated_at_idx" ON "films" USING btree ("updated_at");
  CREATE INDEX "films_created_at_idx" ON "films" USING btree ("created_at");
  CREATE INDEX "films__status_idx" ON "films" USING btree ("_status");
  CREATE INDEX "films_rels_order_idx" ON "films_rels" USING btree ("order");
  CREATE INDEX "films_rels_parent_idx" ON "films_rels" USING btree ("parent_id");
  CREATE INDEX "films_rels_path_idx" ON "films_rels" USING btree ("path");
  CREATE INDEX "films_rels_temples_id_idx" ON "films_rels" USING btree ("temples_id");
  CREATE INDEX "films_rels_observances_id_idx" ON "films_rels" USING btree ("observances_id");
  CREATE INDEX "_films_v_parent_idx" ON "_films_v" USING btree ("parent_id");
  CREATE INDEX "_films_v_version_version_video_idx" ON "_films_v" USING btree ("version_video_id");
  CREATE INDEX "_films_v_version_instagram_version_instagram_post_id_idx" ON "_films_v" USING btree ("version_instagram_post_id");
  CREATE INDEX "_films_v_version_version_slug_idx" ON "_films_v" USING btree ("version_slug");
  CREATE INDEX "_films_v_version_version_region_idx" ON "_films_v" USING btree ("version_region_id");
  CREATE INDEX "_films_v_version_version_created_by_idx" ON "_films_v" USING btree ("version_created_by_id");
  CREATE INDEX "_films_v_version_version_updated_at_idx" ON "_films_v" USING btree ("version_updated_at");
  CREATE INDEX "_films_v_version_version_created_at_idx" ON "_films_v" USING btree ("version_created_at");
  CREATE INDEX "_films_v_version_version__status_idx" ON "_films_v" USING btree ("version__status");
  CREATE INDEX "_films_v_created_at_idx" ON "_films_v" USING btree ("created_at");
  CREATE INDEX "_films_v_updated_at_idx" ON "_films_v" USING btree ("updated_at");
  CREATE INDEX "_films_v_latest_idx" ON "_films_v" USING btree ("latest");
  CREATE INDEX "_films_v_autosave_idx" ON "_films_v" USING btree ("autosave");
  CREATE INDEX "_films_v_rels_order_idx" ON "_films_v_rels" USING btree ("order");
  CREATE INDEX "_films_v_rels_parent_idx" ON "_films_v_rels" USING btree ("parent_id");
  CREATE INDEX "_films_v_rels_path_idx" ON "_films_v_rels" USING btree ("path");
  CREATE INDEX "_films_v_rels_temples_id_idx" ON "_films_v_rels" USING btree ("temples_id");
  CREATE INDEX "_films_v_rels_observances_id_idx" ON "_films_v_rels" USING btree ("observances_id");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_created_by_idx" ON "articles" USING btree ("created_by_id");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE INDEX "articles_rels_order_idx" ON "articles_rels" USING btree ("order");
  CREATE INDEX "articles_rels_parent_idx" ON "articles_rels" USING btree ("parent_id");
  CREATE INDEX "articles_rels_path_idx" ON "articles_rels" USING btree ("path");
  CREATE INDEX "articles_rels_temples_id_idx" ON "articles_rels" USING btree ("temples_id");
  CREATE INDEX "articles_rels_observances_id_idx" ON "articles_rels" USING btree ("observances_id");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "_articles_v" USING btree ("version_slug");
  CREATE INDEX "_articles_v_version_version_created_by_idx" ON "_articles_v" USING btree ("version_created_by_id");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE INDEX "_articles_v_autosave_idx" ON "_articles_v" USING btree ("autosave");
  CREATE INDEX "_articles_v_rels_order_idx" ON "_articles_v_rels" USING btree ("order");
  CREATE INDEX "_articles_v_rels_parent_idx" ON "_articles_v_rels" USING btree ("parent_id");
  CREATE INDEX "_articles_v_rels_path_idx" ON "_articles_v_rels" USING btree ("path");
  CREATE INDEX "_articles_v_rels_temples_id_idx" ON "_articles_v_rels" USING btree ("temples_id");
  CREATE INDEX "_articles_v_rels_observances_id_idx" ON "_articles_v_rels" USING btree ("observances_id");
  CREATE INDEX "media_poster_idx" ON "media" USING btree ("poster_id");
  CREATE INDEX "media_created_by_idx" ON "media" USING btree ("created_by_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_rels_order_idx" ON "media_rels" USING btree ("order");
  CREATE INDEX "media_rels_parent_idx" ON "media_rels" USING btree ("parent_id");
  CREATE INDEX "media_rels_path_idx" ON "media_rels" USING btree ("path");
  CREATE INDEX "media_rels_temples_id_idx" ON "media_rels" USING btree ("temples_id");
  CREATE INDEX "temples__order_idx" ON "temples" USING btree ("_order");
  CREATE UNIQUE INDEX "temples_slug_idx" ON "temples" USING btree ("slug");
  CREATE INDEX "temples_region_idx" ON "temples" USING btree ("region_id");
  CREATE INDEX "temples_created_by_idx" ON "temples" USING btree ("created_by_id");
  CREATE INDEX "temples_updated_at_idx" ON "temples" USING btree ("updated_at");
  CREATE INDEX "temples_created_at_idx" ON "temples" USING btree ("created_at");
  CREATE INDEX "temples__status_idx" ON "temples" USING btree ("_status");
  CREATE INDEX "_temples_v_parent_idx" ON "_temples_v" USING btree ("parent_id");
  CREATE INDEX "_temples_v_version_version__order_idx" ON "_temples_v" USING btree ("version__order");
  CREATE INDEX "_temples_v_version_version_slug_idx" ON "_temples_v" USING btree ("version_slug");
  CREATE INDEX "_temples_v_version_version_region_idx" ON "_temples_v" USING btree ("version_region_id");
  CREATE INDEX "_temples_v_version_version_created_by_idx" ON "_temples_v" USING btree ("version_created_by_id");
  CREATE INDEX "_temples_v_version_version_updated_at_idx" ON "_temples_v" USING btree ("version_updated_at");
  CREATE INDEX "_temples_v_version_version_created_at_idx" ON "_temples_v" USING btree ("version_created_at");
  CREATE INDEX "_temples_v_version_version__status_idx" ON "_temples_v" USING btree ("version__status");
  CREATE INDEX "_temples_v_created_at_idx" ON "_temples_v" USING btree ("created_at");
  CREATE INDEX "_temples_v_updated_at_idx" ON "_temples_v" USING btree ("updated_at");
  CREATE INDEX "_temples_v_latest_idx" ON "_temples_v" USING btree ("latest");
  CREATE INDEX "temple_pieces_picture_idx" ON "temple_pieces" USING btree ("picture_id");
  CREATE INDEX "temple_pieces_region_idx" ON "temple_pieces" USING btree ("region_id");
  CREATE INDEX "temple_pieces_created_by_idx" ON "temple_pieces" USING btree ("created_by_id");
  CREATE INDEX "temple_pieces_updated_at_idx" ON "temple_pieces" USING btree ("updated_at");
  CREATE INDEX "temple_pieces_created_at_idx" ON "temple_pieces" USING btree ("created_at");
  CREATE INDEX "temple_pieces__status_idx" ON "temple_pieces" USING btree ("_status");
  CREATE INDEX "temple_pieces_rels_order_idx" ON "temple_pieces_rels" USING btree ("order");
  CREATE INDEX "temple_pieces_rels_parent_idx" ON "temple_pieces_rels" USING btree ("parent_id");
  CREATE INDEX "temple_pieces_rels_path_idx" ON "temple_pieces_rels" USING btree ("path");
  CREATE INDEX "temple_pieces_rels_temples_id_idx" ON "temple_pieces_rels" USING btree ("temples_id");
  CREATE INDEX "temple_pieces_rels_field_notes_id_idx" ON "temple_pieces_rels" USING btree ("field_notes_id");
  CREATE INDEX "_temple_pieces_v_parent_idx" ON "_temple_pieces_v" USING btree ("parent_id");
  CREATE INDEX "_temple_pieces_v_version_version_picture_idx" ON "_temple_pieces_v" USING btree ("version_picture_id");
  CREATE INDEX "_temple_pieces_v_version_version_region_idx" ON "_temple_pieces_v" USING btree ("version_region_id");
  CREATE INDEX "_temple_pieces_v_version_version_created_by_idx" ON "_temple_pieces_v" USING btree ("version_created_by_id");
  CREATE INDEX "_temple_pieces_v_version_version_updated_at_idx" ON "_temple_pieces_v" USING btree ("version_updated_at");
  CREATE INDEX "_temple_pieces_v_version_version_created_at_idx" ON "_temple_pieces_v" USING btree ("version_created_at");
  CREATE INDEX "_temple_pieces_v_version_version__status_idx" ON "_temple_pieces_v" USING btree ("version__status");
  CREATE INDEX "_temple_pieces_v_created_at_idx" ON "_temple_pieces_v" USING btree ("created_at");
  CREATE INDEX "_temple_pieces_v_updated_at_idx" ON "_temple_pieces_v" USING btree ("updated_at");
  CREATE INDEX "_temple_pieces_v_latest_idx" ON "_temple_pieces_v" USING btree ("latest");
  CREATE INDEX "_temple_pieces_v_autosave_idx" ON "_temple_pieces_v" USING btree ("autosave");
  CREATE INDEX "_temple_pieces_v_rels_order_idx" ON "_temple_pieces_v_rels" USING btree ("order");
  CREATE INDEX "_temple_pieces_v_rels_parent_idx" ON "_temple_pieces_v_rels" USING btree ("parent_id");
  CREATE INDEX "_temple_pieces_v_rels_path_idx" ON "_temple_pieces_v_rels" USING btree ("path");
  CREATE INDEX "_temple_pieces_v_rels_temples_id_idx" ON "_temple_pieces_v_rels" USING btree ("temples_id");
  CREATE INDEX "_temple_pieces_v_rels_field_notes_id_idx" ON "_temple_pieces_v_rels" USING btree ("field_notes_id");
  CREATE INDEX "occasions_temple_idx" ON "occasions" USING btree ("temple_id");
  CREATE INDEX "occasions_field_note_idx" ON "occasions" USING btree ("field_note_id");
  CREATE INDEX "occasions_region_idx" ON "occasions" USING btree ("region_id");
  CREATE INDEX "occasions_created_by_idx" ON "occasions" USING btree ("created_by_id");
  CREATE INDEX "occasions_updated_at_idx" ON "occasions" USING btree ("updated_at");
  CREATE INDEX "occasions_created_at_idx" ON "occasions" USING btree ("created_at");
  CREATE INDEX "occasions_rels_order_idx" ON "occasions_rels" USING btree ("order");
  CREATE INDEX "occasions_rels_parent_idx" ON "occasions_rels" USING btree ("parent_id");
  CREATE INDEX "occasions_rels_path_idx" ON "occasions_rels" USING btree ("path");
  CREATE INDEX "occasions_rels_observances_id_idx" ON "occasions_rels" USING btree ("observances_id");
  CREATE INDEX "drawings_image_idx" ON "drawings" USING btree ("image_id");
  CREATE INDEX "drawings_region_idx" ON "drawings" USING btree ("region_id");
  CREATE INDEX "drawings_created_by_idx" ON "drawings" USING btree ("created_by_id");
  CREATE INDEX "drawings_updated_at_idx" ON "drawings" USING btree ("updated_at");
  CREATE INDEX "drawings_created_at_idx" ON "drawings" USING btree ("created_at");
  CREATE INDEX "drawings__status_idx" ON "drawings" USING btree ("_status");
  CREATE INDEX "drawings_rels_order_idx" ON "drawings_rels" USING btree ("order");
  CREATE INDEX "drawings_rels_parent_idx" ON "drawings_rels" USING btree ("parent_id");
  CREATE INDEX "drawings_rels_path_idx" ON "drawings_rels" USING btree ("path");
  CREATE INDEX "drawings_rels_temples_id_idx" ON "drawings_rels" USING btree ("temples_id");
  CREATE INDEX "drawings_rels_observances_id_idx" ON "drawings_rels" USING btree ("observances_id");
  CREATE INDEX "_drawings_v_parent_idx" ON "_drawings_v" USING btree ("parent_id");
  CREATE INDEX "_drawings_v_version_version_image_idx" ON "_drawings_v" USING btree ("version_image_id");
  CREATE INDEX "_drawings_v_version_version_region_idx" ON "_drawings_v" USING btree ("version_region_id");
  CREATE INDEX "_drawings_v_version_version_created_by_idx" ON "_drawings_v" USING btree ("version_created_by_id");
  CREATE INDEX "_drawings_v_version_version_updated_at_idx" ON "_drawings_v" USING btree ("version_updated_at");
  CREATE INDEX "_drawings_v_version_version_created_at_idx" ON "_drawings_v" USING btree ("version_created_at");
  CREATE INDEX "_drawings_v_version_version__status_idx" ON "_drawings_v" USING btree ("version__status");
  CREATE INDEX "_drawings_v_created_at_idx" ON "_drawings_v" USING btree ("created_at");
  CREATE INDEX "_drawings_v_updated_at_idx" ON "_drawings_v" USING btree ("updated_at");
  CREATE INDEX "_drawings_v_latest_idx" ON "_drawings_v" USING btree ("latest");
  CREATE INDEX "_drawings_v_rels_order_idx" ON "_drawings_v_rels" USING btree ("order");
  CREATE INDEX "_drawings_v_rels_parent_idx" ON "_drawings_v_rels" USING btree ("parent_id");
  CREATE INDEX "_drawings_v_rels_path_idx" ON "_drawings_v_rels" USING btree ("path");
  CREATE INDEX "_drawings_v_rels_temples_id_idx" ON "_drawings_v_rels" USING btree ("temples_id");
  CREATE INDEX "_drawings_v_rels_observances_id_idx" ON "_drawings_v_rels" USING btree ("observances_id");
  CREATE INDEX "observances_about_order_idx" ON "observances_about" USING btree ("_order");
  CREATE INDEX "observances_about_parent_id_idx" ON "observances_about" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "observances_slug_idx" ON "observances" USING btree ("slug");
  CREATE INDEX "observances_created_by_idx" ON "observances" USING btree ("created_by_id");
  CREATE INDEX "observances_updated_at_idx" ON "observances" USING btree ("updated_at");
  CREATE INDEX "observances_created_at_idx" ON "observances" USING btree ("created_at");
  CREATE INDEX "observances__status_idx" ON "observances" USING btree ("_status");
  CREATE INDEX "_observances_v_version_about_order_idx" ON "_observances_v_version_about" USING btree ("_order");
  CREATE INDEX "_observances_v_version_about_parent_id_idx" ON "_observances_v_version_about" USING btree ("_parent_id");
  CREATE INDEX "_observances_v_parent_idx" ON "_observances_v" USING btree ("parent_id");
  CREATE INDEX "_observances_v_version_version_slug_idx" ON "_observances_v" USING btree ("version_slug");
  CREATE INDEX "_observances_v_version_version_created_by_idx" ON "_observances_v" USING btree ("version_created_by_id");
  CREATE INDEX "_observances_v_version_version_updated_at_idx" ON "_observances_v" USING btree ("version_updated_at");
  CREATE INDEX "_observances_v_version_version_created_at_idx" ON "_observances_v" USING btree ("version_created_at");
  CREATE INDEX "_observances_v_version_version__status_idx" ON "_observances_v" USING btree ("version__status");
  CREATE INDEX "_observances_v_created_at_idx" ON "_observances_v" USING btree ("created_at");
  CREATE INDEX "_observances_v_updated_at_idx" ON "_observances_v" USING btree ("updated_at");
  CREATE INDEX "_observances_v_latest_idx" ON "_observances_v" USING btree ("latest");
  CREATE INDEX "books_parts_order_idx" ON "books_parts" USING btree ("_order");
  CREATE INDEX "books_parts_parent_id_idx" ON "books_parts" USING btree ("_parent_id");
  CREATE INDEX "books_region_idx" ON "books" USING btree ("region_id");
  CREATE INDEX "books_updated_at_idx" ON "books" USING btree ("updated_at");
  CREATE INDEX "books_created_at_idx" ON "books" USING btree ("created_at");
  CREATE INDEX "books__status_idx" ON "books" USING btree ("_status");
  CREATE INDEX "_books_v_version_parts_order_idx" ON "_books_v_version_parts" USING btree ("_order");
  CREATE INDEX "_books_v_version_parts_parent_id_idx" ON "_books_v_version_parts" USING btree ("_parent_id");
  CREATE INDEX "_books_v_parent_idx" ON "_books_v" USING btree ("parent_id");
  CREATE INDEX "_books_v_version_version_region_idx" ON "_books_v" USING btree ("version_region_id");
  CREATE INDEX "_books_v_version_version_updated_at_idx" ON "_books_v" USING btree ("version_updated_at");
  CREATE INDEX "_books_v_version_version_created_at_idx" ON "_books_v" USING btree ("version_created_at");
  CREATE INDEX "_books_v_version_version__status_idx" ON "_books_v" USING btree ("version__status");
  CREATE INDEX "_books_v_created_at_idx" ON "_books_v" USING btree ("created_at");
  CREATE INDEX "_books_v_updated_at_idx" ON "_books_v" USING btree ("updated_at");
  CREATE INDEX "_books_v_latest_idx" ON "_books_v" USING btree ("latest");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "regions_slug_idx" ON "regions" USING btree ("slug");
  CREATE INDEX "regions_updated_at_idx" ON "regions" USING btree ("updated_at");
  CREATE INDEX "regions_created_at_idx" ON "regions" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_field_notes_id_idx" ON "payload_locked_documents_rels" USING btree ("field_notes_id");
  CREATE INDEX "payload_locked_documents_rels_films_id_idx" ON "payload_locked_documents_rels" USING btree ("films_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_temples_id_idx" ON "payload_locked_documents_rels" USING btree ("temples_id");
  CREATE INDEX "payload_locked_documents_rels_temple_pieces_id_idx" ON "payload_locked_documents_rels" USING btree ("temple_pieces_id");
  CREATE INDEX "payload_locked_documents_rels_occasions_id_idx" ON "payload_locked_documents_rels" USING btree ("occasions_id");
  CREATE INDEX "payload_locked_documents_rels_drawings_id_idx" ON "payload_locked_documents_rels" USING btree ("drawings_id");
  CREATE INDEX "payload_locked_documents_rels_observances_id_idx" ON "payload_locked_documents_rels" USING btree ("observances_id");
  CREATE INDEX "payload_locked_documents_rels_books_id_idx" ON "payload_locked_documents_rels" USING btree ("books_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_regions_id_idx" ON "payload_locked_documents_rels" USING btree ("regions_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "about_page_sections_order_idx" ON "about_page_sections" USING btree ("_order");
  CREATE INDEX "about_page_sections_parent_id_idx" ON "about_page_sections" USING btree ("_parent_id");
  CREATE INDEX "about_page_team_order_idx" ON "about_page_team" USING btree ("_order");
  CREATE INDEX "about_page_team_parent_id_idx" ON "about_page_team" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "field_notes_removed" CASCADE;
  DROP TABLE "field_notes" CASCADE;
  DROP TABLE "field_notes_texts" CASCADE;
  DROP TABLE "field_notes_rels" CASCADE;
  DROP TABLE "_field_notes_v_version_removed" CASCADE;
  DROP TABLE "_field_notes_v" CASCADE;
  DROP TABLE "_field_notes_v_texts" CASCADE;
  DROP TABLE "_field_notes_v_rels" CASCADE;
  DROP TABLE "films" CASCADE;
  DROP TABLE "films_rels" CASCADE;
  DROP TABLE "_films_v" CASCADE;
  DROP TABLE "_films_v_rels" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_rels" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  DROP TABLE "_articles_v_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_rels" CASCADE;
  DROP TABLE "temples" CASCADE;
  DROP TABLE "_temples_v" CASCADE;
  DROP TABLE "temple_pieces" CASCADE;
  DROP TABLE "temple_pieces_rels" CASCADE;
  DROP TABLE "_temple_pieces_v" CASCADE;
  DROP TABLE "_temple_pieces_v_rels" CASCADE;
  DROP TABLE "occasions" CASCADE;
  DROP TABLE "occasions_rels" CASCADE;
  DROP TABLE "drawings" CASCADE;
  DROP TABLE "drawings_rels" CASCADE;
  DROP TABLE "_drawings_v" CASCADE;
  DROP TABLE "_drawings_v_rels" CASCADE;
  DROP TABLE "observances_about" CASCADE;
  DROP TABLE "observances" CASCADE;
  DROP TABLE "_observances_v_version_about" CASCADE;
  DROP TABLE "_observances_v" CASCADE;
  DROP TABLE "books_parts" CASCADE;
  DROP TABLE "books" CASCADE;
  DROP TABLE "_books_v_version_parts" CASCADE;
  DROP TABLE "_books_v" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "regions" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "home_page" CASCADE;
  DROP TABLE "about_page_sections" CASCADE;
  DROP TABLE "about_page_team" CASCADE;
  DROP TABLE "about_page" CASCADE;
  DROP TABLE "instagram" CASCADE;
  DROP TYPE "public"."enum_field_notes_kind";
  DROP TYPE "public"."enum_field_notes_review_status";
  DROP TYPE "public"."enum_field_notes_status";
  DROP TYPE "public"."enum__field_notes_v_version_kind";
  DROP TYPE "public"."enum__field_notes_v_version_review_status";
  DROP TYPE "public"."enum__field_notes_v_version_status";
  DROP TYPE "public"."enum_films_review_status";
  DROP TYPE "public"."enum_films_status";
  DROP TYPE "public"."enum__films_v_version_review_status";
  DROP TYPE "public"."enum__films_v_version_status";
  DROP TYPE "public"."enum_articles_review_status";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_version_review_status";
  DROP TYPE "public"."enum__articles_v_version_status";
  DROP TYPE "public"."enum_media_consent";
  DROP TYPE "public"."enum_temples_deity_group";
  DROP TYPE "public"."enum_temples_status";
  DROP TYPE "public"."enum__temples_v_version_deity_group";
  DROP TYPE "public"."enum__temples_v_version_status";
  DROP TYPE "public"."enum_temple_pieces_topic";
  DROP TYPE "public"."enum_temple_pieces_review_status";
  DROP TYPE "public"."enum_temple_pieces_status";
  DROP TYPE "public"."enum__temple_pieces_v_version_topic";
  DROP TYPE "public"."enum__temple_pieces_v_version_review_status";
  DROP TYPE "public"."enum__temple_pieces_v_version_status";
  DROP TYPE "public"."enum_drawings_kind";
  DROP TYPE "public"."enum_drawings_review_status";
  DROP TYPE "public"."enum_drawings_status";
  DROP TYPE "public"."enum__drawings_v_version_kind";
  DROP TYPE "public"."enum__drawings_v_version_review_status";
  DROP TYPE "public"."enum__drawings_v_version_status";
  DROP TYPE "public"."enum_observances_kind";
  DROP TYPE "public"."enum_observances_review_status";
  DROP TYPE "public"."enum_observances_status";
  DROP TYPE "public"."enum__observances_v_version_kind";
  DROP TYPE "public"."enum__observances_v_version_review_status";
  DROP TYPE "public"."enum__observances_v_version_status";
  DROP TYPE "public"."enum_books_review_status";
  DROP TYPE "public"."enum_books_status";
  DROP TYPE "public"."enum__books_v_version_review_status";
  DROP TYPE "public"."enum__books_v_version_status";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_regions_calendar";`)
}
