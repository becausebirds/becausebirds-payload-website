import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "microposts_slug_idx";
  ALTER TABLE "microposts_syndicated_to" ALTER COLUMN "platform" SET NOT NULL;
  ALTER TABLE "microposts_syndicated_to" ALTER COLUMN "url" SET NOT NULL;
  ALTER TABLE "microposts_images" ADD COLUMN "alt" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "microposts_syndicated_to" ALTER COLUMN "platform" DROP NOT NULL;
  ALTER TABLE "microposts_syndicated_to" ALTER COLUMN "url" DROP NOT NULL;
  CREATE UNIQUE INDEX "microposts_slug_idx" ON "microposts" USING btree ("slug");
  ALTER TABLE "microposts_images" DROP COLUMN "alt";`)
}
