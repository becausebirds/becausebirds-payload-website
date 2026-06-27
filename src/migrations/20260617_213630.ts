import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_quizzes_questions_answers_personality" AS ENUM('');
  CREATE TABLE "quizzes_personalities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"legacy_id" varchar,
  	"title" varchar NOT NULL,
  	"description" jsonb,
  	"image_id" integer
  );
  
  CREATE TABLE "quizzes_questions_answers" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"personality" "enum_quizzes_questions_answers_personality" NOT NULL
  );
  
  CREATE TABLE "quizzes_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"legacy_id" varchar,
  	"title" varchar NOT NULL,
  	"featured_image_id" integer
  );
  
  CREATE TABLE "quizzes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "comments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"author" varchar,
  	"email" varchar,
  	"date" timestamp(3) with time zone,
  	"content" varchar,
  	"reply_post_id" integer,
  	"reply_comment_id" integer,
  	"is_approved" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "quizzes_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "comments_id" integer;
  ALTER TABLE "quizzes_personalities" ADD CONSTRAINT "quizzes_personalities_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quizzes_personalities" ADD CONSTRAINT "quizzes_personalities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quizzes_questions_answers" ADD CONSTRAINT "quizzes_questions_answers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quizzes_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quizzes_questions" ADD CONSTRAINT "quizzes_questions_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quizzes_questions" ADD CONSTRAINT "quizzes_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "comments" ADD CONSTRAINT "comments_reply_post_id_posts_id_fk" FOREIGN KEY ("reply_post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "comments" ADD CONSTRAINT "comments_reply_comment_id_comments_id_fk" FOREIGN KEY ("reply_comment_id") REFERENCES "public"."comments"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "quizzes_personalities_order_idx" ON "quizzes_personalities" USING btree ("_order");
  CREATE INDEX "quizzes_personalities_parent_id_idx" ON "quizzes_personalities" USING btree ("_parent_id");
  CREATE INDEX "quizzes_personalities_image_idx" ON "quizzes_personalities" USING btree ("image_id");
  CREATE INDEX "quizzes_questions_answers_order_idx" ON "quizzes_questions_answers" USING btree ("_order");
  CREATE INDEX "quizzes_questions_answers_parent_id_idx" ON "quizzes_questions_answers" USING btree ("_parent_id");
  CREATE INDEX "quizzes_questions_order_idx" ON "quizzes_questions" USING btree ("_order");
  CREATE INDEX "quizzes_questions_parent_id_idx" ON "quizzes_questions" USING btree ("_parent_id");
  CREATE INDEX "quizzes_questions_featured_image_idx" ON "quizzes_questions" USING btree ("featured_image_id");
  CREATE UNIQUE INDEX "quizzes_slug_idx" ON "quizzes" USING btree ("slug");
  CREATE INDEX "quizzes_updated_at_idx" ON "quizzes" USING btree ("updated_at");
  CREATE INDEX "quizzes_created_at_idx" ON "quizzes" USING btree ("created_at");
  CREATE INDEX "comments_reply_post_idx" ON "comments" USING btree ("reply_post_id");
  CREATE INDEX "comments_reply_comment_idx" ON "comments" USING btree ("reply_comment_id");
  CREATE INDEX "comments_updated_at_idx" ON "comments" USING btree ("updated_at");
  CREATE INDEX "comments_created_at_idx" ON "comments" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quizzes_fk" FOREIGN KEY ("quizzes_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_comments_fk" FOREIGN KEY ("comments_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_quizzes_id_idx" ON "payload_locked_documents_rels" USING btree ("quizzes_id");
  CREATE INDEX "payload_locked_documents_rels_comments_id_idx" ON "payload_locked_documents_rels" USING btree ("comments_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "quizzes_personalities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quizzes_questions_answers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quizzes_questions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quizzes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "comments" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "quizzes_personalities" CASCADE;
  DROP TABLE "quizzes_questions_answers" CASCADE;
  DROP TABLE "quizzes_questions" CASCADE;
  DROP TABLE "quizzes" CASCADE;
  DROP TABLE "comments" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_quizzes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_comments_fk";
  
  DROP INDEX "payload_locked_documents_rels_quizzes_id_idx";
  DROP INDEX "payload_locked_documents_rels_comments_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "quizzes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "comments_id";
  DROP TYPE "public"."enum_quizzes_questions_answers_personality";`)
}
