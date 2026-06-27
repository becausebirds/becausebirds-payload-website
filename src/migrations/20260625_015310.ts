import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_code_language" AS ENUM('typescript', 'javascript', 'css', 'php');
  CREATE TYPE "public"."enum_pages_blocks_heading_level" AS ENUM('h1', 'h2', 'h3', 'h4', 'h5', 'h6');
  CREATE TYPE "public"."enum_pages_blocks_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum_pages_blocks_video_source" AS ENUM('upload', 'youtube', 'vimeo', 'url');
  CREATE TYPE "public"."enum_pages_blocks_gallery_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_columns_columns_width" AS ENUM('25', '33', '50', '66', '75', '100');
  CREATE TYPE "public"."enum_pages_blocks_pullquote_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_pages_blocks_buttons_buttons_target" AS ENUM('_self', '_blank');
  CREATE TYPE "public"."enum_pages_blocks_buttons_buttons_style" AS ENUM('primary', 'secondary', 'outline', 'ghost');
  CREATE TYPE "public"."enum_pages_blocks_buttons_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_code_language" AS ENUM('typescript', 'javascript', 'css', 'php');
  CREATE TYPE "public"."enum__pages_v_blocks_heading_level" AS ENUM('h1', 'h2', 'h3', 'h4', 'h5', 'h6');
  CREATE TYPE "public"."enum__pages_v_blocks_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum__pages_v_blocks_video_source" AS ENUM('upload', 'youtube', 'vimeo', 'url');
  CREATE TYPE "public"."enum__pages_v_blocks_gallery_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum__pages_v_blocks_columns_columns_width" AS ENUM('25', '33', '50', '66', '75', '100');
  CREATE TYPE "public"."enum__pages_v_blocks_pullquote_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_buttons_buttons_target" AS ENUM('_self', '_blank');
  CREATE TYPE "public"."enum__pages_v_blocks_buttons_buttons_style" AS ENUM('primary', 'secondary', 'outline', 'ghost');
  CREATE TYPE "public"."enum__pages_v_blocks_buttons_align" AS ENUM('left', 'center', 'right');
  CREATE TABLE "pages_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"hero_image_id" integer
  );
  
  CREATE TABLE "pages_blocks_code" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"language" "enum_pages_blocks_code_language" DEFAULT 'typescript',
  	"code" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_quiz_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quiz_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_paragraph" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"level" "enum_pages_blocks_heading_level" DEFAULT 'h2',
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" jsonb,
  	"alt" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" jsonb
  );
  
  CREATE TABLE "pages_blocks_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"style" "enum_pages_blocks_list_style" DEFAULT 'unordered',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_html" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"code" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"citation" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_separator" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_spacer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"height" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_audio" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"caption" varchar,
  	"autoplay" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_pages_blocks_video_source" DEFAULT 'upload',
  	"file_id" integer,
  	"url" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" jsonb,
  	"alt" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"columns" "enum_pages_blocks_gallery_columns" DEFAULT '3',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_columns_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"width" "enum_pages_blocks_columns_columns_width" DEFAULT '50'
  );
  
  CREATE TABLE "pages_blocks_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"background_color" varchar,
  	"inner_blocks" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"summary" varchar,
  	"content" jsonb,
  	"open_by_default" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_pullquote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"citation" varchar,
  	"align" "enum_pages_blocks_pullquote_align" DEFAULT 'center',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_buttons_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"url" varchar,
  	"target" "enum_pages_blocks_buttons_buttons_target" DEFAULT '_self',
  	"style" "enum_pages_blocks_buttons_buttons_style" DEFAULT 'primary'
  );
  
  CREATE TABLE "pages_blocks_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"align" "enum_pages_blocks_buttons_align" DEFAULT 'left',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_version_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"name" varchar,
  	"hero_image_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_code" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"language" "enum__pages_v_blocks_code_language" DEFAULT 'typescript',
  	"code" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_quiz_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quiz_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_paragraph" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"level" "enum__pages_v_blocks_heading_level" DEFAULT 'h2',
  	"anchor_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" jsonb,
  	"alt" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"style" "enum__pages_v_blocks_list_style" DEFAULT 'unordered',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_html" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"citation" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_separator" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_spacer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"height" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_audio" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"caption" varchar,
  	"autoplay" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum__pages_v_blocks_video_source" DEFAULT 'upload',
  	"file_id" integer,
  	"url" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" jsonb,
  	"alt" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"columns" "enum__pages_v_blocks_gallery_columns" DEFAULT '3',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_columns_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"width" "enum__pages_v_blocks_columns_columns_width" DEFAULT '50',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"background_color" varchar,
  	"inner_blocks" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"summary" varchar,
  	"content" jsonb,
  	"open_by_default" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pullquote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"citation" varchar,
  	"align" "enum__pages_v_blocks_pullquote_align" DEFAULT 'center',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_buttons_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"url" varchar,
  	"target" "enum__pages_v_blocks_buttons_buttons_target" DEFAULT '_self',
  	"style" "enum__pages_v_blocks_buttons_buttons_style" DEFAULT 'primary',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"align" "enum__pages_v_blocks_buttons_align" DEFAULT 'left',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_quiz_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quiz_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_quiz_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quiz_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "visitors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"location" varchar NOT NULL,
  	"favorite_bird" varchar NOT NULL,
  	"message" varchar,
  	"date" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "pages_hero_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_hero_links" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_hero_links" CASCADE;
  DROP TABLE "_pages_v_version_hero_links" CASCADE;
  ALTER TABLE "pages" DROP CONSTRAINT "pages_hero_media_id_media_id_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_posts_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_hero_media_id_media_id_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_posts_fk";
  
  DROP INDEX "pages_hero_hero_media_idx";
  DROP INDEX "pages_rels_posts_id_idx";
  DROP INDEX "_pages_v_version_hero_version_hero_media_idx";
  DROP INDEX "_pages_v_rels_posts_id_idx";
  ALTER TABLE "pages" ADD COLUMN "hero_image_id" integer;
  ALTER TABLE "pages" ADD COLUMN "excerpt" varchar;
  ALTER TABLE "pages_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "tags_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "users_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_image_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_excerpt" varchar;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "tags_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "users_id" integer;
  ALTER TABLE "quizzes_personalities" ADD COLUMN "forminator_id" varchar;
  ALTER TABLE "quizzes_questions_answers" ADD COLUMN "personality_index" numeric NOT NULL;
  ALTER TABLE "quizzes_questions" ADD COLUMN "forminator_id" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "visitors_id" integer;
  ALTER TABLE "pages_populated_authors" ADD CONSTRAINT "pages_populated_authors_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_populated_authors" ADD CONSTRAINT "pages_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_code" ADD CONSTRAINT "pages_blocks_code_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_quiz_embed" ADD CONSTRAINT "pages_blocks_quiz_embed_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_quiz_embed" ADD CONSTRAINT "pages_blocks_quiz_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_paragraph" ADD CONSTRAINT "pages_blocks_paragraph_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_heading" ADD CONSTRAINT "pages_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_list_items" ADD CONSTRAINT "pages_blocks_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_list" ADD CONSTRAINT "pages_blocks_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_html" ADD CONSTRAINT "pages_blocks_html_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_quote" ADD CONSTRAINT "pages_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_separator" ADD CONSTRAINT "pages_blocks_separator_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_spacer" ADD CONSTRAINT "pages_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_audio" ADD CONSTRAINT "pages_blocks_audio_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_audio" ADD CONSTRAINT "pages_blocks_audio_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_video" ADD CONSTRAINT "pages_blocks_video_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_video" ADD CONSTRAINT "pages_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_images" ADD CONSTRAINT "pages_blocks_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_images" ADD CONSTRAINT "pages_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery" ADD CONSTRAINT "pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_embed" ADD CONSTRAINT "pages_blocks_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_columns_columns" ADD CONSTRAINT "pages_blocks_columns_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_columns" ADD CONSTRAINT "pages_blocks_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_group" ADD CONSTRAINT "pages_blocks_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_details" ADD CONSTRAINT "pages_blocks_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pullquote" ADD CONSTRAINT "pages_blocks_pullquote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_buttons_buttons" ADD CONSTRAINT "pages_blocks_buttons_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_buttons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_buttons" ADD CONSTRAINT "pages_blocks_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_populated_authors" ADD CONSTRAINT "_pages_v_version_populated_authors_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_populated_authors" ADD CONSTRAINT "_pages_v_version_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_code" ADD CONSTRAINT "_pages_v_blocks_code_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_quiz_embed" ADD CONSTRAINT "_pages_v_blocks_quiz_embed_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_quiz_embed" ADD CONSTRAINT "_pages_v_blocks_quiz_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_paragraph" ADD CONSTRAINT "_pages_v_blocks_paragraph_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_heading" ADD CONSTRAINT "_pages_v_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image" ADD CONSTRAINT "_pages_v_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image" ADD CONSTRAINT "_pages_v_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_list_items" ADD CONSTRAINT "_pages_v_blocks_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_list" ADD CONSTRAINT "_pages_v_blocks_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_html" ADD CONSTRAINT "_pages_v_blocks_html_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_quote" ADD CONSTRAINT "_pages_v_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_separator" ADD CONSTRAINT "_pages_v_blocks_separator_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_spacer" ADD CONSTRAINT "_pages_v_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_audio" ADD CONSTRAINT "_pages_v_blocks_audio_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_audio" ADD CONSTRAINT "_pages_v_blocks_audio_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video" ADD CONSTRAINT "_pages_v_blocks_video_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video" ADD CONSTRAINT "_pages_v_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_images" ADD CONSTRAINT "_pages_v_blocks_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_images" ADD CONSTRAINT "_pages_v_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery" ADD CONSTRAINT "_pages_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_embed" ADD CONSTRAINT "_pages_v_blocks_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_columns_columns" ADD CONSTRAINT "_pages_v_blocks_columns_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_columns" ADD CONSTRAINT "_pages_v_blocks_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_group" ADD CONSTRAINT "_pages_v_blocks_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_details" ADD CONSTRAINT "_pages_v_blocks_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pullquote" ADD CONSTRAINT "_pages_v_blocks_pullquote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_buttons_buttons" ADD CONSTRAINT "_pages_v_blocks_buttons_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_buttons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_buttons" ADD CONSTRAINT "_pages_v_blocks_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_quiz_embed" ADD CONSTRAINT "posts_blocks_quiz_embed_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_quiz_embed" ADD CONSTRAINT "posts_blocks_quiz_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_quiz_embed" ADD CONSTRAINT "_posts_v_blocks_quiz_embed_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_quiz_embed" ADD CONSTRAINT "_posts_v_blocks_quiz_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_populated_authors_order_idx" ON "pages_populated_authors" USING btree ("_order");
  CREATE INDEX "pages_populated_authors_parent_id_idx" ON "pages_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "pages_populated_authors_hero_image_idx" ON "pages_populated_authors" USING btree ("hero_image_id");
  CREATE INDEX "pages_blocks_code_order_idx" ON "pages_blocks_code" USING btree ("_order");
  CREATE INDEX "pages_blocks_code_parent_id_idx" ON "pages_blocks_code" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_code_path_idx" ON "pages_blocks_code" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_block_order_idx" ON "pages_blocks_media_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_block_parent_id_idx" ON "pages_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_block_path_idx" ON "pages_blocks_media_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_block_media_idx" ON "pages_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "pages_blocks_quiz_embed_order_idx" ON "pages_blocks_quiz_embed" USING btree ("_order");
  CREATE INDEX "pages_blocks_quiz_embed_parent_id_idx" ON "pages_blocks_quiz_embed" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_quiz_embed_path_idx" ON "pages_blocks_quiz_embed" USING btree ("_path");
  CREATE INDEX "pages_blocks_quiz_embed_quiz_idx" ON "pages_blocks_quiz_embed" USING btree ("quiz_id");
  CREATE INDEX "pages_blocks_paragraph_order_idx" ON "pages_blocks_paragraph" USING btree ("_order");
  CREATE INDEX "pages_blocks_paragraph_parent_id_idx" ON "pages_blocks_paragraph" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_paragraph_path_idx" ON "pages_blocks_paragraph" USING btree ("_path");
  CREATE INDEX "pages_blocks_heading_order_idx" ON "pages_blocks_heading" USING btree ("_order");
  CREATE INDEX "pages_blocks_heading_parent_id_idx" ON "pages_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_heading_path_idx" ON "pages_blocks_heading" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_order_idx" ON "pages_blocks_image" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_parent_id_idx" ON "pages_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_path_idx" ON "pages_blocks_image" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_image_idx" ON "pages_blocks_image" USING btree ("image_id");
  CREATE INDEX "pages_blocks_list_items_order_idx" ON "pages_blocks_list_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_list_items_parent_id_idx" ON "pages_blocks_list_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_list_order_idx" ON "pages_blocks_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_list_parent_id_idx" ON "pages_blocks_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_list_path_idx" ON "pages_blocks_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_html_order_idx" ON "pages_blocks_html" USING btree ("_order");
  CREATE INDEX "pages_blocks_html_parent_id_idx" ON "pages_blocks_html" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_html_path_idx" ON "pages_blocks_html" USING btree ("_path");
  CREATE INDEX "pages_blocks_quote_order_idx" ON "pages_blocks_quote" USING btree ("_order");
  CREATE INDEX "pages_blocks_quote_parent_id_idx" ON "pages_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_quote_path_idx" ON "pages_blocks_quote" USING btree ("_path");
  CREATE INDEX "pages_blocks_separator_order_idx" ON "pages_blocks_separator" USING btree ("_order");
  CREATE INDEX "pages_blocks_separator_parent_id_idx" ON "pages_blocks_separator" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_separator_path_idx" ON "pages_blocks_separator" USING btree ("_path");
  CREATE INDEX "pages_blocks_spacer_order_idx" ON "pages_blocks_spacer" USING btree ("_order");
  CREATE INDEX "pages_blocks_spacer_parent_id_idx" ON "pages_blocks_spacer" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_spacer_path_idx" ON "pages_blocks_spacer" USING btree ("_path");
  CREATE INDEX "pages_blocks_audio_order_idx" ON "pages_blocks_audio" USING btree ("_order");
  CREATE INDEX "pages_blocks_audio_parent_id_idx" ON "pages_blocks_audio" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_audio_path_idx" ON "pages_blocks_audio" USING btree ("_path");
  CREATE INDEX "pages_blocks_audio_file_idx" ON "pages_blocks_audio" USING btree ("file_id");
  CREATE INDEX "pages_blocks_video_order_idx" ON "pages_blocks_video" USING btree ("_order");
  CREATE INDEX "pages_blocks_video_parent_id_idx" ON "pages_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_video_path_idx" ON "pages_blocks_video" USING btree ("_path");
  CREATE INDEX "pages_blocks_video_file_idx" ON "pages_blocks_video" USING btree ("file_id");
  CREATE INDEX "pages_blocks_gallery_images_order_idx" ON "pages_blocks_gallery_images" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_images_parent_id_idx" ON "pages_blocks_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_images_image_idx" ON "pages_blocks_gallery_images" USING btree ("image_id");
  CREATE INDEX "pages_blocks_gallery_order_idx" ON "pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_parent_id_idx" ON "pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_path_idx" ON "pages_blocks_gallery" USING btree ("_path");
  CREATE INDEX "pages_blocks_embed_order_idx" ON "pages_blocks_embed" USING btree ("_order");
  CREATE INDEX "pages_blocks_embed_parent_id_idx" ON "pages_blocks_embed" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_embed_path_idx" ON "pages_blocks_embed" USING btree ("_path");
  CREATE INDEX "pages_blocks_columns_columns_order_idx" ON "pages_blocks_columns_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_columns_columns_parent_id_idx" ON "pages_blocks_columns_columns" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_columns_order_idx" ON "pages_blocks_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_columns_parent_id_idx" ON "pages_blocks_columns" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_columns_path_idx" ON "pages_blocks_columns" USING btree ("_path");
  CREATE INDEX "pages_blocks_group_order_idx" ON "pages_blocks_group" USING btree ("_order");
  CREATE INDEX "pages_blocks_group_parent_id_idx" ON "pages_blocks_group" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_group_path_idx" ON "pages_blocks_group" USING btree ("_path");
  CREATE INDEX "pages_blocks_details_order_idx" ON "pages_blocks_details" USING btree ("_order");
  CREATE INDEX "pages_blocks_details_parent_id_idx" ON "pages_blocks_details" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_details_path_idx" ON "pages_blocks_details" USING btree ("_path");
  CREATE INDEX "pages_blocks_pullquote_order_idx" ON "pages_blocks_pullquote" USING btree ("_order");
  CREATE INDEX "pages_blocks_pullquote_parent_id_idx" ON "pages_blocks_pullquote" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pullquote_path_idx" ON "pages_blocks_pullquote" USING btree ("_path");
  CREATE INDEX "pages_blocks_buttons_buttons_order_idx" ON "pages_blocks_buttons_buttons" USING btree ("_order");
  CREATE INDEX "pages_blocks_buttons_buttons_parent_id_idx" ON "pages_blocks_buttons_buttons" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_buttons_order_idx" ON "pages_blocks_buttons" USING btree ("_order");
  CREATE INDEX "pages_blocks_buttons_parent_id_idx" ON "pages_blocks_buttons" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_buttons_path_idx" ON "pages_blocks_buttons" USING btree ("_path");
  CREATE INDEX "_pages_v_version_populated_authors_order_idx" ON "_pages_v_version_populated_authors" USING btree ("_order");
  CREATE INDEX "_pages_v_version_populated_authors_parent_id_idx" ON "_pages_v_version_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_populated_authors_hero_image_idx" ON "_pages_v_version_populated_authors" USING btree ("hero_image_id");
  CREATE INDEX "_pages_v_blocks_code_order_idx" ON "_pages_v_blocks_code" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_code_parent_id_idx" ON "_pages_v_blocks_code" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_code_path_idx" ON "_pages_v_blocks_code" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_block_order_idx" ON "_pages_v_blocks_media_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_media_block_parent_id_idx" ON "_pages_v_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_media_block_path_idx" ON "_pages_v_blocks_media_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_block_media_idx" ON "_pages_v_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_quiz_embed_order_idx" ON "_pages_v_blocks_quiz_embed" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_quiz_embed_parent_id_idx" ON "_pages_v_blocks_quiz_embed" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_quiz_embed_path_idx" ON "_pages_v_blocks_quiz_embed" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_quiz_embed_quiz_idx" ON "_pages_v_blocks_quiz_embed" USING btree ("quiz_id");
  CREATE INDEX "_pages_v_blocks_paragraph_order_idx" ON "_pages_v_blocks_paragraph" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_paragraph_parent_id_idx" ON "_pages_v_blocks_paragraph" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_paragraph_path_idx" ON "_pages_v_blocks_paragraph" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_heading_order_idx" ON "_pages_v_blocks_heading" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_heading_parent_id_idx" ON "_pages_v_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_heading_path_idx" ON "_pages_v_blocks_heading" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_order_idx" ON "_pages_v_blocks_image" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_parent_id_idx" ON "_pages_v_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_path_idx" ON "_pages_v_blocks_image" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_image_idx" ON "_pages_v_blocks_image" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_list_items_order_idx" ON "_pages_v_blocks_list_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_list_items_parent_id_idx" ON "_pages_v_blocks_list_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_list_order_idx" ON "_pages_v_blocks_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_list_parent_id_idx" ON "_pages_v_blocks_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_list_path_idx" ON "_pages_v_blocks_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_html_order_idx" ON "_pages_v_blocks_html" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_html_parent_id_idx" ON "_pages_v_blocks_html" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_html_path_idx" ON "_pages_v_blocks_html" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_quote_order_idx" ON "_pages_v_blocks_quote" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_quote_parent_id_idx" ON "_pages_v_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_quote_path_idx" ON "_pages_v_blocks_quote" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_separator_order_idx" ON "_pages_v_blocks_separator" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_separator_parent_id_idx" ON "_pages_v_blocks_separator" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_separator_path_idx" ON "_pages_v_blocks_separator" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_spacer_order_idx" ON "_pages_v_blocks_spacer" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_spacer_parent_id_idx" ON "_pages_v_blocks_spacer" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_spacer_path_idx" ON "_pages_v_blocks_spacer" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_audio_order_idx" ON "_pages_v_blocks_audio" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_audio_parent_id_idx" ON "_pages_v_blocks_audio" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_audio_path_idx" ON "_pages_v_blocks_audio" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_audio_file_idx" ON "_pages_v_blocks_audio" USING btree ("file_id");
  CREATE INDEX "_pages_v_blocks_video_order_idx" ON "_pages_v_blocks_video" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_video_parent_id_idx" ON "_pages_v_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_video_path_idx" ON "_pages_v_blocks_video" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_video_file_idx" ON "_pages_v_blocks_video" USING btree ("file_id");
  CREATE INDEX "_pages_v_blocks_gallery_images_order_idx" ON "_pages_v_blocks_gallery_images" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_images_parent_id_idx" ON "_pages_v_blocks_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_images_image_idx" ON "_pages_v_blocks_gallery_images" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_gallery_order_idx" ON "_pages_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_parent_id_idx" ON "_pages_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_path_idx" ON "_pages_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_embed_order_idx" ON "_pages_v_blocks_embed" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_embed_parent_id_idx" ON "_pages_v_blocks_embed" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_embed_path_idx" ON "_pages_v_blocks_embed" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_columns_columns_order_idx" ON "_pages_v_blocks_columns_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_columns_columns_parent_id_idx" ON "_pages_v_blocks_columns_columns" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_columns_order_idx" ON "_pages_v_blocks_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_columns_parent_id_idx" ON "_pages_v_blocks_columns" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_columns_path_idx" ON "_pages_v_blocks_columns" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_group_order_idx" ON "_pages_v_blocks_group" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_group_parent_id_idx" ON "_pages_v_blocks_group" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_group_path_idx" ON "_pages_v_blocks_group" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_details_order_idx" ON "_pages_v_blocks_details" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_details_parent_id_idx" ON "_pages_v_blocks_details" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_details_path_idx" ON "_pages_v_blocks_details" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_pullquote_order_idx" ON "_pages_v_blocks_pullquote" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pullquote_parent_id_idx" ON "_pages_v_blocks_pullquote" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pullquote_path_idx" ON "_pages_v_blocks_pullquote" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_buttons_buttons_order_idx" ON "_pages_v_blocks_buttons_buttons" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_buttons_buttons_parent_id_idx" ON "_pages_v_blocks_buttons_buttons" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_buttons_order_idx" ON "_pages_v_blocks_buttons" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_buttons_parent_id_idx" ON "_pages_v_blocks_buttons" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_buttons_path_idx" ON "_pages_v_blocks_buttons" USING btree ("_path");
  CREATE INDEX "posts_blocks_quiz_embed_order_idx" ON "posts_blocks_quiz_embed" USING btree ("_order");
  CREATE INDEX "posts_blocks_quiz_embed_parent_id_idx" ON "posts_blocks_quiz_embed" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_quiz_embed_path_idx" ON "posts_blocks_quiz_embed" USING btree ("_path");
  CREATE INDEX "posts_blocks_quiz_embed_quiz_idx" ON "posts_blocks_quiz_embed" USING btree ("quiz_id");
  CREATE INDEX "_posts_v_blocks_quiz_embed_order_idx" ON "_posts_v_blocks_quiz_embed" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_quiz_embed_parent_id_idx" ON "_posts_v_blocks_quiz_embed" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_quiz_embed_path_idx" ON "_posts_v_blocks_quiz_embed" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_quiz_embed_quiz_idx" ON "_posts_v_blocks_quiz_embed" USING btree ("quiz_id");
  CREATE INDEX "visitors_updated_at_idx" ON "visitors" USING btree ("updated_at");
  CREATE INDEX "visitors_created_at_idx" ON "visitors" USING btree ("created_at");
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_visitors_fk" FOREIGN KEY ("visitors_id") REFERENCES "public"."visitors"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_hero_image_idx" ON "pages" USING btree ("hero_image_id");
  CREATE INDEX "pages_rels_categories_id_idx" ON "pages_rels" USING btree ("categories_id");
  CREATE INDEX "pages_rels_tags_id_idx" ON "pages_rels" USING btree ("tags_id");
  CREATE INDEX "pages_rels_users_id_idx" ON "pages_rels" USING btree ("users_id");
  CREATE INDEX "_pages_v_version_version_hero_image_idx" ON "_pages_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_pages_v_rels_categories_id_idx" ON "_pages_v_rels" USING btree ("categories_id");
  CREATE INDEX "_pages_v_rels_tags_id_idx" ON "_pages_v_rels" USING btree ("tags_id");
  CREATE INDEX "_pages_v_rels_users_id_idx" ON "_pages_v_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_visitors_id_idx" ON "payload_locked_documents_rels" USING btree ("visitors_id");
  ALTER TABLE "pages" DROP COLUMN "hero_type";
  ALTER TABLE "pages" DROP COLUMN "hero_rich_text";
  ALTER TABLE "pages" DROP COLUMN "hero_media_id";
  ALTER TABLE "pages_rels" DROP COLUMN "posts_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_type";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_rich_text";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_media_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "posts_id";
  ALTER TABLE "quizzes_personalities" DROP COLUMN "legacy_id";
  ALTER TABLE "quizzes_questions_answers" DROP COLUMN "personality";
  ALTER TABLE "quizzes_questions" DROP COLUMN "legacy_id";
  DROP TYPE "public"."enum_pages_hero_links_link_type";
  DROP TYPE "public"."enum_pages_hero_links_link_appearance";
  DROP TYPE "public"."enum_pages_hero_type";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_type";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_version_hero_type";
  DROP TYPE "public"."enum_quizzes_questions_answers_personality";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum_quizzes_questions_answers_personality" AS ENUM('');
  CREATE TABLE "pages_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "_pages_v_version_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_version_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_version_hero_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  ALTER TABLE "pages_populated_authors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_code" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_media_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_quiz_embed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_paragraph" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_html" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_separator" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_spacer" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_audio" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_gallery_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_embed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_columns_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_group" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_pullquote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_buttons_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_populated_authors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_code" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_media_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_quiz_embed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_paragraph" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_html" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_separator" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_spacer" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_audio" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_gallery_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_embed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_columns_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_group" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pullquote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_buttons_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_quiz_embed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_quiz_embed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "visitors" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_populated_authors" CASCADE;
  DROP TABLE "pages_blocks_code" CASCADE;
  DROP TABLE "pages_blocks_media_block" CASCADE;
  DROP TABLE "pages_blocks_quiz_embed" CASCADE;
  DROP TABLE "pages_blocks_paragraph" CASCADE;
  DROP TABLE "pages_blocks_heading" CASCADE;
  DROP TABLE "pages_blocks_image" CASCADE;
  DROP TABLE "pages_blocks_list_items" CASCADE;
  DROP TABLE "pages_blocks_list" CASCADE;
  DROP TABLE "pages_blocks_html" CASCADE;
  DROP TABLE "pages_blocks_quote" CASCADE;
  DROP TABLE "pages_blocks_separator" CASCADE;
  DROP TABLE "pages_blocks_spacer" CASCADE;
  DROP TABLE "pages_blocks_audio" CASCADE;
  DROP TABLE "pages_blocks_video" CASCADE;
  DROP TABLE "pages_blocks_gallery_images" CASCADE;
  DROP TABLE "pages_blocks_gallery" CASCADE;
  DROP TABLE "pages_blocks_embed" CASCADE;
  DROP TABLE "pages_blocks_columns_columns" CASCADE;
  DROP TABLE "pages_blocks_columns" CASCADE;
  DROP TABLE "pages_blocks_group" CASCADE;
  DROP TABLE "pages_blocks_details" CASCADE;
  DROP TABLE "pages_blocks_pullquote" CASCADE;
  DROP TABLE "pages_blocks_buttons_buttons" CASCADE;
  DROP TABLE "pages_blocks_buttons" CASCADE;
  DROP TABLE "_pages_v_version_populated_authors" CASCADE;
  DROP TABLE "_pages_v_blocks_code" CASCADE;
  DROP TABLE "_pages_v_blocks_media_block" CASCADE;
  DROP TABLE "_pages_v_blocks_quiz_embed" CASCADE;
  DROP TABLE "_pages_v_blocks_paragraph" CASCADE;
  DROP TABLE "_pages_v_blocks_heading" CASCADE;
  DROP TABLE "_pages_v_blocks_image" CASCADE;
  DROP TABLE "_pages_v_blocks_list_items" CASCADE;
  DROP TABLE "_pages_v_blocks_list" CASCADE;
  DROP TABLE "_pages_v_blocks_html" CASCADE;
  DROP TABLE "_pages_v_blocks_quote" CASCADE;
  DROP TABLE "_pages_v_blocks_separator" CASCADE;
  DROP TABLE "_pages_v_blocks_spacer" CASCADE;
  DROP TABLE "_pages_v_blocks_audio" CASCADE;
  DROP TABLE "_pages_v_blocks_video" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery_images" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery" CASCADE;
  DROP TABLE "_pages_v_blocks_embed" CASCADE;
  DROP TABLE "_pages_v_blocks_columns_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_group" CASCADE;
  DROP TABLE "_pages_v_blocks_details" CASCADE;
  DROP TABLE "_pages_v_blocks_pullquote" CASCADE;
  DROP TABLE "_pages_v_blocks_buttons_buttons" CASCADE;
  DROP TABLE "_pages_v_blocks_buttons" CASCADE;
  DROP TABLE "posts_blocks_quiz_embed" CASCADE;
  DROP TABLE "_posts_v_blocks_quiz_embed" CASCADE;
  DROP TABLE "visitors" CASCADE;
  ALTER TABLE "pages" DROP CONSTRAINT "pages_hero_image_id_media_id_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_categories_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_tags_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_users_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_hero_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_categories_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_tags_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_users_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_visitors_fk";
  
  DROP INDEX "pages_hero_image_idx";
  DROP INDEX "pages_rels_categories_id_idx";
  DROP INDEX "pages_rels_tags_id_idx";
  DROP INDEX "pages_rels_users_id_idx";
  DROP INDEX "_pages_v_version_version_hero_image_idx";
  DROP INDEX "_pages_v_rels_categories_id_idx";
  DROP INDEX "_pages_v_rels_tags_id_idx";
  DROP INDEX "_pages_v_rels_users_id_idx";
  DROP INDEX "payload_locked_documents_rels_visitors_id_idx";
  ALTER TABLE "pages" ADD COLUMN "hero_type" "enum_pages_hero_type" DEFAULT 'lowImpact';
  ALTER TABLE "pages" ADD COLUMN "hero_rich_text" jsonb;
  ALTER TABLE "pages" ADD COLUMN "hero_media_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_type" "enum__pages_v_version_hero_type" DEFAULT 'lowImpact';
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_rich_text" jsonb;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_media_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "quizzes_personalities" ADD COLUMN "legacy_id" varchar;
  ALTER TABLE "quizzes_questions_answers" ADD COLUMN "personality" "enum_quizzes_questions_answers_personality" NOT NULL;
  ALTER TABLE "quizzes_questions" ADD COLUMN "legacy_id" varchar;
  ALTER TABLE "pages_hero_links" ADD CONSTRAINT "pages_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_links" ADD CONSTRAINT "_pages_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_hero_links_order_idx" ON "pages_hero_links" USING btree ("_order");
  CREATE INDEX "pages_hero_links_parent_id_idx" ON "pages_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_hero_links_order_idx" ON "_pages_v_version_hero_links" USING btree ("_order");
  CREATE INDEX "_pages_v_version_hero_links_parent_id_idx" ON "_pages_v_version_hero_links" USING btree ("_parent_id");
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_hero_hero_media_idx" ON "pages" USING btree ("hero_media_id");
  CREATE INDEX "pages_rels_posts_id_idx" ON "pages_rels" USING btree ("posts_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_media_idx" ON "_pages_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_pages_v_rels_posts_id_idx" ON "_pages_v_rels" USING btree ("posts_id");
  ALTER TABLE "pages" DROP COLUMN "hero_image_id";
  ALTER TABLE "pages" DROP COLUMN "excerpt";
  ALTER TABLE "pages_rels" DROP COLUMN "categories_id";
  ALTER TABLE "pages_rels" DROP COLUMN "tags_id";
  ALTER TABLE "pages_rels" DROP COLUMN "users_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_image_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_excerpt";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "categories_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "tags_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "users_id";
  ALTER TABLE "quizzes_personalities" DROP COLUMN "forminator_id";
  ALTER TABLE "quizzes_questions_answers" DROP COLUMN "personality_index";
  ALTER TABLE "quizzes_questions" DROP COLUMN "forminator_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "visitors_id";
  DROP TYPE "public"."enum_pages_blocks_code_language";
  DROP TYPE "public"."enum_pages_blocks_heading_level";
  DROP TYPE "public"."enum_pages_blocks_list_style";
  DROP TYPE "public"."enum_pages_blocks_video_source";
  DROP TYPE "public"."enum_pages_blocks_gallery_columns";
  DROP TYPE "public"."enum_pages_blocks_columns_columns_width";
  DROP TYPE "public"."enum_pages_blocks_pullquote_align";
  DROP TYPE "public"."enum_pages_blocks_buttons_buttons_target";
  DROP TYPE "public"."enum_pages_blocks_buttons_buttons_style";
  DROP TYPE "public"."enum_pages_blocks_buttons_align";
  DROP TYPE "public"."enum__pages_v_blocks_code_language";
  DROP TYPE "public"."enum__pages_v_blocks_heading_level";
  DROP TYPE "public"."enum__pages_v_blocks_list_style";
  DROP TYPE "public"."enum__pages_v_blocks_video_source";
  DROP TYPE "public"."enum__pages_v_blocks_gallery_columns";
  DROP TYPE "public"."enum__pages_v_blocks_columns_columns_width";
  DROP TYPE "public"."enum__pages_v_blocks_pullquote_align";
  DROP TYPE "public"."enum__pages_v_blocks_buttons_buttons_target";
  DROP TYPE "public"."enum__pages_v_blocks_buttons_buttons_style";
  DROP TYPE "public"."enum__pages_v_blocks_buttons_align";`)
}
