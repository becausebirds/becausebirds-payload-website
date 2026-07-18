import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_birds_taxonomic_status" AS ENUM('current', 'lumped', 'split', 'deprecated');
  CREATE TABLE "bird_media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"checklist_id_id" integer,
  	"sound_type_tags_song" boolean,
  	"sound_type_tags_call" boolean,
  	"sound_type_tags_flight_song" boolean,
  	"sound_type_tags_flight_call" boolean,
  	"sound_type_tags_mechanical_sound" boolean,
  	"sound_type_tags_dawn_song" boolean,
  	"sound_type_tags_duet" boolean,
  	"rating" numeric,
  	"equipment_recorder" varchar,
  	"equipment_microphone" varchar,
  	"equipment_accessories" varchar,
  	"media_notes" varchar,
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
  	"focal_y" numeric
  );
  
  CREATE TABLE "bird_media_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"birds_id" integer
  );
  
  CREATE TABLE "bird_checklists_species_records" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"bird_id" integer NOT NULL,
  	"count" varchar,
  	"comments" varchar
  );
  
  CREATE TABLE "birds" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"species_code" varchar NOT NULL,
  	"sci_name" varchar NOT NULL,
  	"com_name" varchar NOT NULL,
  	"order" varchar,
  	"family_com_name" varchar,
  	"family_sci_name" varchar,
  	"taxonomic_status" "enum_birds_taxonomic_status" DEFAULT 'current' NOT NULL,
  	"lumped_into_id" integer,
  	"split_from_id" integer,
  	"slug" varchar,
  	"description" varchar,
  	"last_synced_at" timestamp(3) with time zone,
  	"raw_taxonomy_data" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "birds_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"birds_id" integer
  );
  
  ALTER TABLE "comments" ADD COLUMN "reply_bird_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "bird_media_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "birds_id" integer;
  ALTER TABLE "bird_media" ADD CONSTRAINT "bird_media_checklist_id_id_bird_checklists_id_fk" FOREIGN KEY ("checklist_id_id") REFERENCES "public"."bird_checklists"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bird_media_rels" ADD CONSTRAINT "bird_media_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."bird_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bird_media_rels" ADD CONSTRAINT "bird_media_rels_birds_fk" FOREIGN KEY ("birds_id") REFERENCES "public"."birds"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bird_checklists_species_records" ADD CONSTRAINT "bird_checklists_species_records_bird_id_birds_id_fk" FOREIGN KEY ("bird_id") REFERENCES "public"."birds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bird_checklists_species_records" ADD CONSTRAINT "bird_checklists_species_records_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."bird_checklists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "birds" ADD CONSTRAINT "birds_lumped_into_id_birds_id_fk" FOREIGN KEY ("lumped_into_id") REFERENCES "public"."birds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "birds" ADD CONSTRAINT "birds_split_from_id_birds_id_fk" FOREIGN KEY ("split_from_id") REFERENCES "public"."birds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "birds_rels" ADD CONSTRAINT "birds_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."birds"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "birds_rels" ADD CONSTRAINT "birds_rels_birds_fk" FOREIGN KEY ("birds_id") REFERENCES "public"."birds"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "bird_media_checklist_id_idx" ON "bird_media" USING btree ("checklist_id_id");
  CREATE INDEX "bird_media_updated_at_idx" ON "bird_media" USING btree ("updated_at");
  CREATE INDEX "bird_media_created_at_idx" ON "bird_media" USING btree ("created_at");
  CREATE UNIQUE INDEX "bird_media_filename_idx" ON "bird_media" USING btree ("filename");
  CREATE INDEX "bird_media_rels_order_idx" ON "bird_media_rels" USING btree ("order");
  CREATE INDEX "bird_media_rels_parent_idx" ON "bird_media_rels" USING btree ("parent_id");
  CREATE INDEX "bird_media_rels_path_idx" ON "bird_media_rels" USING btree ("path");
  CREATE INDEX "bird_media_rels_birds_id_idx" ON "bird_media_rels" USING btree ("birds_id");
  CREATE INDEX "bird_checklists_species_records_order_idx" ON "bird_checklists_species_records" USING btree ("_order");
  CREATE INDEX "bird_checklists_species_records_parent_id_idx" ON "bird_checklists_species_records" USING btree ("_parent_id");
  CREATE INDEX "bird_checklists_species_records_bird_idx" ON "bird_checklists_species_records" USING btree ("bird_id");
  CREATE UNIQUE INDEX "birds_species_code_idx" ON "birds" USING btree ("species_code");
  CREATE INDEX "birds_sci_name_idx" ON "birds" USING btree ("sci_name");
  CREATE INDEX "birds_lumped_into_idx" ON "birds" USING btree ("lumped_into_id");
  CREATE INDEX "birds_split_from_idx" ON "birds" USING btree ("split_from_id");
  CREATE UNIQUE INDEX "birds_slug_idx" ON "birds" USING btree ("slug");
  CREATE INDEX "birds_updated_at_idx" ON "birds" USING btree ("updated_at");
  CREATE INDEX "birds_created_at_idx" ON "birds" USING btree ("created_at");
  CREATE INDEX "birds_rels_order_idx" ON "birds_rels" USING btree ("order");
  CREATE INDEX "birds_rels_parent_idx" ON "birds_rels" USING btree ("parent_id");
  CREATE INDEX "birds_rels_path_idx" ON "birds_rels" USING btree ("path");
  CREATE INDEX "birds_rels_birds_id_idx" ON "birds_rels" USING btree ("birds_id");
  ALTER TABLE "comments" ADD CONSTRAINT "comments_reply_bird_id_birds_id_fk" FOREIGN KEY ("reply_bird_id") REFERENCES "public"."birds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bird_media_fk" FOREIGN KEY ("bird_media_id") REFERENCES "public"."bird_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_birds_fk" FOREIGN KEY ("birds_id") REFERENCES "public"."birds"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "comments_reply_bird_idx" ON "comments" USING btree ("reply_bird_id");
  CREATE INDEX "bird_checklists_location_id_idx" ON "bird_checklists" USING btree ("location_id");
  CREATE INDEX "bird_checklists_county_idx" ON "bird_checklists" USING btree ("county");
  CREATE INDEX "bird_checklists_state_idx" ON "bird_checklists" USING btree ("state");
  CREATE INDEX "bird_checklists_region_idx" ON "bird_checklists" USING btree ("region");
  CREATE INDEX "payload_locked_documents_rels_bird_media_id_idx" ON "payload_locked_documents_rels" USING btree ("bird_media_id");
  CREATE INDEX "payload_locked_documents_rels_birds_id_idx" ON "payload_locked_documents_rels" USING btree ("birds_id");
  ALTER TABLE "microposts_images" DROP COLUMN "alt";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "bird_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "bird_media_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "bird_checklists_species_records" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "birds" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "birds_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "bird_media" CASCADE;
  DROP TABLE "bird_media_rels" CASCADE;
  DROP TABLE "bird_checklists_species_records" CASCADE;
  DROP TABLE "birds" CASCADE;
  DROP TABLE "birds_rels" CASCADE;
  ALTER TABLE "comments" DROP CONSTRAINT "comments_reply_bird_id_birds_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_bird_media_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_birds_fk";
  
  DROP INDEX "comments_reply_bird_idx";
  DROP INDEX "bird_checklists_location_id_idx";
  DROP INDEX "bird_checklists_county_idx";
  DROP INDEX "bird_checklists_state_idx";
  DROP INDEX "bird_checklists_region_idx";
  DROP INDEX "payload_locked_documents_rels_bird_media_id_idx";
  DROP INDEX "payload_locked_documents_rels_birds_id_idx";
  ALTER TABLE "microposts_images" ADD COLUMN "alt" varchar;
  ALTER TABLE "comments" DROP COLUMN "reply_bird_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "bird_media_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "birds_id";
  DROP TYPE "public"."enum_birds_taxonomic_status";`)
}
