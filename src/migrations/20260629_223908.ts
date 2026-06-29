import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_blocks_bar_chart_series1_color" AS ENUM('chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5');
  CREATE TYPE "public"."enum_posts_blocks_bar_chart_series2_color" AS ENUM('chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5');
  CREATE TYPE "public"."enum_posts_blocks_map_map_type" AS ENUM('dots', 'heatmap');
  CREATE TYPE "public"."enum__posts_v_blocks_bar_chart_series1_color" AS ENUM('chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5');
  CREATE TYPE "public"."enum__posts_v_blocks_bar_chart_series2_color" AS ENUM('chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5');
  CREATE TYPE "public"."enum__posts_v_blocks_map_map_type" AS ENUM('dots', 'heatmap');
  CREATE TABLE "posts_blocks_bar_chart_chart_data" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value1" numeric,
  	"value2" numeric
  );
  
  CREATE TABLE "posts_blocks_bar_chart" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"caption" varchar,
  	"series1_label" varchar DEFAULT 'Desktop',
  	"series1_color" "enum_posts_blocks_bar_chart_series1_color" DEFAULT 'chart-1',
  	"series2_label" varchar DEFAULT 'Mobile',
  	"series2_color" "enum_posts_blocks_bar_chart_series2_color" DEFAULT 'chart-2',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_map" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"map_type" "enum_posts_blocks_map_map_type" DEFAULT 'dots',
  	"csv_file_id" integer,
  	"csv_data" varchar,
  	"show_hotspots_only" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_bar_chart_chart_data" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value1" numeric,
  	"value2" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_bar_chart" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"caption" varchar,
  	"series1_label" varchar DEFAULT 'Desktop',
  	"series1_color" "enum__posts_v_blocks_bar_chart_series1_color" DEFAULT 'chart-1',
  	"series2_label" varchar DEFAULT 'Mobile',
  	"series2_color" "enum__posts_v_blocks_bar_chart_series2_color" DEFAULT 'chart-2',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_map" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"map_type" "enum__posts_v_blocks_map_map_type" DEFAULT 'dots',
  	"csv_file_id" integer,
  	"csv_data" varchar,
  	"show_hotspots_only" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "posts_blocks_bar_chart_chart_data" ADD CONSTRAINT "posts_blocks_bar_chart_chart_data_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_bar_chart"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_bar_chart" ADD CONSTRAINT "posts_blocks_bar_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_map" ADD CONSTRAINT "posts_blocks_map_csv_file_id_media_id_fk" FOREIGN KEY ("csv_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_map" ADD CONSTRAINT "posts_blocks_map_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_bar_chart_chart_data" ADD CONSTRAINT "_posts_v_blocks_bar_chart_chart_data_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_bar_chart"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_bar_chart" ADD CONSTRAINT "_posts_v_blocks_bar_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_map" ADD CONSTRAINT "_posts_v_blocks_map_csv_file_id_media_id_fk" FOREIGN KEY ("csv_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_map" ADD CONSTRAINT "_posts_v_blocks_map_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_blocks_bar_chart_chart_data_order_idx" ON "posts_blocks_bar_chart_chart_data" USING btree ("_order");
  CREATE INDEX "posts_blocks_bar_chart_chart_data_parent_id_idx" ON "posts_blocks_bar_chart_chart_data" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_bar_chart_order_idx" ON "posts_blocks_bar_chart" USING btree ("_order");
  CREATE INDEX "posts_blocks_bar_chart_parent_id_idx" ON "posts_blocks_bar_chart" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_bar_chart_path_idx" ON "posts_blocks_bar_chart" USING btree ("_path");
  CREATE INDEX "posts_blocks_map_order_idx" ON "posts_blocks_map" USING btree ("_order");
  CREATE INDEX "posts_blocks_map_parent_id_idx" ON "posts_blocks_map" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_map_path_idx" ON "posts_blocks_map" USING btree ("_path");
  CREATE INDEX "posts_blocks_map_csv_file_idx" ON "posts_blocks_map" USING btree ("csv_file_id");
  CREATE INDEX "_posts_v_blocks_bar_chart_chart_data_order_idx" ON "_posts_v_blocks_bar_chart_chart_data" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_bar_chart_chart_data_parent_id_idx" ON "_posts_v_blocks_bar_chart_chart_data" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_bar_chart_order_idx" ON "_posts_v_blocks_bar_chart" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_bar_chart_parent_id_idx" ON "_posts_v_blocks_bar_chart" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_bar_chart_path_idx" ON "_posts_v_blocks_bar_chart" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_map_order_idx" ON "_posts_v_blocks_map" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_map_parent_id_idx" ON "_posts_v_blocks_map" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_map_path_idx" ON "_posts_v_blocks_map" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_map_csv_file_idx" ON "_posts_v_blocks_map" USING btree ("csv_file_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "posts_blocks_bar_chart_chart_data" CASCADE;
  DROP TABLE "posts_blocks_bar_chart" CASCADE;
  DROP TABLE "posts_blocks_map" CASCADE;
  DROP TABLE "_posts_v_blocks_bar_chart_chart_data" CASCADE;
  DROP TABLE "_posts_v_blocks_bar_chart" CASCADE;
  DROP TABLE "_posts_v_blocks_map" CASCADE;
  DROP TYPE "public"."enum_posts_blocks_bar_chart_series1_color";
  DROP TYPE "public"."enum_posts_blocks_bar_chart_series2_color";
  DROP TYPE "public"."enum_posts_blocks_map_map_type";
  DROP TYPE "public"."enum__posts_v_blocks_bar_chart_series1_color";
  DROP TYPE "public"."enum__posts_v_blocks_bar_chart_series2_color";
  DROP TYPE "public"."enum__posts_v_blocks_map_map_type";`)
}
