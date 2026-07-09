import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_bird_checklists_protocol" AS ENUM('Traveling', 'Stationary', 'Incidental', 'Historical', 'Area');
  CREATE TABLE "bird_checklists" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"import_field" varchar,
  	"private" boolean DEFAULT false,
  	"ebird_checklist_id" varchar,
  	"slug" varchar,
  	"title" varchar,
  	"date" timestamp(3) with time zone,
  	"start_time" varchar,
  	"location_name" varchar,
  	"location_id" varchar,
  	"latitude" numeric,
  	"longitude" numeric,
  	"county" varchar,
  	"state" varchar,
  	"region" varchar,
  	"protocol" "enum_bird_checklists_protocol",
  	"duration" numeric,
  	"distance" numeric,
  	"number_of_observers" numeric,
  	"species_count" numeric,
  	"gps_track" jsonb,
  	"track_distance_km" numeric,
  	"species" jsonb,
  	"notes" varchar,
  	"last_imported_at" timestamp(3) with time zone,
  	"raw_import_data" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "microposts_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"alt" varchar
  );
  
  CREATE TABLE "microposts_syndicated_to" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "microposts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" varchar NOT NULL,
  	"slug" varchar,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum_pages_blocks_buttons_buttons_style";
  CREATE TYPE "public"."enum_pages_blocks_buttons_buttons_style" AS ENUM('primary', 'secondary', 'neutral');
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum_pages_blocks_buttons_buttons_style";
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "style" SET DATA TYPE "public"."enum_pages_blocks_buttons_buttons_style" USING "style"::"public"."enum_pages_blocks_buttons_buttons_style";
  ALTER TABLE "_pages_v_blocks_buttons_buttons" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_buttons_buttons" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum__pages_v_blocks_buttons_buttons_style";
  CREATE TYPE "public"."enum__pages_v_blocks_buttons_buttons_style" AS ENUM('primary', 'secondary', 'neutral');
  ALTER TABLE "_pages_v_blocks_buttons_buttons" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum__pages_v_blocks_buttons_buttons_style";
  ALTER TABLE "_pages_v_blocks_buttons_buttons" ALTER COLUMN "style" SET DATA TYPE "public"."enum__pages_v_blocks_buttons_buttons_style" USING "style"::"public"."enum__pages_v_blocks_buttons_buttons_style";
  ALTER TABLE "posts_blocks_buttons_buttons" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "posts_blocks_buttons_buttons" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum_posts_blocks_buttons_buttons_style";
  CREATE TYPE "public"."enum_posts_blocks_buttons_buttons_style" AS ENUM('primary', 'secondary', 'neutral');
  ALTER TABLE "posts_blocks_buttons_buttons" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum_posts_blocks_buttons_buttons_style";
  ALTER TABLE "posts_blocks_buttons_buttons" ALTER COLUMN "style" SET DATA TYPE "public"."enum_posts_blocks_buttons_buttons_style" USING "style"::"public"."enum_posts_blocks_buttons_buttons_style";
  ALTER TABLE "_posts_v_blocks_buttons_buttons" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "_posts_v_blocks_buttons_buttons" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum__posts_v_blocks_buttons_buttons_style";
  CREATE TYPE "public"."enum__posts_v_blocks_buttons_buttons_style" AS ENUM('primary', 'secondary', 'neutral');
  ALTER TABLE "_posts_v_blocks_buttons_buttons" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum__posts_v_blocks_buttons_buttons_style";
  ALTER TABLE "_posts_v_blocks_buttons_buttons" ALTER COLUMN "style" SET DATA TYPE "public"."enum__posts_v_blocks_buttons_buttons_style" USING "style"::"public"."enum__posts_v_blocks_buttons_buttons_style";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "bird_checklists_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "microposts_id" integer;
  ALTER TABLE "microposts_images" ADD CONSTRAINT "microposts_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "microposts_images" ADD CONSTRAINT "microposts_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."microposts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "microposts_syndicated_to" ADD CONSTRAINT "microposts_syndicated_to_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."microposts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "bird_checklists_ebird_checklist_id_idx" ON "bird_checklists" USING btree ("ebird_checklist_id");
  CREATE INDEX "bird_checklists_slug_idx" ON "bird_checklists" USING btree ("slug");
  CREATE INDEX "bird_checklists_updated_at_idx" ON "bird_checklists" USING btree ("updated_at");
  CREATE INDEX "bird_checklists_created_at_idx" ON "bird_checklists" USING btree ("created_at");
  CREATE INDEX "microposts_images_order_idx" ON "microposts_images" USING btree ("_order");
  CREATE INDEX "microposts_images_parent_id_idx" ON "microposts_images" USING btree ("_parent_id");
  CREATE INDEX "microposts_images_image_idx" ON "microposts_images" USING btree ("image_id");
  CREATE INDEX "microposts_syndicated_to_order_idx" ON "microposts_syndicated_to" USING btree ("_order");
  CREATE INDEX "microposts_syndicated_to_parent_id_idx" ON "microposts_syndicated_to" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "microposts_slug_idx" ON "microposts" USING btree ("slug");
  CREATE INDEX "microposts_updated_at_idx" ON "microposts" USING btree ("updated_at");
  CREATE INDEX "microposts_created_at_idx" ON "microposts" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bird_checklists_fk" FOREIGN KEY ("bird_checklists_id") REFERENCES "public"."bird_checklists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_microposts_fk" FOREIGN KEY ("microposts_id") REFERENCES "public"."microposts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_bird_checklists_id_idx" ON "payload_locked_documents_rels" USING btree ("bird_checklists_id");
  CREATE INDEX "payload_locked_documents_rels_microposts_id_idx" ON "payload_locked_documents_rels" USING btree ("microposts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "bird_checklists" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "microposts_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "microposts_syndicated_to" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "microposts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "bird_checklists" CASCADE;
  DROP TABLE "microposts_images" CASCADE;
  DROP TABLE "microposts_syndicated_to" CASCADE;
  DROP TABLE "microposts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_bird_checklists_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_microposts_fk";
  
  ALTER TABLE "posts_blocks_buttons_buttons" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "posts_blocks_buttons_buttons" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum_posts_blocks_buttons_buttons_style";
  CREATE TYPE "public"."enum_posts_blocks_buttons_buttons_style" AS ENUM('primary', 'secondary', 'outline', 'ghost');
  ALTER TABLE "posts_blocks_buttons_buttons" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum_posts_blocks_buttons_buttons_style";
  ALTER TABLE "posts_blocks_buttons_buttons" ALTER COLUMN "style" SET DATA TYPE "public"."enum_posts_blocks_buttons_buttons_style" USING "style"::"public"."enum_posts_blocks_buttons_buttons_style";
  ALTER TABLE "_posts_v_blocks_buttons_buttons" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "_posts_v_blocks_buttons_buttons" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum__posts_v_blocks_buttons_buttons_style";
  CREATE TYPE "public"."enum__posts_v_blocks_buttons_buttons_style" AS ENUM('primary', 'secondary', 'outline', 'ghost');
  ALTER TABLE "_posts_v_blocks_buttons_buttons" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum__posts_v_blocks_buttons_buttons_style";
  ALTER TABLE "_posts_v_blocks_buttons_buttons" ALTER COLUMN "style" SET DATA TYPE "public"."enum__posts_v_blocks_buttons_buttons_style" USING "style"::"public"."enum__posts_v_blocks_buttons_buttons_style";
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum_pages_blocks_buttons_buttons_style";
  CREATE TYPE "public"."enum_pages_blocks_buttons_buttons_style" AS ENUM('primary', 'secondary', 'outline', 'ghost');
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum_pages_blocks_buttons_buttons_style";
  ALTER TABLE "pages_blocks_buttons_buttons" ALTER COLUMN "style" SET DATA TYPE "public"."enum_pages_blocks_buttons_buttons_style" USING "style"::"public"."enum_pages_blocks_buttons_buttons_style";
  ALTER TABLE "_pages_v_blocks_buttons_buttons" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_buttons_buttons" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum__pages_v_blocks_buttons_buttons_style";
  CREATE TYPE "public"."enum__pages_v_blocks_buttons_buttons_style" AS ENUM('primary', 'secondary', 'outline', 'ghost');
  ALTER TABLE "_pages_v_blocks_buttons_buttons" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum__pages_v_blocks_buttons_buttons_style";
  ALTER TABLE "_pages_v_blocks_buttons_buttons" ALTER COLUMN "style" SET DATA TYPE "public"."enum__pages_v_blocks_buttons_buttons_style" USING "style"::"public"."enum__pages_v_blocks_buttons_buttons_style";
  DROP INDEX "payload_locked_documents_rels_bird_checklists_id_idx";
  DROP INDEX "payload_locked_documents_rels_microposts_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "bird_checklists_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "microposts_id";
  DROP TYPE "public"."enum_bird_checklists_protocol";`)
}
